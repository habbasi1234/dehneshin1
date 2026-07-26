import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const customerSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  username: { type: String, sparse: true },
  password: String,
  name: String,
  phone: String,
  email: String,
  role: { type: String, default: 'customer' },
  tier: { type: String, default: 'bronze' },
  points: { type: Number, default: 0 },
  totalPurchases: { type: Number, default: 0 },
  cardCode: String,
  cardImage: String,
  createdAt: String,
}, { timestamps: true })

customerSchema.pre('save', function (next) {
  if (!this.id) this.id = Date.now()
  next()
})

export default mongoose.model('Customer', customerSchema)
