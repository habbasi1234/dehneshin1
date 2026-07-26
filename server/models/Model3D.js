import mongoose from 'mongoose'

const model3dSchema = new mongoose.Schema({
  productId: { type: Number, required: true },
  title: String,
  images: String,
}, { timestamps: true })

export default mongoose.model('Model3D', model3dSchema)
