import mongoose from 'mongoose'
import Product from './models/Product.js'

await mongoose.connect('mongodb://admin:dehneshin_secret_1404@localhost:27018/dehneshin?authSource=admin')

// Map actual uploaded files to products
const images = {
  'pars-royal-collection': ['/uploads/1780954364604-162051717.webp', '/uploads/1780954390411-497930471.webp', '/uploads/1780954413932-29314079.webp'],
  'milano-modern': ['/uploads/1780954440563-100758240.webp', '/uploads/1780954509712-133058064.webp'],
  'royal-bedroom-suite': ['/uploads/1780954769935-834452566.webp', '/uploads/1780956989581-177087946.webp'],
  'cedar-dining-table': ['/uploads/1780957026984-424962449.webp'],
  'palace-classic-buffet': ['/uploads/1780957045278-938430392.webp', '/uploads/1780957146528-38755725.webp'],
  'versailles-dining-chair': ['/uploads/1780954494812-828273391.webp'],
  'rent-accent-chair': ['/uploads/1780954596646-500333483.webp'],
  'mirrored-console-table': ['/uploads/1780952778784-431596604.webp'],
  'daniel-sleeper-sofa': ['/uploads/1780952780252-834862976.webp', '/uploads/1780700603890-794522230.png'],
  'pars-wardrobe': ['/uploads/1780700576823-339931455.jpg'],
  'elias-sofa-set': ['/uploads/1780689172159-33155255.jpg', '/uploads/1780693863692-325737265.png'],
  'classic-patterned-fabric': ['/uploads/1780700609703-85431282.png'],
}

const products = await Product.find({}).lean()
let count = 0
for (const p of products) {
  const urls = images[p.slug]
  if (urls) {
    await Product.updateOne({ id: p.id }, { $set: { images: JSON.stringify(urls) } })
    count++
    console.log(`Updated ${p.slug} -> ${urls.length} images`)
  }
}
console.log(`Updated ${count} products with real images`)
await mongoose.disconnect()
