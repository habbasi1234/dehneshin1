import mongoose from 'mongoose'
import { readFileSync, existsSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_PATH = __dirname

const modelMap = {}

export async function loadModels() {
  const models = ['Product', 'Category', 'Blog', 'Order', 'Review', 'Message', 'User', 'Customer', 'Notification', 'Testimonial', 'Setting']
  for (const name of models) {
    try {
      const mod = await import(`../models/${name}.js`)
      modelMap[name.toLowerCase() + 's'] = mod.default
      modelMap[name.toLowerCase()] = mod.default
    } catch {}
  }
  modelMap.settings = modelMap.setting
  return modelMap
}

const nameToModel = {
  products: 'Product',
  categories: 'Category',
  blog: 'Blog',
  orders: 'Order',
  reviews: 'Review',
  messages: 'Message',
  users: 'User',
  customers: 'Customer',
  notifications: 'Notification',
  testimonials: 'Testimonial',
  settings: 'Setting',
}

export async function readData(name) {
  const modelName = nameToModel[name]
  if (!modelName) return fallbackRead(name)
  try {
    const mod = await import(`../models/${modelName}.js`)
    const Model = mod.default
    if (name === 'settings') {
      const doc = await Model.findById('global').lean()
      return doc || {}
    }
    return await Model.find({}).sort({ id: -1 }).lean()
  } catch {
    return fallbackRead(name)
  }
}

export async function writeData(name, data) {
  const modelName = nameToModel[name]
  if (!modelName) return fallbackWrite(name, data)
  try {
    const mod = await import(`../models/${modelName}.js`)
    const Model = mod.default
    await Model.deleteMany({})
    if (name === 'settings') {
      await Model.findByIdAndUpdate('global', data, { upsert: true, new: true })
    } else if (Array.isArray(data)) {
      if (data.length > 0) {
        try { await Model.insertMany(data, { ordered: false }) } catch {}
      }
    }
    return data
  } catch {
    return fallbackWrite(name, data)
  }
}

function fallbackRead(name) {
  const file = join(DATA_PATH, `${name}.json`)
  if (!existsSync(file)) return []
  try { return JSON.parse(readFileSync(file, 'utf-8')) } catch { return [] }
}

function fallbackWrite(name, data) {
  writeFileSync(join(DATA_PATH, `${name}.json`), JSON.stringify(data, null, 2))
  return data
}
