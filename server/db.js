import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:dehneshin_secret_1404@localhost:27018/dehneshin?authSource=admin'

let isConnected = false

export async function connectDB() {
  if (isConnected) return
  try {
    await mongoose.connect(MONGODB_URI)
    isConnected = true
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`)
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message)
    process.exit(1)
  }
}

export function getDB() {
  return mongoose.connection
}

export default { connectDB, getDB }
