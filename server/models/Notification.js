import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  type: String,
  to: String,
  subject: String,
  message: String,
  sentAt: String,
  status: { type: String, default: 'sent' },
}, { timestamps: true })

notificationSchema.pre('save', function (next) {
  if (!this.id) this.id = Date.now()
  next()
})

export default mongoose.model('Notification', notificationSchema)
