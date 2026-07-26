import mongoose from 'mongoose'

const settingSchema = new mongoose.Schema({
  _id: { type: String, default: 'global' },
  siteName: { type: mongoose.Schema.Types.Mixed, default: {} },
  siteDescription: { type: mongoose.Schema.Types.Mixed, default: {} },
  languages: { type: [mongoose.Schema.Types.Mixed], default: [] },
  homepageSections: { type: [mongoose.Schema.Types.Mixed], default: [] },
  otpEnabled: { type: Boolean, default: false },
  otpLength: { type: Number, default: 5 },
  otpExpiry: { type: Number, default: 180 },
  otpMaxAttempts: { type: Number, default: 3 },
  smsProviders: { type: [mongoose.Schema.Types.Mixed], default: [{ id: 'default', name: 'sms.ir اصلی', enabled: true, forOTP: true, forNotification: true, apiKey: '', lineNumber: '', templateId: '', apiBaseUrl: 'https://api.sms.ir/v1' }] },
  gallerySettings: { type: mongoose.Schema.Types.Mixed, default: { type: 'grid', images: [] } },
  mapSettings: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { strict: false, timestamps: true })

export default mongoose.model('Setting', settingSchema)
