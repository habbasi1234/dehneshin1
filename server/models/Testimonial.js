import mongoose from 'mongoose'

const testimonialSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  text: { type: mongoose.Schema.Types.Mixed },
  name: { type: mongoose.Schema.Types.Mixed },
  role: { type: mongoose.Schema.Types.Mixed },
  image: String,
  rating: { type: Number, default: 5 },
  createdAt: String,
}, { timestamps: true })

testimonialSchema.pre('save', function (next) {
  if (!this.id) this.id = Date.now()
  next()
})

export default mongoose.model('Testimonial', testimonialSchema)
