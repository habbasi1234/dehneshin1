import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  type: { type: String, enum: ['contact', 'consultation', 'comment'], default: 'contact' },
  productType: { type: String, default: '' },
  description: { type: String, default: '' },
  read: { type: Boolean, default: false },
  replied: { type: Boolean, default: false },
  replyText: { type: String, default: '' },
  repliedAt: Date,
  createdAt: String,
}, { timestamps: true })

messageSchema.pre('save', function (next) {
  if (!this.id) this.id = Date.now()
  next()
})

export default mongoose.model('Message', messageSchema)
