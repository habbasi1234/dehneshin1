import { Router } from 'express'
import { randomBytes, createHash } from 'crypto'
import { existsSync, appendFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import Setting from '../models/Setting.js'
import User from '../models/User.js'
import Customer from '../models/Customer.js'
import Notification from '../models/Notification.js'
import SmsLog from '../models/SmsLog.js'
import { requireAdmin, requireAuth, ADMIN_ROLES } from '../middleware/auth.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LOG_PATH = join(__dirname, '..', 'logs')
const router = Router()

if (!existsSync(LOG_PATH)) mkdirSync(LOG_PATH, { recursive: true })

async function getSettings() {
  try {
    const s = await Setting.findById('global').lean()
    return s || {}
  } catch { return {} }
}

async function getOtpConfig() {
  try {
    const s = await getSettings()
    return {
      enabled: s.otpEnabled !== false,
      length: parseInt(s.otpLength) || 5,
      expiry: parseInt(s.otpExpiry) || 180,
      maxAttempts: parseInt(s.otpMaxAttempts) || 3,
    }
  } catch { return { enabled: true, length: 5, expiry: 180, maxAttempts: 3 } }
}

function normalizeMobile(m) {
  let s = String(m).replace(/[\s\-]/g, '').replace(/^(\+|00)?98/, '')
  if (s.startsWith('0')) s = s.slice(1)
  return s
}

function findSmsProvider(settings, purpose) {
  const providers = settings.smsProviders || []
  const legacy = (!providers.length && settings.smsApiKey) ? [{
    id: 'legacy', name: 'sms.ir', enabled: true,
    forOTP: true, forNotification: true,
    apiKey: settings.smsApiKey, lineNumber: settings.smsLineNumber || '',
    templateId: settings.smsTemplateId || '',
    apiBaseUrl: settings.smsApiBaseUrl || 'https://api.sms.ir/v1',
  }] : []
  const all = legacy.length ? legacy : providers
  return all.find(p => p.enabled && (purpose === 'otp' ? p.forOTP : p.forNotification)) || all.find(p => p.enabled) || null
}

async function sendSms(provider, mobile, text, mode) {
  if (!provider?.apiKey) return null
  const baseUrl = (provider.apiBaseUrl || 'https://api.sms.ir/v1').replace(/\/+$/, '')
  const templateId = parseInt(provider.templateId)
  let url, body
  if (mode === 'verify' && templateId) {
    url = `${baseUrl}/send/verify`
    body = JSON.stringify({ mobile, templateId, parameters: [{ name: 'Code', value: String(text).slice(0, 25) }] })
  } else {
    url = `${baseUrl}/send/bulk`
    body = JSON.stringify({ lineNumber: provider.lineNumber || undefined, messageText: String(text).slice(0, 200), mobiles: [mobile] })
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'X-API-KEY': provider.apiKey, 'Content-Type': 'application/json' },
    body,
    signal: AbortSignal.timeout(10000),
  })
  const data = await res.json()
  const messageId = data?.data?.messageId || (Array.isArray(data?.data) ? data.data[0] : null)
  if (data.status !== 1) console.error(`📱 SMS ERROR -> status:${data.status} msg:${data.message} mobile:${mobile} body:${body}`)
  else console.log(`📱 SMS -> ${mobile} (mode: ${mode}, messageId: ${messageId}, status: ${data.status})`)
  return messageId || null
}

async function sendSmsIrVerify(to, code) {
  try {
    const s = await getSettings()
    const provider = findSmsProvider(s, 'otp')
    if (!provider) return null
    const mobile = normalizeMobile(to)
    const templateId = parseInt(provider.templateId)
    return await sendSms(provider, mobile, code, templateId ? 'verify' : 'bulk')
  } catch (e) {
    console.log(`📱 SMS FAILED -> ${to}: ${e.message}`)
    return null
  }
}

function logSms(to, code, messageId) {
  try { SmsLog.create({ to, code, messageId, deliveryState: null }) } catch {}
}

async function notify(type, to, subject, message) {
  const entry = { id: Date.now(), type, to, subject, message, sentAt: new Date().toISOString(), status: 'sent' }
  try { await Notification.create(entry) } catch {}
  appendFileSync(join(LOG_PATH, 'notifications.log'), `[${entry.sentAt}] ${type.toUpperCase()} => ${to} | ${subject} | ${message}\n`)
  console.log(`📧 ${type.toUpperCase()}: ${to} - ${subject}`)
  if (type === 'sms') sendSmsIrVerify(to, message).then(mid => { if (mid) logSms(to, message, mid) })
}

