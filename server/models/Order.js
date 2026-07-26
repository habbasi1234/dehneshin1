import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  productId: Number,
  name: String,
  price: String,
  quantity: { type: Number, default: 1 },
}, { _id: false })

const orderSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  code: String,
  status: { type: String, default: 'pending' },
  customerName: String,
  customerPhone: String,
  customerEmail: String,
  address: String,
  city: String,
  province: String,
  postalCode: String,
  description: String,
  items: [orderItemSchema],
  totalPrice: String,
  statusHistory: [mongoose.Schema.Types.Mixed],
  createdAt: { type: String },
  updatedAt: { type: String },
}, { timestamps: true })

orderSchema.pre('save', function (next) {
  if (!this.id) this.id = Date.now()
  next()
})

export default mongoose.model('Order', orderSchema)
