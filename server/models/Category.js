import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: String,
  slug: String,
  icon: String,
  parentId: Number,
}, { timestamps: true })

categorySchema.pre('save', function (next) {
  if (!this.id) this.id = Date.now()
  next()
})

export default mongoose.model('Category', categorySchema)