function generateToken() {
  return randomBytes(32).toString('hex') + '-' + Date.now()
}

function validateToken(token) {
  if (!token) return null
  const parts = token.split('-')
  if (parts.length < 2) return null
  const ts = parseInt(parts[parts.length - 1])
  if (!ts || Date.now() - ts > 86400000) return null
  if (parts[0] === 'az' && parts[1] === 'token') {
    const userId = parseInt(parts[2])
    if (!userId || userId <= 0) return null
    return String(userId)
  }
  return null
}

async function findAndVerifyUser(username, password) {
  let user = await User.findOne({ username }).lean()
  let collection = 'User'
  if (!user) {
    user = await Customer.findOne({ username }).lean()
    collection = 'Customer'
  }
  if (!user) return null
  const isBcrypt = user.password?.startsWith('$2a$') || user.password?.startsWith('$2b$')
  const valid = isBcrypt ? await bcrypt.compare(password, user.password) : user.password === password
  if (!valid) return null
  return { user, collection }
}

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'نام کاربری و رمز عبور الزامی است' })
  try {
    const result = await findAndVerifyUser(username, password)
    if (!result) return res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است' })
    const { password: _, ...safe } = result.user
    const token = generateToken()
    res.json({ success: true, token, user: safe })
  } catch { res.status(500).json({ error: 'Server error' }) }
})

router.post('/register', async (req, res) => {
  const { username, password, name, phone, email } = req.body
  if (!username || !password) return res.status(400).json({ error: 'نام کاربری و رمز عبور الزامی است' })
  if (password.length < 6) return res.status(400).json({ error: 'رمز عبور حداقل ۶ کاراکتر باشد' })
  try {
    const existing = await Customer.findOne({ username }).lean()
    if (existing) return res.status(400).json({ error: 'نام کاربری تکراری است' })
    const hashed = await bcrypt.hash(password, 12)
    const newUser = await Customer.create({ id: Date.now(), username, password: hashed, role: 'customer', tier: 'bronze', name: name || '', phone: phone || '', email: email || '', createdAt: new Date().toISOString() })
    if (newUser.email) notify('email', newUser.email, 'خوش آمدید به ده نشین', `${newUser.name || newUser.username} عزیز، ثبت‌نام شما با موفقیت انجام شد.`)
    if (newUser.phone) notify('sms', newUser.phone, '', `${newUser.name || newUser.username} عزیز، ثبت‌نام شما در ده نشین با موفقیت انجام شد.`)
    const { password: _, ...safe } = newUser.toObject()
    res.status(201).json({ success: true, user: safe })
  } catch (e) { res.status(500).json({ error: 'خطا در ثبت‌نام' }) }
})

router.get('/profile', requireAuth, async (req, res) => {
  try {
    const { password, ...safe } = req.user
    res.json(safe)
  } catch { res.status(500).json({ error: 'Server error' }) }
})

router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { name, phone, email } = req.body
    const update = {}
    if (name !== undefined) update.name = name
    if (phone !== undefined) update.phone = phone
    if (email !== undefined) update.email = email
    const Model = req.user.role && ADMIN_ROLES.includes(req.user.role) ? User : Customer
    const user = await Model.findOneAndUpdate({ id: req.user.id }, { $set: update }, { new: true }).lean()
    if (!user) return res.status(404).json({ error: 'کاربر یافت نشد' })
    const { password: _, ...safe } = user
    res.json(safe)
  } catch { res.status(500).json({ error: 'Server error' }) }
})

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ADMIN_ROLES } }).lean()
    res.json(users.map(({ password, ...u }) => u))
  } catch { res.json([]) }
})

router.get('/customers', async (req, res) => {
  try {
    const customers = await Customer.find({ username: { $ne: null } }).lean()
    res.json(customers.map(({ password, ...c }) => c))
  } catch { res.json([]) }
})

router.put('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { password, role, ...rest } = req.body
    const update = { ...rest }
    if (role) update.role = role
    if (password) update.password = await bcrypt.hash(password, 12)
    const user = await User.findOneAndUpdate({ id: parseInt(req.params.id) }, { $set: update }, { new: true }).lean()
    if (!user) return res.status(404).json({ error: 'کاربر یافت نشد' })
    const { password: _, ...safe } = user
    res.json(safe)
  } catch { res.status(500).json({ error: 'Server error' }) }
})

