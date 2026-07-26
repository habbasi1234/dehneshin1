import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI || 'mongodb://admin:dehneshin_secret_1404@localhost:27018/dehneshin?authSource=admin'
await mongoose.connect(uri)

const productGroups = [
  { cat: 'fruits', name: 'سیب قرمز ارگانیک', name_en: 'Organic Red Apple', name_ar: 'تفاح أحمر عضوي', slug: 'organic-red-apple', price: '۸۵,۰۰۰', salePrice: '۷۵,۰۰۰', discountPercent: 12, unit: 'کیلوگرم', origin: 'دماوند', keywords: 'سیب, قرمز, ارگانیک, دماوند' },
  { cat: 'fruits', name: 'پرتقال ارگانیک', name_en: 'Organic Orange', name_ar: 'برتقال عضوي', slug: 'organic-orange', price: '۶۵,۰۰۰', unit: 'کیلوگرم', origin: 'شمال', keywords: 'پرتقال, ارگانیک, شمال' },
  { cat: 'fruits', name: 'کیوی ارگانیک', name_en: 'Organic Kiwi', name_ar: 'كيوي عضوي', slug: 'organic-kiwi', price: '۱۲۰,۰۰۰', unit: 'کیلوگرم', origin: 'گیلان', keywords: 'کیوی, ارگانیک, گیلان' },
  { cat: 'fruits', name: 'انار ارگانیک', name_en: 'Organic Pomegranate', name_ar: 'رمان عضوي', slug: 'organic-pomegranate', price: '۹۰,۰۰۰', salePrice: '۸۰,۰۰۰', discountPercent: 11, unit: 'کیلوگرم', origin: 'ساوه', keywords: 'انار, ارگانیک, ساوه' },
  { cat: 'fruits', name: 'انگور ارگانیک', name_en: 'Organic Grapes', name_ar: 'عنب عضوي', slug: 'organic-grapes', price: '۱۱۰,۰۰۰', unit: 'کیلوگرم', origin: 'ملایر', keywords: 'انگور, ارگانیک, ملایر' },
  { cat: 'fruits', name: 'خرما مضافتی', name_en: 'Organic Mazafati Date', name_ar: 'تمر مضافتي', slug: 'organic-mazafati-date', price: '۱۸۰,۰۰۰', unit: 'کیلوگرم', origin: 'بم', keywords: 'خرما, مضافتی, بم' },
  { cat: 'vegetables', name: 'گوجه فرنگی ارگانیک', name_en: 'Organic Tomato', name_ar: 'طماطم عضوي', slug: 'organic-tomato', price: '۴۵,۰۰۰', unit: 'کیلوگرم', origin: 'جیرفت', keywords: 'گوجه, ارگانیک, جیرفت' },
  { cat: 'vegetables', name: 'خیار ارگانیک', name_en: 'Organic Cucumber', name_ar: 'خيار عضوي', slug: 'organic-cucumber', price: '۳۵,۰۰۰', unit: 'کیلوگرم', origin: 'اصفهان', keywords: 'خیار, ارگانیک, اصفهان' },
  { cat: 'vegetables', name: 'کاهو ارگانیک', name_en: 'Organic Lettuce', name_ar: 'خس عضوي', slug: 'organic-lettuce', price: '۳۰,۰۰۰', unit: 'عدد', origin: 'ورامین', keywords: 'کاهو, ارگانیک, ورامین' },
  { cat: 'vegetables', name: 'اسفناج ارگانیک', name_en: 'Organic Spinach', name_ar: 'سبانخ عضوي', slug: 'organic-spinach', price: '۴۰,۰۰۰', unit: 'کیلوگرم', origin: 'دزفول', keywords: 'اسفناج, ارگانیک' },
  { cat: 'vegetables', name: 'کلم بروکلی ارگانیک', name_en: 'Organic Broccoli', name_ar: 'بروكلي عضوي', slug: 'organic-broccoli', price: '۶۰,۰۰۰', unit: 'کیلوگرم', origin: 'شوشتر', keywords: 'کلم, بروکلی, ارگانیک' },
  { cat: 'vegetables', name: 'هویج ارگانیک', name_en: 'Organic Carrot', name_ar: 'جزر عضوي', slug: 'organic-carrot', price: '۳۵,۰۰۰', unit: 'کیلوگرم', origin: 'محلات', keywords: 'هویج, ارگانیک' },
  { cat: 'dairy', name: 'شیر محلی ارگانیک', name_en: 'Organic Fresh Milk', name_ar: 'حليب عضوي طازج', slug: 'organic-fresh-milk', price: '۵۵,۰۰۰', unit: 'لیتر', origin: 'مزرعه ده نشین', keywords: 'شیر, محلی, ارگانیک' },
  { cat: 'dairy', name: 'ماست سنتی', name_en: 'Traditional Yogurt', name_ar: 'زبادي تقليدي', slug: 'traditional-yogurt', price: '۶۵,۰۰۰', unit: 'کیلوگرم', origin: 'مزرعه ده نشین', keywords: 'ماست, سنتی, ارگانیک' },
  { cat: 'dairy', name: 'پنیر گوسفندی', name_en: 'Organic Sheep Cheese', name_ar: 'جبن غنم عضوي', slug: 'organic-sheep-cheese', price: '۱۲۰,۰۰۰', unit: 'کیلوگرم', origin: 'مزرعه ده نشین', keywords: 'پنیر, گوسفندی, ارگانیک' },
  { cat: 'dairy', name: 'کره محلی', name_en: 'Organic Butter', name_ar: 'زبدة عضوية', slug: 'organic-butter', price: '۱۸۰,۰۰۰', unit: 'کیلوگرم', origin: 'مزرعه ده نشین', keywords: 'کره, محلی, ارگانیک' },
  { cat: 'dairy', name: 'دوغ سنتی', name_en: 'Traditional Doogh', name_ar: 'دوغ تقليدي', slug: 'traditional-doogh', price: '۳۰,۰۰۰', unit: 'نیم لیتر', origin: 'مزرعه ده نشین', keywords: 'دوغ, سنتی, ارگانیک' },
  { cat: 'grains', name: 'برنج طارم ارگانیک', name_en: 'Organic Tarom Rice', name_ar: 'أرز طارم عضوي', slug: 'organic-tarom-rice', price: '۱۸۰,۰۰۰', salePrice: '۱۶۵,۰۰۰', discountPercent: 8, unit: 'کیلوگرم', origin: 'گیلان', keywords: 'برنج, طارم, ارگانیک' },
  { cat: 'grains', name: 'لوبیا قرمز ارگانیک', name_en: 'Organic Red Kidney Beans', name_ar: 'فاصوليا حمراء عضوية', slug: 'organic-red-beans', price: '۹۵,۰۰۰', unit: 'کیلوگرم', origin: 'خمین', keywords: 'لوبیا, قرمز, ارگانیک' },
  { cat: 'grains', name: 'نخود ارگانیک', name_en: 'Organic Chickpeas', name_ar: 'حمص عضوي', slug: 'organic-chickpeas', price: '۸۵,۰۰۰', unit: 'کیلوگرم', origin: 'کرمانشاه', keywords: 'نخود, ارگانیک' },
  { cat: 'grains', name: 'عدس ارگانیک', name_en: 'Organic Lentils', name_ar: 'عدس عضوي', slug: 'organic-lentils', price: '۷۰,۰۰۰', unit: 'کیلوگرم', origin: 'لرستان', keywords: 'عدس, ارگانیک' },
  { cat: 'grains', name: 'گندم کامل ارگانیک', name_en: 'Organic Whole Wheat', name_ar: 'قمح كامل عضوي', slug: 'organic-whole-wheat', price: '۴۵,۰۰۰', unit: 'کیلوگرم', origin: 'کردستان', keywords: 'گندم, کامل, ارگانیک' },
  { cat: 'grains', name: 'جو پوست کنده', name_en: 'Organic Hulled Barley', name_ar: 'شعير مقشر عضوي', slug: 'organic-hulled-barley', price: '۵۰,۰۰۰', unit: 'کیلوگرم', origin: 'همدان', keywords: 'جو, پوست کنده, ارگانیک' },
  { cat: 'nuts', name: 'گردوی تازه', name_en: 'Organic Fresh Walnut', name_ar: 'جوز عضوي طازج', slug: 'organic-fresh-walnut', price: '۳۵۰,۰۰۰', unit: 'کیلوگرم', origin: 'تویسرکان', keywords: 'گردو, تازه, ارگانیک' },
  { cat: 'nuts', name: 'بادام زمینی', name_en: 'Organic Peanuts', name_ar: 'فستق سوداني عضوي', slug: 'organic-peanuts', price: '۲۲۰,۰۰۰', unit: 'کیلوگرم', origin: 'آستانه', keywords: 'بادام, زمینی, ارگانیک' },
  { cat: 'nuts', name: 'پسته اکبری', name_en: 'Organic Akbari Pistachio', name_ar: 'فستق أكبري عضوي', slug: 'organic-akbari-pistachio', price: '۵۸۰,۰۰۰', salePrice: '۵۲۰,۰۰۰', discountPercent: 10, unit: 'کیلوگرم', origin: 'رفسنجان', keywords: 'پسته, اکبری, ارگانیک' },
  { cat: 'nuts', name: 'کشمش پلویی', name_en: 'Organic Raisins', name_ar: 'زبيب عضوي', slug: 'organic-raisins', price: '۱۲۰,۰۰۰', unit: 'کیلوگرم', origin: 'ملایر', keywords: 'کشمش, پلویی, ارگانیک' },
  { cat: 'nuts', name: 'خرما پیارم', name_en: 'Organic Piarom Date', name_ar: 'تمر بيارم عضوي', slug: 'organic-piarom-date', price: '۲۵۰,۰۰۰', unit: 'کیلوگرم', origin: 'حاجی‌آباد', keywords: 'خرما, پیارم, ارگانیک' },
  { cat: 'honey', name: 'عسل طبیعی کوهستان', name_en: 'Organic Mountain Honey', name_ar: 'عسل جبلي عضوي', slug: 'organic-mountain-honey', price: '۴۵۰,۰۰۰', unit: 'کیلوگرم', origin: 'سبلان', keywords: 'عسل, طبیعی, کوهستان, ارگانیک' },
  { cat: 'honey', name: 'عسل گون', name_en: 'Organic Astragalus Honey', name_ar: 'عسل عضوي', slug: 'organic-astragalus-honey', price: '۵۲۰,۰۰۰', unit: 'کیلوگرم', origin: 'کردستان', keywords: 'عسل, گون, ارگانیک' },
  { cat: 'honey', name: 'بره موم (پروپولیس)', name_en: 'Organic Propolis', name_ar: 'دنج', slug: 'organic-propolis', price: '۳۵۰,۰۰۰', unit: '۳۰ گرم', origin: 'مزرعه ده نشین', keywords: 'بره موم, پروپولیس, ارگانیک' },
  { cat: 'honey', name: 'ژل رویال', name_en: 'Organic Royal Jelly', name_ar: 'غذاء ملكي عضوي', slug: 'organic-royal-jelly', price: '۸۵۰,۰۰۰', unit: '۲۰ گرم', origin: 'مزرعه ده نشین', keywords: 'ژل رویال, ارگانیک' },
  { cat: 'honey', name: 'سرکه سیب طبیعی', name_en: 'Organic Apple Cider Vinegar', name_ar: 'خل تفاح عضوي', slug: 'organic-apple-cider-vinegar', price: '۸۰,۰۰۰', unit: '۵۰۰ میلی', origin: 'مزرعه ده نشین', keywords: 'سرکه, سیب, طبیعی, ارگانیک' },
  { cat: 'beverages', name: 'چای سبز ارگانیک', name_en: 'Organic Green Tea', name_ar: 'شاي أخضر عضوي', slug: 'organic-green-tea', price: '۱۵۰,۰۰۰', unit: '۲۰۰ گرم', origin: 'لاهیجان', keywords: 'چای, سبز, ارگانیک' },
  { cat: 'beverages', name: 'دمنوش نعناع', name_en: 'Organic Peppermint Tea', name_ar: 'شاي نعناع عضوي', slug: 'organic-peppermint-tea', price: '۸۵,۰۰۰', unit: '۱۰۰ گرم', origin: 'مزرعه ده نشین', keywords: 'دمنوش, نعناع, ارگانیک' },
  { cat: 'beverages', name: 'دم کرده آویشن', name_en: 'Organic Thyme Tea', name_ar: 'زعتر عضوي', slug: 'organic-thyme-tea', price: '۷۵,۰۰۰', unit: '۱۰۰ گرم', origin: 'یزد', keywords: 'آویشن, دمنوش, ارگانیک' },
  { cat: 'beverages', name: 'دم کرده بابونه', name_en: 'Organic Chamomile Tea', name_ar: 'بابونج عضوي', slug: 'organic-chamomile-tea', price: '۹۰,۰۰۰', unit: '۱۰۰ گرم', origin: 'مزرعه ده نشین', keywords: 'بابونه, دمنوش, ارگانیک' },
  { cat: 'beverages', name: 'روغن زیتون فرابکر', name_en: 'Extra Virgin Olive Oil', name_ar: 'زيت زيتون بكر', slug: 'organic-olive-oil', price: '۳۵۰,۰۰۰', unit: '۵۰۰ میلی', origin: 'رودبار', keywords: 'روغن, زیتون, فرابکر, ارگانیک' },
]

