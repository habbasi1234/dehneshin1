import mongoose from 'mongoose'
import User from './models/User.js'
import Customer from './models/Customer.js'

const MONGO_URI = 'mongodb://admin:dehneshin_secret_1404@localhost:27018/dehneshin?authSource=admin'

async function migrate() {
  await mongoose.connect(MONGO_URI)
  console.log('Connected to MongoDB')

  const customerUsers = await User.find({ role: 'customer' }).lean()
  console.log(`Found ${customerUsers.length} customer users in User collection`)

  let moved = 0
  for (const u of customerUsers) {
    const exists = await Customer.findOne({ username: u.username }).lean()
    if (!exists) {
      await Customer.create({
        id: u.id,
        username: u.username,
        password: u.password,
        name: u.name || '',
        phone: u.phone || '',
        email: u.email || '',
        role: 'customer',
        createdAt: u.createdAt || new Date().toISOString(),
      })
    }
    moved++
  }

  if (moved > 0) {
    await User.deleteMany({ role: 'customer' })
  }

  console.log(`Migrated ${moved} customers from User -> Customer collection`)
  await mongoose.disconnect()
}

migrate().catch(e => { console.error(e); process.exit(1) })