router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    if (req.user.id === parseInt(req.params.id)) return res.status(400).json({ error: 'نمی‌توانید خودتان را حذف کنید' })
    const target = await User.findOne({ id: parseInt(req.params.id) }).lean()
    if (!target) return res.status(404).json({ error: 'کاربر یافت نشد' })
    if (target.role === 'superadmin') return res.status(403).json({ error: 'نمی‌توان مدیر ارشد را حذف کرد' })
    const superadminCount = await User.countDocuments({ role: 'superadmin' })
    if (superadminCount <= 1 && req.user.role !== 'superadmin') return res.status(403).json({ error: 'تنها مدیر ارشد می‌تواند آخرین مدیر ارشد را حذف کند' })
    await User.deleteOne({ id: parseInt(req.params.id) })
    res.json({ success: true })
  } catch { res.status(500).json({ success: false, error: 'خطای سرور' }) }
})

function checkPasswordComplexity(password) {
  const errors = []
  if (password.length < 8) errors.push('حداقل ۸ کاراکتر')
  if (!/[A-Z]/.test(password)) errors.push('حداقل یک حرف بزرگ لاتین')
  if (!/[a-z]/.test(password)) errors.push('حداقل یک حرف کوچک لاتین')
  if (!/[0-9]/.test(password)) errors.push('حداقل یک عدد')
  if (!/[!@#$%^&*(),.?":{}|<>\-_]/.test(password)) errors.push('حداقل یک کاراکتر خاص')
  return errors
}

router.put('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'رمز فعلی و جدید الزامی است' })
    const Model = req.user.role && ADMIN_ROLES.includes(req.user.role) ? User : Customer
    const user = await Model.findOne({ id: req.user.id })
    if (!user) return res.status(404).json({ error: 'کاربر یافت نشد' })
    const valid = user.password?.startsWith('$2a$') || user.password?.startsWith('$2b$')
      ? await bcrypt.compare(currentPassword, user.password)
      : user.password === currentPassword
    if (!valid) return res.status(401).json({ error: 'رمز فعلی اشتباه است' })
    const errors = checkPasswordComplexity(newPassword)
    if (errors.length > 0) return res.status(400).json({ error: 'رمز عبور باید شامل: ' + errors.join('، ') })
    await Model.updateOne({ id: req.user.id }, { $set: { password: await bcrypt.hash(newPassword, 12) } })
    res.json({ success: true, message: 'رمز عبور با موفقیت تغییر یافت' })
  } catch { res.status(500).json({ error: 'Server error' }) }
})

router.post('/forgot-password', async (req, res) => {
  try {
    const { phone, username } = req.body
    if (!phone && !username) return res.status(400).json({ error: 'شماره موبایل یا نام کاربری الزامی است' })
    const query = phone ? { phone } : { username }
    const user = await User.findOne(query).lean()
    if (!user) return res.status(404).json({ error: 'کاربر یافت نشد' })
    if (!user.phone) return res.status(400).json({ error: 'این کاربر شماره موبایل ثبت شده ندارد' })
    const otp = generateOtp(6)
    const key = 'reset-password:' + user.phone
    otpStore[key] = { code: otp, expires: Date.now() + 180000, userId: user.id }
    setTimeout(() => { delete otpStore[key] }, 180000)
    notify('sms', user.phone, '', `کد بازیابی رمز عبور: ${otp}`)
    console.log(`🔑 Reset OTP for ${user.username} -> ${user.phone}: ${otp}`)
    res.json({ success: true, message: 'کد بازیابی به شماره شما ارسال شد' })
  } catch { res.status(500).json({ error: 'Server error' }) }
})

router.post('/reset-password', async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body
    if (!phone || !otp || !newPassword) return res.status(400).json({ error: 'تمامی فیلدها الزامی است' })
    const key = 'reset-password:' + phone
    const record = otpStore[key]
    if (!record) return res.status(400).json({ error: 'کد منقضی شده است' })
    if (record.code !== otp) return res.status(401).json({ error: 'کد اشتباه است' })
    const errors = checkPasswordComplexity(newPassword)
    if (errors.length > 0) return res.status(400).json({ error: 'رمز عبور باید شامل: ' + errors.join('، ') })
    const hashed = await bcrypt.hash(newPassword, 12)
    await User.updateOne({ id: record.userId }, { $set: { password: hashed } })
    delete otpStore[key]
    res.json({ success: true, message: 'رمز عبور با موفقیت تغییر یافت' })
  } catch { res.status(500).json({ error: 'Server error' }) }
})

const otpStore = {}
const captchaStore = {}

function generateOtp(length) {
  const min = Math.pow(10, length - 1)
  const max = Math.pow(10, length) - 1
  return String(Math.floor(min + Math.random() * (max - min + 1)))
}

