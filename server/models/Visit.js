import mongoose from 'mongoose'

const visitSchema = new mongoose.Schema({
  session: { type: String, index: true },
  ip: String,
  country: { type: String, index: true },
  province: { type: String, index: true },
  city: String,
  lat: Number,
  lon: Number,
  isp: String,
  path: { type: String, index: true },
  section: String,
  productId: { type: mongoose.Schema.Types.Mixed, index: true },
  userAgent: String,
  referrer: String,
  screenSize: String,
  duration: { type: Number, default: 0 },
  language: String,
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true })

visitSchema.index({ country: 1, province: 1 })
visitSchema.index({ createdAt: -1 })
visitSchema.index({ path: 1, createdAt: -1 })

export default mongoose.model('Visit', visitSchema)
