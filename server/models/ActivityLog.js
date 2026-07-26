import mongoose from 'mongoose'

const activityLogSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  username: { type: String, required: true },
  action: { type: String, required: true },
  resource: { type: String },
  resourceId: { type: String },
  details: { type: String },
  ip: { type: String },
  userAgent: { type: String },
}, { timestamps: true })

activityLogSchema.index({ createdAt: -1 })
activityLogSchema.index({ userId: 1, createdAt: -1 })
activityLogSchema.index({ action: 1, createdAt: -1 })

export default mongoose.model('ActivityLog', activityLogSchema)