function generateCaptcha() {
  const ops = ['+', '-']
  const op = ops[Math.floor(Math.random() * ops.length)]
  let a, b, ans
  if (op === '+') { a = Math.floor(Math.random() * 20) + 1; b = Math.floor(Math.random() * 20) + 1; ans = a + b }
  else { a = Math.floor(Math.random() * 15) + 5; b = Math.floor(Math.random() * a) + 1; ans = a - b }
  const id = Date.now() + '-' + Math.random().toString(36).slice(2, 6)
  captchaStore[id] = ans
  setTimeout(() => delete captchaStore[id], 120000)
  return { id, question: `${a} ${op === '+' ? '➕' : '➖'} ${b} = ?` }
}

function verifyCaptcha(id, answer) {
  const expected = captchaStore[id]
  if (!expected) return false
  delete captchaStore[id]
  return parseInt(answer) === expected
}

router.post('/send-otp', async (req, res) => {
  const cfg = await getOtpConfig()
  if (!cfg.enabled) return res.status(403).json({ error: 'کد تأیید غیرفعال است' })
  const { phone, captchaId, captchaAnswer } = req.body
  if (!phone) return res.status(400).json({ error: 'شماره موبایل الزامی است' })
  if (!captchaId || !verifyCaptcha(captchaId, captchaAnswer)) return res.status(400).json({ error: 'کد امنیتی اشتباه است' })
  try {
    const customer = await Customer.findOne({ phone: phone.trim() }).lean()
    if (!customer) return res.status(404).json({ error: 'شماره موبایل در باشگاه مشتریان یافت نشد' })
    const otp = generateOtp(cfg.length)
    const ttl = cfg.expiry * 1000
    const key = 'otp:' + phone
    otpStore[key] = { code: otp, expires: Date.now() + ttl, attempts: 0 }
    setTimeout(() => { delete otpStore[key] }, ttl)
    notify('sms', phone, '', `کد تایید شما: ${otp}`)
    console.log(`🔐 OTP for ${phone}: ${otp}`)
    res.json({ success: true, message: 'کد تایید ارسال شد' })
  } catch { res.status(500).json({ error: 'Server error' }) }
})

router.post('/admin/send-otp', async (req, res) => {
  const cfg = await getOtpConfig()
  const { username, password, phone, captchaId, captchaAnswer } = req.body
  if (!captchaId || !verifyCaptcha(captchaId, captchaAnswer)) return res.status(400).json({ error: 'کد امنیتی اشتباه است' })
  try {
    const user = await User.findOne({ username }).lean()
    if (!user) return res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است' })
    const valid = user.password?.startsWith('$2a$') || user.password?.startsWith('$2b$')
      ? await bcrypt.compare(password, user.password)
      : user.password === password
    if (!valid) return res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است' })
    if (!cfg.enabled) {
      const { password: _, ...safe } = user
      return res.json({ success: true, token: 'az-token-' + user.id + '-' + Date.now(), user: safe, direct: true })
    }
    if (!phone) return res.status(400).json({ error: 'شماره موبایل الزامی است' })
    const otp = generateOtp(cfg.length)
    const ttl = cfg.expiry * 1000
    const key = 'admin-otp:' + username
    otpStore[key] = { code: otp, expires: Date.now() + ttl, attempts: 0, userId: user.id }
    setTimeout(() => { delete otpStore[key] }, ttl)
    notify('sms', phone, '', `کد ورود به پنل مدیریت: ${otp}`)
    console.log(`🔐 Admin OTP for ${username} -> ${phone}: ${otp}`)
    res.json({ success: true, message: 'کد تایید ارسال شد' })
  } catch { res.status(500).json({ error: 'Server error' }) }
})

router.post('/admin/login', async (req, res) => {
  const cfg = await getOtpConfig()
  const { username, otp } = req.body
  if (!username || !otp) return res.status(400).json({ error: 'نام کاربری و کد تایید الزامی است' })
  const key = 'admin-otp:' + username
  const record = otpStore[key]
  if (!record) return res.status(400).json({ error: 'کد تایید منقضی شده است' })
  if (record.attempts >= cfg.maxAttempts) { delete otpStore[key]; return res.status(429).json({ error: 'تعداد تلاش زیاد، دوباره درخواست کد کنید' }) }
  if (record.code !== otp) { record.attempts++; return res.status(401).json({ error: 'کد تایید اشتباه است' }) }
  delete otpStore[key]
  try {
    const user = await User.findOne({ id: record.userId }).lean()
    if (!user) return res.status(404).json({ error: 'کاربر یافت نشد' })
    const { password: _, ...safe } = user
    res.json({ success: true, token: 'az-token-' + user.id + '-' + Date.now(), user: safe })
  } catch { res.status(500).json({ error: 'Server error' }) }
})

