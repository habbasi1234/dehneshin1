import mongoose from 'mongoose'
const uri = 'mongodb://admin:dehneshin_secret_1404@localhost:27018/dehneshin?authSource=admin'
await mongoose.connect(uri)
const db = mongoose.connection.db
const products = await db.collection('products').find({}).toArray()
for (const p of products) {
  const f = typeof p.fabrics === 'string' ? p.fabrics.slice(0,100) : JSON.stringify(p.fabrics).slice(0,100)
  const w = typeof p.woodColors === 'string' ? p.woodColors.slice(0,60) : JSON.stringify(p.woodColors).slice(0,60)
  const c = typeof p.colors === 'string' ? p.colors.slice(0,60) : JSON.stringify(p.colors).slice(0,60)
  console.log(`${p.id} | ${p.name} | colors:${c} | wood:${w} | fabrics:${f}`)
}
await mongoose.disconnect()
