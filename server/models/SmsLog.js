import mongoose from 'mongoose'

const smsLogSchema = new mongoose.Schema({
  to: String,
  code: String,
  messageId: String,
  sentAt: { type: String, default: () => new Date().toISOString() },
  deliveryState: { type: String, default: null },
  deliveryDateTime: String,
}, { timestamps: true })

export default mongoose.model('SmsLog', smsLogSchema)
