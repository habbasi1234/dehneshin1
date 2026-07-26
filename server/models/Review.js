import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  productId: { type: Number, required: true },
  userId: { type: Number, default: null },
  userName: String,
  email: String,
  rating: { type: Number, default: 5 },
  text: String,
  approved: { type: Boolean, default: false },
  reply: String,
  replyDate: String,
  createdAt: String,
}, { timestamps: true })

reviewSchema.pre('save', function (next) {
  if (!this.id) this.id = Date.now()
  next()
})

export default mongoose.model('Review', reviewSchema)
