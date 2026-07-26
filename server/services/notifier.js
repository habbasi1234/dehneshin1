import nodemailer from 'nodemailer'

let transporter = null
let etherealAccount = null

export async function initTransporter() {
  try {
    etherealAccount = await nodemailer.createTestAccount()
    transporter = nodemailer.createTransport({
      host: etherealAccount.smtp.host,
      port: etherealAccount.smtp.port,
      secure: etherealAccount.smtp.secure,
      auth: { user: etherealAccount.user, pass: etherealAccount.pass },
    })
    console.log('📧 Ethereal email ready. Web URL:', etherealAccount.web)
    return etherealAccount.web
  } catch (e) {
    console.warn('⚠️ Ethereal account creation failed:', e.message)
    transporter = nodemailer.createTransport({ jsonTransport: true })
    return null
  }
}

export async function sendEmail({ to, subject, text, html }) {
  if (!transporter) await initTransporter()
  try {
    const info = await transporter.sendMail({
      from: '"ده نشین" <noreply@dehneshin.com>',
      to,
      subject,
      text,
      html: html || text.replace(/\n/g, '<br>'),
    })
    const previewUrl = nodemailer.getTestMessageUrl(info)
    if (previewUrl) {
      console.log('📧 Email preview:', previewUrl)
      return { success: true, messageId: info.messageId, previewUrl }
    }
    return { success: true, messageId: info.messageId }
  } catch (e) {
    console.error('Email send failed:', e.message)
    return { success: false, error: e.message }
  }
}

export function getEtherealWeb() {
  return etherealAccount?.web || null
}
