import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI || 'mongodb://admin:dehneshin_secret_1404@localhost:27018/dehneshin?authSource=admin'
await mongoose.connect(uri)

const Product = (await import('./models/Product.js')).default

const newProducts = [
  // === Fruits (میوه) - 12 more ===
  { cat:'fruits', name:'هلو ارگانیک', price:'۹۵,۰۰۰', unit:'کیلوگرم', origin:'شاهرود', keywords:'هلو, ارگانیک, شاهرود' },
  { cat:'fruits', name:'شلیل ارگانیک', price:'۹۰,۰۰۰', unit:'کیلوگرم', origin:'باغملک', keywords:'شلیل, ارگانیک' },
  { cat:'fruits', name:'زردآلو ارگانیک', price:'۸۰,۰۰۰', unit:'کیلوگرم', origin:'کاشان', keywords:'زردآلو, ارگانیک, کاشان' },
  { cat:'fruits', name:'آلو ارگانیک', price:'۶۵,۰۰۰', unit:'کیلوگرم', origin:'مشهد', keywords:'آلو, ارگانیک' },
  { cat:'fruits', name:'انبه ارگانیک', price:'۱۵۰,۰۰۰', unit:'کیلوگرم', origin:'چابهار', keywords:'انبه, ارگانیک, چابهار' },
  { cat:'fruits', name:'موز ارگانیک', price:'۱۲۰,۰۰۰', unit:'کیلوگرم', origin:'دشتستان', keywords:'موز, ارگانیک' },
  { cat:'fruits', name:'نارنگی ارگانیک', price:'۷۰,۰۰۰', unit:'کیلوگرم', origin:'جهرم', keywords:'نارنگی, ارگانیک, جهرم' },
  { cat:'fruits', name:'گریپ‌فروت ارگانیک', price:'۸۰,۰۰۰', unit:'کیلوگرم', origin:'شمال', keywords:'گریپ‌فروت, ارگانیک' },
  { cat:'fruits', name:'توت فرنگی ارگانیک', price:'۱۸۰,۰۰۰', salePrice:'۱۶۰,۰۰۰', discountPercent:11, unit:'کیلوگرم', origin:'کردان', keywords:'توت فرنگی, ارگانیک' },
  { cat:'fruits', name:'گلابی ارگانیک', price:'۸۵,۰۰۰', unit:'کیلوگرم', origin:'دامغان', keywords:'گلابی, ارگانیک' },
  { cat:'fruits', name:'به ارگانیک', price:'۷۰,۰۰۰', unit:'کیلوگرم', origin:'اصفهان', keywords:'به, ارگانیک' },
  { cat:'fruits', name:'ازگیل ارگانیک', price:'۱۱۰,۰۰۰', unit:'کیلوگرم', origin:'گرگان', keywords:'ازگیل, ارگانیک, گرگان' },
  { cat:'fruits', name:'لیمو شیرین ارگانیک', price:'۶۰,۰۰۰', unit:'کیلوگرم', origin:'شیراز', keywords:'لیمو, شیرین, ارگانیک' },
  { cat:'fruits', name:'لیمو ترش ارگانیک', price:'۵۵,۰۰۰', unit:'کیلوگرم', origin:'شیراز', keywords:'لیمو, ترش, ارگانیک' },
  // === Vegetables (سبزیجات) - 10 more ===
  { cat:'vegetables', name:'فلفل دلمه‌ای ارگانیک', price:'۵۰,۰۰۰', unit:'کیلوگرم', origin:'اصفهان', keywords:'فلفل, دلمه, ارگانیک' },
  { cat:'vegetables', name:'بادمجان ارگانیک', price:'۳۵,۰۰۰', unit:'کیلوگرم', origin:'ورامین', keywords:'بادمجان, ارگانیک' },
  { cat:'vegetables', name:'کدو سبز ارگانیک', price:'۴۰,۰۰۰', unit:'کیلوگرم', origin:'دزفول', keywords:'کدو, سبز, ارگانیک' },
  { cat:'vegetables', name:'لوبیا سبز ارگانیک', price:'۴۵,۰۰۰', unit:'کیلوگرم', origin:'شوشتر', keywords:'لوبیا, سبز, ارگانیک' },
  { cat:'vegetables', name:'نخود فرنگی ارگانیک', price:'۵۵,۰۰۰', unit:'کیلوگرم', origin:'لرستان', keywords:'نخود, فرنگی, ارگانیک' },
  { cat:'vegetables', name:'شوید تازه ارگانیک', price:'۲۵,۰۰۰', unit:'کیلوگرم', origin:'همدان', keywords:'شوید, تازه, ارگانیک' },
  { cat:'vegetables', name:'جعفری تازه ارگانیک', price:'۲۰,۰۰۰', unit:'کیلوگرم', origin:'ورامین', keywords:'جعفری, تازه, ارگانیک' },
  { cat:'vegetables', name:'تربچه ارگانیک', price:'۳۰,۰۰۰', unit:'کیلوگرم', origin:'محلات', keywords:'تربچه, ارگانیک' },
  { cat:'vegetables', name:'کرفس ارگانیک', price:'۴۰,۰۰۰', unit:'کیلوگرم', origin:'دزفول', keywords:'کرفس, ارگانیک' },
  { cat:'vegetables', name:'شلغم ارگانیک', price:'۲۵,۰۰۰', unit:'کیلوگرم', origin:'همدان', keywords:'شلغم, ارگانیک' },
  { cat:'vegetables', name:'چغندر ارگانیک', price:'۳۵,۰۰۰', unit:'کیلوگرم', origin:'شیراز', keywords:'چغندر, ارگانیک' },
  // === Dairy (لبنیات) - 5 more ===
  { cat:'dairy', name:'خامه محلی ارگانیک', price:'۱۱۰,۰۰۰', unit:'۵۰۰ گرم', origin:'مزرعه ده نشین', keywords:'خامه, محلی, ارگانیک' },
  { cat:'dairy', name:'پنیر محلی ارگانیک', price:'۱۳۰,۰۰۰', unit:'کیلوگرم', origin:'مزرعه ده نشین', keywords:'پنیر, محلی, ارگانیک' },
  { cat:'dairy', name:'ماست چکیده', price:'۹۰,۰۰۰', unit:'کیلوگرم', origin:'مزرعه ده نشین', keywords:'ماست, چکیده' },
  { cat:'dairy', name:'کشک محلی', price:'۸۰,۰۰۰', unit:'کیلوگرم', origin:'مزرعه ده نشین', keywords:'کشک, محلی' },
  { cat:'dairy', name:'شیر بز ارگانیک', price:'۷۵,۰۰۰', unit:'لیتر', origin:'مزرعه ده نشین', keywords:'شیر, بز, ارگانیک' },
  { cat:'dairy', name:'پنیر کوزه‌ای', price:'۱۴۰,۰۰۰', unit:'کیلوگرم', origin:'مزرعه ده نشین', keywords:'پنیر, کوزه‌ای, سنتی' },
  // === Grains (غلات) - 6 more ===
  { cat:'grains', name:'برنج هاشمی ارگانیک', price:'۱۶۰,۰۰۰', unit:'کیلوگرم', origin:'رشت', keywords:'برنج, هاشمی, ارگانیک' },
  { cat:'grains', name:'برنج فجر ارگانیک', price:'۱۴۰,۰۰۰', unit:'کیلوگرم', origin:'تنکابن', keywords:'برنج, فجر, ارگانیک' },
  { cat:'grains', name:'ماش ارگانیک', price:'۷۵,۰۰۰', unit:'کیلوگرم', origin:'اصفهان', keywords:'ماش, ارگانیک' },
  { cat:'grains', name:'لپه ارگانیک', price:'۶۵,۰۰۰', unit:'کیلوگرم', origin:'خرم‌آباد', keywords:'لپه, ارگانیک' },
  { cat:'grains', name:'بلغور گندم', price:'۳۵,۰۰۰', unit:'کیلوگرم', origin:'کردستان', keywords:'بلغور, گندم' },
  { cat:'grains', name:'آرد سنگک', price:'۳۰,۰۰۰', unit:'کیلوگرم', origin:'اصفهان', keywords:'آرد, سنگک' },
  { cat:'grains', name:'سبوس گندم', price:'۲۵,۰۰۰', unit:'کیلوگرم', origin:'کردستان', keywords:'سبوس, گندم, ارگانیک' },
  // === Nuts (خشکبار) - 8 more ===
  { cat:'nuts', name:'بادام درشت', price:'۳۹۰,۰۰۰', salePrice:'۳۷۰,۰۰۰', discountPercent:5, unit:'کیلوگرم', origin:'تویسرکان', keywords:'بادام, درشت, ارگانیک' },
  { cat:'nuts', name:'فندق مغز', price:'۴۵۰,۰۰۰', unit:'کیلوگرم', origin:'اسالم', keywords:'فندق, مغز, ارگانیک' },
  { cat:'nuts', name:'تخمه کدو', price:'۱۸۰,۰۰۰', unit:'کیلوگرم', origin:'مشهد', keywords:'تخمه, کدو' },
  { cat:'nuts', name:'تخمه آفتابگردان', price:'۱۲۰,۰۰۰', unit:'کیلوگرم', origin:'ارومیه', keywords:'تخمه, آفتابگردان' },
  { cat:'nuts', name:'انجیر خشک', price:'۲۸۰,۰۰۰', unit:'کیلوگرم', origin:'استهبان', keywords:'انجیر, خشک, ارگانیک' },
  { cat:'nuts', name:'برگه زردآلو', price:'۲۲۰,۰۰۰', unit:'کیلوگرم', origin:'تبریز', keywords:'برگه, زردآلو, خشکبار' },
  { cat:'nuts', name:'آلو بخارا', price:'۱۶۰,۰۰۰', unit:'کیلوگرم', origin:'بجنورد', keywords:'آلو, بخارا, خشک' },
  { cat:'nuts', name:'عناب خشک', price:'۱۹۰,۰۰۰', unit:'کیلوگرم', origin:'قائن', keywords:'عناب, خشک' },
  { cat:'nuts', name:'خرمای مجول', price:'۳۸۰,۰۰۰', unit:'کیلوگرم', origin:'اهواز', keywords:'خرما, مجول' },
  // === Honey (عسل) - 5 more ===
  { cat:'honey', name:'عسل آویشن', price:'۴۸۰,۰۰۰', unit:'کیلوگرم', origin:'بجنورد', keywords:'عسل, آویشن' },
  { cat:'honey', name:'عسل مرکبات', price:'۴۲۰,۰۰۰', unit:'کیلوگرم', origin:'شمال', keywords:'عسل, مرکبات' },
  { cat:'honey', name:'عسل سیاه دانه', price:'۴۶۰,۰۰۰', unit:'کیلوگرم', origin:'اصفهان', keywords:'عسل, سیاه دانه' },
  { cat:'honey', name:'عسل کنار وحشی', price:'۵۸۰,۰۰۰', unit:'کیلوگرم', origin:'بوشهر', keywords:'عسل, کنار, وحشی' },
  { cat:'honey', name:'موم عسل', price:'۱۵۰,۰۰۰', unit:'۱۰۰ گرم', origin:'مزرعه ده نشین', keywords:'موم, عسل' },
  // === Beverages (نوشیدنی) - 6 more ===
  { cat:'beverages', name:'چای سیبزمینی هندی (ماسالا)', price:'۱۳۰,۰۰۰', unit:'۱۰۰ گرم', origin:'لاهیجان', keywords:'چای, ماسالا' },
  { cat:'beverages', name:'دم کرده گل گاو زبان', price:'۸۵,۰۰۰', unit:'۱۰۰ گرم', origin:'اصفهان', keywords:'گل گاو زبان, دمنوش' },
  { cat:'beverages', name:'دم کرده سنبل الطیب', price:'۸۰,۰۰۰', unit:'۱۰۰ گرم', origin:'کردستان', keywords:'سنبل الطیب, دمنوش' },
  { cat:'beverages', name:'دم کرده بهار نارنج', price:'۹۵,۰۰۰', unit:'۱۰۰ گرم', origin:'مازندران', keywords:'بهار نارنج, دمنوش' },
  { cat:'beverages', name:'عرق نعناع', price:'۵۵,۰۰۰', unit:'۵۰۰ میلی', origin:'همدان', keywords:'عرق, نعناع' },
  { cat:'beverages', name:'عرق بیدمشک', price:'۶۵,۰۰۰', unit:'۵۰۰ میلی', origin:'همدان', keywords:'عرق, بیدمشک' },
  { cat:'beverages', name:'شربت خاکشیر', price:'۷۰,۰۰۰', unit:'۵۰۰ میلی', origin:'مزرعه ده نشین', keywords:'شربت, خاکشیر, طبیعی' },
  { cat:'beverages', name:'سرکه انگور طبیعی', price:'۷۰,۰۰۰', unit:'۵۰۰ میلی', origin:'شیراز', keywords:'سرکه, انگور, طبیعی' },
  // === Spices (ادویه) - 10 more ===
  { cat:'spices', name:'زعفران ممتاز', price:'۳۵۰,۰۰۰', unit:'۲ گرم', origin:'قائن', keywords:'زعفران, ممتاز' },
  { cat:'spices', name:'زردچوبه طبیعی', price:'۴۵,۰۰۰', unit:'۱۰۰ گرم', origin:'خراسان', keywords:'زردچوبه, طبیعی' },
  { cat:'spices', name:'فلفل سیاه', price:'۵۵,۰۰۰', unit:'۱۰۰ گرم', origin:'هند', keywords:'فلفل, سیاه' },
  { cat:'spices', name:'فلفل قرمز', price:'۵۰,۰۰۰', unit:'۱۰۰ گرم', origin:'خراسان', keywords:'فلفل, قرمز' },
  { cat:'spices', name:'دارچین مرغوب', price:'۶۰,۰۰۰', unit:'۱۰۰ گرم', origin:'سریلانکا', keywords:'دارچین' },
  { cat:'spices', name:'زنجبیل خشک', price:'۷۰,۰۰۰', unit:'۱۰۰ گرم', origin:'هند', keywords:'زنجبیل' },
  { cat:'spices', name:'هل سبز', price:'۲۵۰,۰۰۰', unit:'۵۰ گرم', origin:'شیراز', keywords:'هل, سبز' },
  { cat:'spices', name:'میخک', price:'۱۲۰,۰۰۰', unit:'۵۰ گرم', origin:'اندونزی', keywords:'میخک' },
  { cat:'spices', name:'سماق ارگانیک', price:'۳۵,۰۰۰', unit:'۱۰۰ گرم', origin:'ارومیه', keywords:'سماق, ارگانیک' },
  { cat:'spices', name:'زیره سبز', price:'۸۰,۰۰۰', unit:'۱۰۰ گرم', origin:'کرمان', keywords:'زیره, سبز' },
  { cat:'spices', name:'زیره سیاه', price:'۱۱۰,۰۰۰', unit:'۱۰۰ گرم', origin:'یزد', keywords:'زیره, سیاه' },
  // === Pickles & Preserves (ترشی و شور) - 8 more ===
  { cat:'pickles', name:'ترشی مخلوط', price:'۸۰,۰۰۰', unit:'۵۰۰ گرم', origin:'اصفهان', keywords:'ترشی, مخلوط' },
  { cat:'pickles', name:'ترشی لیته', price:'۷۰,۰۰۰', unit:'۵۰۰ گرم', origin:'نیشابور', keywords:'ترشی, لیته' },
  { cat:'pickles', name:'شور بادمجان', price:'۶۰,۰۰۰', unit:'۵۰۰ گرم', origin:'ورامین', keywords:'شور, بادمجان' },
  { cat:'pickles', name:'شور مخلوط', price:'۴۵,۰۰۰', unit:'۵۰۰ گرم', origin:'همدان', keywords:'شور, مخلوط' },
  { cat:'pickles', name:'ترشی سیر', price:'۹۰,۰۰۰', unit:'۵۰۰ گرم', origin:'تویسرکان', keywords:'ترشی, سیر' },
  { cat:'pickles', name:'رب انار', price:'۷۰,۰۰۰', unit:'۳۰۰ گرم', origin:'ساوه', keywords:'رب, انار' },
  { cat:'pickles', name:'رب گوجه فرنگی', price:'۵۵,۰۰۰', unit:'۵۰۰ گرم', origin:'جیرفت', keywords:'رب, گوجه, فرنگی' },
  { cat:'pickles', name:'مربای بهار نارنج', price:'۹۵,۰۰۰', unit:'۳۰۰ گرم', origin:'مازندران', keywords:'مربا, بهار, نارنج' },
  // === Cosmetics (بهداشتی و آرایشی طبیعی) - 5 more ===
  { cat:'cosmetics', name:'صابون زیتون دست‌ساز', price:'۶۵,۰۰۰', unit:'عدد', origin:'مزرعه ده نشین', keywords:'صابون, زیتون, دست‌ساز' },
  { cat:'cosmetics', name:'صابون گلیسیرین زعفرانی', price:'۸۰,۰۰۰', unit:'عدد', origin:'مزرعه ده نشین', keywords:'صابون, گلیسیرین, زعفرانی' },
  { cat:'cosmetics', name:'کرم دست و روغن نارگیل', price:'۱۲۰,۰۰۰', unit:'۱۰۰ میلی', origin:'مزرعه ده نشین', keywords:'کرم, دست, نارگیل' },
  { cat:'cosmetics', name:'روغن نارگیل طبیعی', price:'۱５۰,۰۰۰', unit:'۲۰۰ میلی', origin:'مزرعه ده نشین', keywords:'روغن, نارگیل' },
  { cat:'cosmetics', name:'اسانس گل محمدی', price:'۹۵,۰۰۰', unit:'۳۰ میلی', origin:'کاشان', keywords:'اسانس, گل, محمدی' },
]

// Fetch max existing id
const lastProduct = await Product.findOne({}, {}, { sort: { id: -1 } })
let newId = lastProduct ? lastProduct.id + 1 : Date.now()

const toInsert = newProducts.map(g => {
  const nameEn = g.name_en || g.name
  const nameAr = g.name_ar || g.name
  return {
    id: newId++,
    name: g.name,
    name_fa: g.name,
    name_en: nameEn,
    name_ar: nameAr,
    slug: g.name.replace(/[\s،]+/g, '-').replace(/[^a-zA-Zآ-ی0-9\-]/g, ''),
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
    desc_en: nameEn,
    desc_ar: nameAr,
    features: JSON.stringify([
      { key: 'محل تولید', value: g.origin },
      { key: 'واحد', value: g.unit },
    ]),
    keywords: g.keywords,
  }
})

try {
  await Product.insertMany(toInsert, { ordered: false })
  console.log(`✅ Added ${toInsert.length} new products (total ~${toInsert.length + 38} now)`)
} catch (e) {
  console.error('Error:', e.message)
}

await mongoose.disconnect()
