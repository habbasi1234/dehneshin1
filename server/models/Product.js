import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: String,
  name_fa: String,
  name_en: String,
  name_ar: String,
  slug: String,
  category: String,
  price: String,
  salePrice: String,
  discountPercent: Number,
  saleStart: Date,
  saleEnd: Date,
  status: { type: String, enum: ['active', 'inactive', 'finished'], default: 'active' },
  images: { type: mongoose.Schema.Types.Mixed, default: [] },
  dimensions: String,
  material: String,
  colors: { type: mongoose.Schema.Types.Mixed, default: [] },
  description: String,
  desc_fa: String,
  desc_en: String,
  desc_ar: String,
  features: String,
  woodColors: { type: mongoose.Schema.Types.Mixed, default: [] },
  fabrics: { type: mongoose.Schema.Types.Mixed, default: [] },
  keywords: String,
}, { timestamps: true })

productSchema.pre('save', function (next) {
  if (!this.id) this.id = Date.now()
  next()
})

export default mongoose.model('Product', productSchema)