router.post('/verify-otp', async (req, res) => {
  const cfg = await getOtpConfig()
  const { phone, otp } = req.body
  if (!phone || !otp) return res.status(400).json({ error: 'شماره موبایل و کد تایید الزامی است' })
  const key = 'otp:' + phone
  const record = otpStore[key]
  if (!record) return res.status(400).json({ error: 'کد تایید منقضی شده است' })
  if (record.attempts >= cfg.maxAttempts) { delete otpStore[key]; return res.status(429).json({ error: 'تعداد تلاش زیاد، دوباره درخواست کد کنید' }) }
  if (record.code !== otp) { record.attempts++; return res.status(401).json({ error: 'کد تایید اشتباه است' }) }
  delete otpStore[key]
  try {
    const customer = await Customer.findOne({ phone }).lean()
    if (!customer) return res.status(404).json({ error: 'مشتری با این شماره یافت نشد' })
    res.json({ success: true, customer })
  } catch { res.status(500).json({ error: 'Server error' }) }
})

router.get('/captcha', (req, res) => res.json(generateCaptcha()))

function getApiKey(settings) {
  const p = findSmsProvider(settings, 'otp') || findSmsProvider(settings, 'notification')
  return p ? { apiKey: p.apiKey, baseUrl: p.apiBaseUrl || 'https://api.sms.ir/v1' } : null
}

router.get('/sms/lines', async (req, res) => {
  try {
    const s = await getSettings()
    const auth = getApiKey(s)
    if (!auth) return res.json({ lines: [], error: 'API Key پیکربندی نشده' })
    const baseUrl = auth.baseUrl.replace(/\/+$/, '')
    const resp = await fetch(`${baseUrl}/line`, {
      headers: { 'Accept': 'application/json', 'X-API-KEY': auth.apiKey },
      signal: AbortSignal.timeout(10000),
    })
    const data = await resp.json()
    res.json({ lines: data?.data ?? [] })
  } catch (e) { res.json({ lines: [], error: e.message }) }
})

router.get('/sms/credit', async (req, res) => {
  try {
    const s = await getSettings()
    const auth = getApiKey(s)
    if (!auth) return res.json({ credit: null, error: 'API Key پیکربندی نشده' })
    const baseUrl = auth.baseUrl.replace(/\/+$/, '')
    const resp = await fetch(`${baseUrl}/credit`, {
      headers: { 'Accept': 'application/json', 'X-API-KEY': auth.apiKey },
      signal: AbortSignal.timeout(10000),
    })
    const data = await resp.json()
    res.json({ credit: data?.data ?? null })
  } catch (e) { res.json({ credit: null, error: e.message }) }
})

router.get('/sms/status/:messageId', async (req, res) => {
  try {
    const s = await getSettings()
    const auth = getApiKey(s)
    if (!auth) return res.status(400).json({ error: 'API Key پیکربندی نشده' })
    const baseUrl = auth.baseUrl.replace(/\/+$/, '')
    const resp = await fetch(`${baseUrl}/send/${req.params.messageId}`, {
      headers: { 'Accept': 'application/json', 'X-API-KEY': auth.apiKey },
      signal: AbortSignal.timeout(10000),
    })
    const data = await resp.json()
    res.json(data)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/sms/log', async (req, res) => {
  try {
    const logs = await SmsLog.find({}).sort({ _id: -1 }).limit(100).lean()
    res.json(logs)
  } catch { res.json([]) }
})

router.post('/sms/check-all', requireAdmin, async (req, res) => {
  try {
    const s = await getSettings()
    const auth = getApiKey(s)
    if (!auth) return res.status(400).json({ error: 'API Key پیکربندی نشده' })
    const baseUrl = auth.baseUrl.replace(/\/+$/, '')
    const logs = await SmsLog.find({ deliveryState: null, messageId: { $ne: null } }).lean()
    let updated = 0
    for (const entry of logs) {
      try {
        const resp = await fetch(`${baseUrl}/send/${entry.messageId}`, {
          headers: { 'Accept': 'application/json', 'X-API-KEY': auth.apiKey },
          signal: AbortSignal.timeout(5000),
        })
        const data = await resp.json()
        if (data?.data) {
          await SmsLog.updateOne({ _id: entry._id }, { $set: { deliveryState: data.data.deliveryState, deliveryDateTime: data.data.deliveryDateTime } })
          updated++
        }
      } catch {}
    }
    res.json({ updated, total: logs.length })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

export default router
