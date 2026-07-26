import mongoose from 'mongoose'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import Setting from './models/Setting.js'
import Category from './models/Category.js'
import Product from './models/Product.js'
import Blog from './models/Blog.js'
import Order from './models/Order.js'
import Review from './models/Review.js'
import Message from './models/Message.js'
import User from './models/User.js'
import Customer from './models/Customer.js'
import Notification from './models/Notification.js'
import Testimonial from './models/Testimonial.js'

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_PATH = join(__dirname, 'data')
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:dehneshin_secret_1404@localhost:27018/dehneshin?authSource=admin'

function readJSON(name) {
  const file = join(DATA_PATH, `${name}.json`)
  if (!existsSync(file)) return null
  return JSON.parse(readFileSync(file, 'utf-8'))
}

const seedConfig = [
  { model: Setting, file: 'settings', isSingle: true },
  { model: Category, file: 'categories' },
  { model: Product, file: 'products' },
  { model: Blog, file: 'blog' },
  { model: Order, file: 'orders' },
  { model: Review, file: 'reviews' },
  { model: Message, file: 'messages' },
  { model: User, file: 'users' },
  { model: Customer, file: 'customers' },
  { model: Notification, file: 'notifications' },
  { model: Testimonial, file: 'testimonials' },
]

async function seed() {
  console.log('Connecting to MongoDB...')
  await mongoose.connect(MONGODB_URI)
  console.log('Connected\n')

  for (const cfg of seedConfig) {
    const data = readJSON(cfg.file)
    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.log(`Skip ${cfg.file}: no data`)
      if (cfg.isSingle) {
        await cfg.model.findByIdAndUpdate('global', {}, { upsert: true, new: true })
      }
      continue
    }

    await cfg.model.deleteMany({})

    if (cfg.isSingle) {
      await cfg.model.findByIdAndUpdate('global', data, { upsert: true, new: true })
      console.log(`Seeded ${cfg.file} (single document)`)
    } else {
      const docs = Array.isArray(data) ? data : []
      if (docs.length > 0) {
        try { await cfg.model.insertMany(docs, { ordered: false }) } catch (e) {
          console.log(`Partial ${cfg.file}: ${e.writeErrors?.length || 0} errors (duplicates ignored)`)
        }
        console.log(`Seeded ${cfg.file}: ${docs.length} documents`)
      }
    }
  }

  console.log('\nSeed complete!')
  await mongoose.disconnect()
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1) })
