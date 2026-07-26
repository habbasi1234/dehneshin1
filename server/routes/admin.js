import { Router } from 'express'
import { existsSync, mkdirSync, appendFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import Product from '../models/Product.js'
import Category from '../models/Category.js'
import Message from '../models/Message.js'
import Order from '../models/Order.js'
import User from '../models/User.js'
import Customer from '../models/Customer.js'
import Setting from '../models/Setting.js'
import Model3D from '../models/Model3D.js'
import { requireAdmin, validateId, ADMIN_ROLES } from '../middleware/auth.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const router = Router()

async function getSettingsDoc() {
  let doc = await Setting.findById('global').lean()
  if (!doc) {
    await Setting.create({ _id: 'global' })
    doc = await Setting.findById('global').lean()
  }
  return doc
}

router.get('/stats', async (req, res) => {
  try {
    const [products, categories, messages, orders, admins, customers] = await Promise.all([
      Product.countDocuments(), Category.countDocuments(),
      Message.find({}).lean(), Order.find({}).lean(),
      User.countDocuments({ role: { $in: ADMIN_ROLES } }),
      Customer.countDocuments({ username: { $ne: null } }),
    ])
    res.json({
      totalProducts: products,
      totalCategories: categories,
      totalMessages: messages.length,
      unreadMessages: messages.filter(m => !m.read).length,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      totalUsers: admins,
      totalCustomers: customers,
    })
  } catch { res.json({}) }
})

router.get('/categories', async (req, res) => {
  try { res.json(await Category.find({}).sort({ id: 1 }).lean()) } catch { res.json([]) }
})

router.post('/categories', requireAdmin, async (req, res) => {
  try {
    const cat = await Category.create({ id: Date.now(), ...req.body })
    res.status(201).json(cat.toObject())
  } catch { res.status(500).json({ error: 'Error' }) }
})

router.put('/categories/:id', requireAdmin, async (req, res) => {
  try {
    const doc = await Category.findOneAndUpdate({ id: parseInt(req.params.id) }, { $set: req.body }, { new: true }).lean()
    if (!doc) return res.status(404).json({ error: 'دسته‌بندی یافت نشد' })
    res.json(doc)
  } catch { res.status(500).json({ error: 'Error' }) }
})

router.delete('/categories/:id', requireAdmin, async (req, res) => {
  try {
    await Category.deleteOne({ id: parseInt(req.params.id) })
    res.json({ success: true })
  } catch { res.json({ success: false }) }
})

router.get('/messages', requireAdmin, async (req, res) => {
  try { res.json(await Message.find({}).sort({ id: -1 }).lean()) } catch { res.json([]) }
})

router.put('/messages/:id/read', requireAdmin, async (req, res) => {
  try {
    const msg = await Message.findOneAndUpdate({ id: parseInt(req.params.id) }, { $set: { read: true } }, { new: true }).lean()
    res.json(msg)
  } catch { res.status(500).json({ error: 'Error' }) }
})

router.delete('/messages/:id', requireAdmin, async (req, res) => {
  try {
    await Message.deleteOne({ id: parseInt(req.params.id) })
    res.json({ success: true })
  } catch { res.json({ success: false }) }
})

router.get('/notifications/config', async (req, res) => {
  const defaults = { smsProvider: '', smsApiKey: '', emailProvider: '', emailApiKey: '', telegramBotToken: '', whatsappApiKey: '' }
  try {
    const doc = await Setting.findById('global').lean()
    res.json(doc?.notificationsConfig || defaults)
  } catch { res.json(defaults) }
})

router.put('/notifications/config', requireAdmin, async (req, res) => {
  try {
    await Setting.findByIdAndUpdate('global', { $set: { notificationsConfig: req.body } }, { upsert: true })
    res.json({ success: true })
  } catch { res.status(500).json({ error: 'Error saving notifications config' }) }
})

const defaults = {
  siteName: 'ده نشین', siteDescription: 'محصولات ارگانیک و طبیعی',
  logoText: 'ده', phone: '۰۲۱-۸۸۷۶۵۴۳۲', mobile: '۰۹۱۲-۱۱۱-۸۸۸۸',
  email: 'info@dehneshin.com', address: 'تهران، خیابان انقلاب',
  address2: 'ایران مال، طبقه همکف، واحد ۱۴۵',
  workingHours: 'شنبه تا پنجشنبه: ۹ صبح تا ۸ شب', workingHoursFriday: 'جمعه: ۱۰ صبح تا ۶ عصر',
  instagram: 'https://instagram.com/dehneshin', telegram: 'https://t.me/dehneshin',
  whatsapp: 'https://wa.me/989121118888', bale: '', rubika: '', youtube: '', pinterest: '',
  footerCopyright: 'تمامی حقوق مادی و معنوی این وب‌سایت متعلق به ده نشین می‌باشد',
  aboutText: 'محصولات ارگانیک و طبیعی',
  heroBrandName: 'DEH NESHIN', heroTitle: 'ده نشین',
  heroSubtitle: 'محصولات ارگانیک · تازه و طبیعی',
  heroDescription: 'از دیرباز، هنر و اصالت در هم آمیخته‌اند تا آثاری خلق شوند که از مرزهای زمان فراتر روند.',
  heroSlides: [
    { type: 'banner', image: '', title: 'به بازار ارگانیک ده نشین خوش آمدید', subtitle: 'از مزرعه تا سفره · طبیعت پاک · زندگی سالم', description: 'با بیش از ۱۵۰ کشاورز معتمد، تازه‌ترین محصولات ارگانیک و طبیعی را مستقیماً از مزرعه به درب منزل شما می‌آوریم. کیفیت، تازگی و سلامت، سه اصل اساسی ماست.', buttonText: 'درباره ما', buttonLink: '/about', active: true },
    { type: 'banner', image: '', title: '🍏 میوه‌ها و سبزیجات تازه فصل', subtitle: 'طعم واقعی طبیعت را تجربه کنید', description: 'تازه‌ترین محصولات کشاورزی ارگانیک را مستقیماً از مزارع معتبر تهیه کنید. بدون سم و کود شیمیایی، با بالاترین کیفیت.', buttonText: 'مشاهده محصولات', buttonLink: '/products?category=fruits', active: true },
    { type: 'banner', image: '', title: '🍯 عسل طبیعی و خشکبار', subtitle: 'سالم · مقوی · کاملاً طبیعی', description: 'عسل کوهستان، آجیل و خشکبار درجه یک، روغن زیتون فوق‌العاده و صدها محصول طبیعی دیگر با ضمانت اصالت و کیفیت.', buttonText: 'محصولات طبیعی', buttonLink: '/products?category=honey', active: true },
    { type: 'banner', image: '', title: '🥛 لبنیات سنتی و محلی', subtitle: 'طعم خاطره‌انگیز لبنیات روستایی', description: 'ماست، پنیر، کره و دوغ محلی از دامداری‌های ارگانیک. بدون مواد نگهدارنده، با طعم اصیل و بافت سنتی.', buttonText: 'مشاهده لبنیات', buttonLink: '/products?category=dairy', active: true },
    { type: 'promo', image: '', title: '🔥 جشنواره پاییزی ده نشین', promoTitle: '🎊 تخفیف‌های ویژه فصل', promoDescription: 'تا ۳۰٪ تخفیف روی محصولات منتخب · ارسال رایگان برای خرید بالای ۵۰۰ هزار تومان', buttonText: 'مشاهده تخفیف‌ها', buttonLink: '/products?discount=true', active: true },
    { type: 'products', image: '', title: 'جدیدترین محصولات ارگانیک', productsTitle: 'تازه واردها', buttonText: 'مشاهده همه', buttonLink: '/products', active: true },
    { type: 'banner', image: '', title: '🌿 ۱۰۰٪ ارگانیک و طبیعی', subtitle: 'گواهی شده · تضمین کیفیت · بدون مواد افزودنی', description: 'همه محصولات ده نشین دارای گواهی ارگانیک هستند. از مزرعه تا سفره، سلامت شما برای ما اولویت است.', buttonText: 'چرا ده نشین؟', buttonLink: '/about', active: true },
    { type: 'banner', image: '', title: '📦 ارسال سریع به سراسر کشور', subtitle: 'سفارش دهید، درب منزل تحویل بگیرید', description: 'ارسال ۲۴ تا ۴۸ ساعته با بسته‌بندی بهداشتی و زنجیره سرد. ضمانت بازگشت کالا تا ۴۸ ساعت پس از تحویل.', buttonText: 'سفارش دهید', buttonLink: '/products', active: true },
  ],
  brandIntroTitle: 'تازه و طبیعی',
  brandIntroText: 'ده نشین با همکاری بیش از ۱۵۰ کشاورز ارگانیک...',
  stats: [
    { icon: '👑', value: '۵۰', suffix: '+', label: 'سال تجربه' },
    { icon: '🎨', value: '۱۰۰۰', suffix: '+', label: 'هنرمند ماهر' },
    { icon: '💎', value: '۳۰', suffix: '+', label: 'کالکشن اختصاصی' },
    { icon: '🛡', value: '۳۶', suffix: '', label: 'ماه گارانتی بی‌قید و شرط' },
  ],
  footerLabels: { quickLinks: 'لینک‌های سریع', products: 'محصولات', connect: 'ارتباط با ما', workingHours: 'ساعت کاری' },
  heroButtons: { primary: 'مجموعه سلطنتی', secondary: 'مشاوره اختصاصی' },
  showHeroButtons: true,
  banners: [{ image: '', title: 'ده نشین', subtitle: 'محصولات ارگانیک · تازه و طبیعی', link: '/products', active: true }],
  themes: { active: 'royal-gold', available: [] },
  otpEnabled: true, otpLength: 5, otpExpiry: 180, otpMaxAttempts: 3,
  smsProviders: [{ id: 'default', name: 'sms.ir اصلی', enabled: true, forOTP: true, forNotification: true, apiKey: '', lineNumber: '', templateId: '', apiBaseUrl: 'https://api.sms.ir/v1' }],
  testimonials: [
    { image: '', text: 'خیارهای ارگانیک ده نشین واقعاً طعم خیارهای باغ مادربزرگمو داره. بعد سال‌ها دوباره طعم واقعی خیار رو چشیدم!', name: 'خانواده احمدی', role: 'مشتری وفادار' },
    { image: '', text: 'از وقتی محصولات ده نشین رو به رژیم غذایی خانواده اضافه کردم، انرژی بچه‌ها خیلی بیشتر شده. مرسی از محصولات باکیفیت‌تون.', name: 'خانم محمدی', role: 'مادر خانواده' },
    { image: '', text: 'کاهو و سبزیجات ده نشین مثل این‌که تازه از باغچه چیده شده باشن. واقعاً تفاوت رو حس می‌کنی.', name: 'آقای رضایی', role: 'سرآشپز حرفه‌ای' },
    { image: '', text: 'روغن زیتون فوق‌العاده‌تون بی‌نظیره. من برای همه سالادها و پخت‌وه‌پزم فقط از محصولات ده نشین استفاده می‌کنم.', name: 'خانم موسوی', role: 'متخصص تغذیه' },
    { image: '', text: 'عسل طبیعی ده نشین رو به همه دوستان و آشنایان توصیه می‌کنم. کیفیتش با عسل‌های معمولی قابل مقایسه نیست.', name: 'آقای کاظمی', role: 'مشتری ثابت' },
    { image: '', text: 'بسته‌بندی محصولات ده نشین خیلی بهداشتی و شکیل هست. با اعتماد کامل می‌تونم به عنوان هدیه هم استفاده کنم.', name: 'خانم حسینی', role: 'طراح داخلی' },
    { image: '', text: 'من مبتلا به حساسیت‌های غذایی هستم و محصولات ارگانیک ده نشین تنها محصولاتی هستن که بدون نگرانی می‌تونم مصرف کنم.', name: 'آقای صادقی', role: 'مشتری ویژه' },
    { image: '', text: 'برنج ارگانیک ده نشین عطر و طعم بی‌نظیری داره. مهمونا همشون از طعم برنج تعریف کردن.', name: 'خانم کریمی', role: 'مدیر رستوران' },
    { image: '', text: 'خیالم راحته که محصولات ده نشین بدون سم و کود شیمیایی هستن. برای یه مادر این مهم‌ترین چیزه.', name: 'خانم رحمانی', role: 'مشتری وفادار' },
    { image: '', text: 'ارسال سریع و به‌موقع، بسته‌بندی عالی و محصولات تازه. ترکیب این سه تا باعث شده مشتری ثابت ده نشین باشم.', name: 'آقای نادری', role: 'خریدار عمده' },
  ],
  galleryTitle: 'گالری تصاویر', gallerySubtitle: 'مجموعه‌ای از آثار و محصولات',
  gallerySettings: { type: 'grid', images: [] },
  mapSettings: { type: 'iran-provinces', items: [] },
}

router.get('/settings', async (req, res) => {
  try {
    const doc = await getSettingsDoc()
    res.json({ ...defaults, ...doc })
  } catch { res.json(defaults) }
})

router.put('/settings', requireAdmin, async (req, res) => {
  try {
    const safe = { ...req.body }
    delete safe._id
    await Setting.findByIdAndUpdate('global', { $set: safe }, { upsert: true })
    res.json({ success: true })
  } catch { res.status(500).json({ error: 'Error saving settings' }) }
})

router.get('/3d-models', async (req, res) => {
  try {
    const models = await Model3D.find({}).sort({ createdAt: -1 }).lean()
    res.json(models)
  } catch { res.json([]) }
})

router.post('/3d-models', requireAdmin, async (req, res) => {
  try {
    const doc = await Model3D.create(req.body)
    res.status(201).json(doc.toObject())
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.put('/3d-models/:id', requireAdmin, async (req, res) => {
  try {
    const doc = await Model3D.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }).lean()
    if (!doc) return res.status(404).json({ error: 'Not found' })
    res.json(doc)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.delete('/3d-models/:id', requireAdmin, async (req, res) => {
  try {
    await Model3D.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/notifications/test', requireAdmin, async (req, res) => {
  const { type, to, message } = req.body
  const LOG_PATH = join(__dirname, '..', 'logs')
  if (!existsSync(LOG_PATH)) mkdirSync(LOG_PATH, { recursive: true })
  appendFileSync(join(LOG_PATH, 'notifications.log'), `[${new Date().toISOString()}] TEST ${type.toUpperCase()} => ${to} | ${message}\n`)
  let result = { logged: true }
  if (type === 'email') {
    try {
      const { sendEmail } = await import('../services/notifier.js')
      result = await sendEmail({ to, subject: 'تست ایمیل - ده نشین', text: message })
    } catch (e) { result = { error: e.message } }
  }
  res.json({ success: true, message: `پیام تست ${type} ثبت شد`, ...result })
})

router.post('/backup', requireAdmin, async (req, res) => {
  try {
    const { execSync } = await import('child_process')
    const { mkdirSync, copyFileSync, existsSync, writeFileSync } = await import('fs')
    const { join } = await import('path')
    const BACKUP_DIR = join(__dirname, '..', 'backups')
    const DATA_DIR = join(__dirname, '..', 'data')
    if (!existsSync(BACKUP_DIR)) mkdirSync(BACKUP_DIR, { recursive: true })
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const bp = join(BACKUP_DIR, `backup-${ts}`)
    mkdirSync(bp, { recursive: true })
    try {
      execSync(`mongodump --uri="mongodb://admin:dehneshin_secret_1404@localhost:27018/dehneshin?authSource=admin" --out="${join(bp, 'mongodb')}"`, { stdio: 'pipe', timeout: 30000 })
    } catch {}
    writeFileSync(join(bp, 'manifest.json'), JSON.stringify({ timestamp: new Date().toISOString(), path: bp }, null, 2))
    res.json({ success: true, path: bp, message: 'پشتیبان‌گیری با موفقیت انجام شد' })
  } catch (e) {
    res.status(500).json({ error: 'خطا در پشتیبان‌گیری: ' + e.message })
  }
})

router.get('/backups', async (req, res) => {
  try {
    const { existsSync, readdirSync, readFileSync } = await import('fs')
    const { join } = await import('path')
    const BACKUP_DIR = join(__dirname, '..', 'backups')
    if (!existsSync(BACKUP_DIR)) return res.json([])
    const dirs = readdirSync(BACKUP_DIR, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => {
      const mf = join(BACKUP_DIR, d.name, 'manifest.json')
      const manifest = existsSync(mf) ? JSON.parse(readFileSync(mf, 'utf-8')) : {}
      return { name: d.name, ...manifest }
    }).sort((a, b) => b.name.localeCompare(a.name))
    res.json(dirs)
  } catch { res.json([]) }
})

export default router