// Import models
const Product = (await import('./models/Product.js')).default
const Category = (await import('./models/Category.js')).default
const Setting = (await import('./models/Setting.js')).default
const User = (await import('./models/User.js')).default

// 1. Categories
await Category.deleteMany({})
const categories = [
  { id: 1, name: 'میوه‌های ارگانیک', slug: 'fruits', icon: '🍎' },
  { id: 2, name: 'سبزیجات ارگانیک', slug: 'vegetables', icon: '🥬' },
  { id: 3, name: 'لبنیات سنتی', slug: 'dairy', icon: '🥛' },
  { id: 4, name: 'غلات و حبوبات', slug: 'grains', icon: '🌾' },
  { id: 5, name: 'خشکبار و آجیل', slug: 'nuts', icon: '🥜' },
  { id: 6, name: 'عسل و محصولات طبیعی', slug: 'honey', icon: '🍯' },
  { id: 7, name: 'نوشیدنی‌های سالم', slug: 'beverages', icon: '🧃' },
]
await Category.insertMany(categories)
console.log(`Categories: ${categories.length}`)

// 2. Products
await Product.deleteMany({})
let id = Date.now()
const products = []
for (const g of productGroups) {
  products.push({
    id: id++,
    name: g.name,
    name_fa: g.name,
    name_en: g.name_en,
    name_ar: g.name_ar,
    slug: g.slug,
    category: g.cat,
    price: g.price,
    salePrice: g.salePrice || '',
    discountPercent: g.discountPercent || 0,
    status: 'active',
    images: [],
    unit: g.unit,
    origin: g.origin,
    description: g.name,
    desc_fa: g.name,
    desc_en: g.name_en,
    desc_ar: g.name_ar,
    features: JSON.stringify([{ key: 'محل تولید', value: g.origin }, { key: 'واحد', value: g.unit }, { key: 'نوع', value: 'ارگانیک' }, { key: 'گواهی', value: 'دارای گواهی ارگانیک' }]),
    keywords: g.keywords,
  })
}
await Product.insertMany(products, { ordered: false })
console.log(`Products: ${products.length}`)

