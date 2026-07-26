import { Router } from 'express'
import Message from '../models/Message.js'

const router = Router()

router.post('/', async (req, res) => {
  const { name, phone, productType, description, type } = req.body
  if (!name || !phone) {
    return res.status(400).json({ error: 'نام و شماره تماس الزامی است' })
  }
  try {
    const validTypes = ['contact', 'comment', 'consultation']
    const msgType = validTypes.includes(type) ? type : 'contact'
    await Message.create({
      id: Date.now(),
      name, phone,
      productType: productType || '',
      description: description || '',
      type: msgType,
      read: false,
      createdAt: new Date().toISOString(),
    })
    res.status(200).json({
      success: true,
      message: 'پیام شما با موفقیت ثبت شد. کارشناسان ما به زودی با شما تماس خواهند گرفت.'
    })
  } catch {
    res.status(500).json({ error: 'خطا در ثبت پیام' })
  }
})

export default router
