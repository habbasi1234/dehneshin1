import mongoose from 'mongoose'

const blogSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  title: String,
  slug: { type: String, unique: true, sparse: true },
  category: String,
  subcategory: String,
  description: String,
  content: String,
  image: String,
  image2: String,
  image3: String,
  video: String,
  audio: String,
  date: String,
  tags: String,
  keywords: String,
}, { timestamps: true })

blogSchema.pre('save', function (next) {
  if (!this.id) this.id = Date.now()
  next()
})

export default mongoose.model('Blog', blogSchema)