// 3. Admin User
await User.deleteMany({})
await User.create({ id: 1, username: 'admin', password: 'dehnesin@1404', role: 'admin', name: 'مدیر سیستم' })
console.log('Admin user created')

// 4. Settings
await Setting.deleteMany({})
await Setting.findByIdAndUpdate('global', {
  siteName: { fa: 'ده نشین', en: 'Deh Neshin', ar: 'ده نشین' },
  siteDescription: { fa: 'محصولات ارگانیک و طبیعی', en: 'Organic & Natural Products', ar: 'المنتجات العضوية والطبيعية' },
  phone: '۰۲۱-۱۲۳۴۵۶۷۸',
  mobile: '۰۹۱۲-۱۲۳-۴۵۶۷',
  email: 'info@dehneshin.com',
  address: { fa: 'تهران، خیابان انقلاب', en: 'Tehran, Enghelab St.', ar: 'طهران، شارع الثورة' },
  workingHours: { fa: 'شنبه تا پنجشنبه ۸ الی ۲۰', en: 'Sat-Thu 8AM-8PM', ar: 'السبت-الخميس 8 صباحاً-8 مساءً' },
  socialLinks: [
    { key: 'instagram', label: { fa: 'اینستاگرام', en: 'Instagram', ar: 'انستغرام' }, url: 'https://instagram.com/dehneshin', icon: '📷' },
    { key: 'telegram', label: { fa: 'تلگرام', en: 'Telegram', ar: 'تيليغرام' }, url: 'https://t.me/dehneshin', icon: '✈️' },
    { key: 'whatsapp', label: { fa: 'واتساپ', en: 'WhatsApp', ar: 'واتساب' }, url: 'https://wa.me/989121234567', icon: '💬' }
  ],
  productViews: {},
}, { upsert: true })
console.log('Settings created')

console.log('\nDone! All data in MongoDB.')
await mongoose.disconnect()
