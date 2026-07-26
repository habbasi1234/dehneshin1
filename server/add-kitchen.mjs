import mongoose from 'mongoose'
import Category from './models/Category.js'
import Product from './models/Product.js'

await mongoose.connect('mongodb://admin:dehneshin_secret_1404@localhost:27018/dehneshin?authSource=admin')

// 1. Add kitchen category
const cat = await Category.create({
  id: Date.now(),
  name: 'محصولات چوبی آشپزخانه',
  name_fa: 'محصولات چوبی آشپزخانه',
  name_en: 'Wooden Kitchen Products',
  name_ar: 'منتجات المطبخ الخشبیة',
  slug: 'kitchen',
  icon: '🍳',
})
console.log('Category created:', cat.name)

// 2. Kitchen products
const kitchenProducts = [
  {
    id: Date.now() + 1, name: 'کابینت آشپزخانه سلطنتی', name_fa: 'کابینت آشپزخانه سلطنتی',
    name_en: 'Royal Kitchen Cabinet', name_ar: 'خزانة مطبخ ملکیة',
    slug: 'royal-kitchen-cabinet', category: 'محصولات چوبی آشپزخانه',
    price: '450000000', status: 'active',
    images: JSON.stringify(['/uploads/1780954440563-100758240.webp', '/uploads/1780954509712-133058064.webp']),
    dimensions: '۳۶۰ × ۶۰ × ۲۲۰ سانتی‌متر', material: 'چوب گردو و MDF با روکش',
    description: 'کابینت آشپزخانه سلطنتی با طراحی نئوکلاسیک و دستگیره‌های طلاکوب. شامل کابینت بالا و پایین، هود مخفی و جزیره مرکزی. ساخته شده از چوب گردوی درجه یک با روکش پلی‌یورتان.',
    desc_fa: 'کابینت آشپزخانه سلطنتی با طراحی نئوکلاسیک و دستگیره‌های طلاکوب. شامل کابینت بالا و پایین و جزیره مرکزی.',
    desc_en: 'Royal kitchen cabinet with neoclassical design and gold-plated handles. Includes upper and lower cabinets and central island.',
    desc_ar: 'خزانة مطبخ ملکیة بتصمیم نیوكلاسيكي بمقابض مذهبة. تشمل خزائن علویة وسفلیة وجزیرة مرکزیة.',
    features: JSON.stringify([{key:'جنس',value:'گردوی درجه یک'},{key:'روکش',value:'پلی‌یورتان'},{key:'دستگیره',value:'طلاکوب'},{key:'جزیره',value:'مرکزی'},{key:'گارانتی',value:'۳۶ ماه'}]),
    colors: JSON.stringify([{name:'کرم طلایی',hex:'#F5E6C8'},{name:'گردویی',hex:'#5C3A1E'},{name:'سفید',hex:'#F5F5F5'}]),
    woodColors: JSON.stringify([{name:'گردو',hex:'#5C3A1E'},{name:'راش',hex:'#D4A373'}]),
    fabrics: '[]',
    keywords: 'کابینت, آشپزخانه, سلطنتی, kitchen, cabinet, royal, نئوکلاسیک',
    createdAt: '2026-06-09T10:00:00.000Z',
  },
  {
    id: Date.now() + 2, name: 'جزیره آشپزخانه پارس', name_fa: 'جزیره آشپزخانه پارس',
    name_en: 'Pars Kitchen Island', name_ar: 'جزیرة مطبخ بارس',
    slug: 'pars-kitchen-island', category: 'محصولات چوبی آشپزخانه',
    price: '280000000', status: 'active',
    images: JSON.stringify(['/uploads/1780954769935-834452566.webp', '/uploads/1780956989581-177087946.webp']),
    dimensions: '۱۸۰ × ۹۰ × ۹۰ سانتی‌متر', material: 'چوب گردو با رویه گرانیت',
    description: 'جزیره مرکزی آشپزخانه با رویه گرانیت طبیعی. دارای کشوهای متعدد، فضای ذخیره‌سازی بطری و محل نشیمن برای ۴ نفر. ایده‌آل برای آشپزخانه‌های بزرگ.',
    desc_fa: 'جزیره مرکزی آشپزخانه پارس با رویه گرانیت طبیعی و کشوهای متعدد.',
    desc_en: 'Pars central kitchen island with natural granite top and multiple drawers.',
    desc_ar: 'جزیرة مطبخ بارس المرکزیة بسطح جرانیت طبیعی وأدراج متعددة.',
    features: JSON.stringify([{key:'رویه',value:'گرانیت طبیعی'},{key:'کشو',value:'۶ عدد'},{key:'نشیمن',value:'۴ نفر'},{key:'گارانتی',value:'۲۴ ماه'}]),
    colors: JSON.stringify([{name:'گرانیت مشکی',hex:'#1A1A1A'},{name:'گرانیت کرم',hex:'#E8D5B7'}]),
    woodColors: JSON.stringify([{name:'گردو',hex:'#5C3A1E'},{name:'بلوط',hex:'#C19A6B'}]),
    fabrics: '[]',
    keywords: 'جزیره, آشپزخانه, پارس, kitchen island, pars, گرانیت',
    createdAt: '2026-06-09T10:00:00.000Z',
  },
  {
    id: Date.now() + 3, name: 'بوفه نقره‌ای', name_fa: 'بوفه نقره‌ای',
    name_en: 'Silver Buffet Cabinet', name_ar: 'بوفیه فضیة',
    slug: 'silver-buffet', category: 'محصولات چوبی آشپزخانه',
    price: '185000000', status: 'active',
    images: JSON.stringify(['/uploads/1780957045278-938430392.webp', '/uploads/1780957146528-38755725.webp']),
    dimensions: '۱۵۰ × ۴۵ × ۹۰ سانتی‌متر', material: 'چوب راش و روکش نقره‌ای',
    description: 'بوفه نقره‌ای با درب‌های شیشه‌ای و قفسه‌های نورپردازی شده. مناسب برای نگهداری و نمایش ظروف نقره، کریستال و دکوری.',
    desc_fa: 'بوفه نقره‌ای با درب‌های شیشه‌ای و نورپردازی LED. مناسب برای ظروف نقره و کریستال.',
    desc_en: 'Silver buffet with glass doors and LED lighting. Perfect for silverware, crystal, and decor display.',
    desc_ar: 'بوفیة فضیة بأبواب زجاجیة وإضاءة LED. مناسبة لعرض الأواني الفضیة والكریستال.',
    features: JSON.stringify([{key:'درب',value:'شیشه‌ای'},{key:'نورپردازی',value:'LED'},{key:'طبقه',value:'۳ عدد'},{key:'گارانتی',value:'۲۴ ماه'}]),
    colors: JSON.stringify([{name:'نقره‌ای',hex:'#C0C0C0'},{name:'سفید',hex:'#F5F5F5'}]),
    woodColors: JSON.stringify([{name:'راش',hex:'#D4A373'}]),
    fabrics: '[]',
    keywords: 'بوفه, نقره‌ای, آشپزخانه, buffet, silver, kitchen',
    createdAt: '2026-06-09T10:00:00.000Z',
  },
  {
    id: Date.now() + 4, name: 'میز ناهارخوری ۸ نفره', name_fa: 'میز ناهارخوری ۸ نفره کلاسیک',
    name_en: 'Classic 8-Seat Dining Table', name_ar: 'طاولة طعام كلاسيكیة لـ ۸ أشخاص',
    slug: 'classic-8-seat-dining', category: 'محصولات چوبی آشپزخانه',
    price: '350000000', salePrice: '290000000', discountPercent: 17, status: 'active',
    images: JSON.stringify(['/uploads/1780957026984-424962449.webp']),
    dimensions: '۲۲۰ × ۱۱۰ × ۷۶ سانتی‌متر', material: 'چوب گردو',
    description: 'میز ناهارخوری ۸ نفره با طراحی کلاسیک و پایه‌های منبت‌کاری شده. همراه با ۸ صندلی چوبی با روکش مخمل. ایده‌آل برای مهمانی‌ها و دورهمی‌های خانوادگی.',
    desc_fa: 'میز ناهارخوری ۸ نفره کلاسیک با پایه‌های منبت‌کاری شده و ۸ صندلی مخمل.',
    desc_en: 'Classic 8-seat dining table with carved legs and 8 velvet-upholstered chairs.',
    desc_ar: 'طاولة طعام لـ ۸ أشخاص بأرجل منحوتة و ۸ كراسي بمخمل.',
    features: JSON.stringify([{key:'ظرفیت',value:'۸ نفر'},{key:'صندلی',value:'۸ عدد'},{key:'جنس',value:'گردو'},{key:'روکش صندلی',value:'مخمل'},{key:'گارانتی',value:'۳۶ ماه'}]),
    colors: JSON.stringify([{name:'گردویی',hex:'#5C3A1E'},{name:'کرم',hex:'#F5E6C8'}]),
    woodColors: JSON.stringify([{name:'گردو',hex:'#5C3A1E'},{name:'بلوط',hex:'#C19A6B'}]),
    fabrics: JSON.stringify([{name:'مخمل',hex:'#800020'},{name:'مخمل',hex:'#1B2A4A'}]),
    keywords: 'میز ناهارخوری, ۸ نفره, کلاسیک, dining table, classic, 8-seat',
    createdAt: '2026-06-09T10:00:00.000Z',
  },
  {
    id: Date.now() + 5, name: 'کمد دیواری آشپزخانه', name_fa: 'کمد دیواری آشپزخانه مدرن',
    name_en: 'Modern Kitchen Pantry', name_ar: 'خزانة مؤن مطبخ حدیثة',
    slug: 'modern-kitchen-pantry', category: 'محصولات چوبی آشپزخانه',
    price: '220000000', status: 'active',
    images: JSON.stringify(['/uploads/1780954390411-497930471.webp', '/uploads/1780954413932-29314079.webp']),
    dimensions: '۲۰۰ × ۵۰ × ۲۲۰ سانتی‌متر', material: 'MDF با روکش',
    description: 'کمد دیواری مدرن آشپزخانه با ۴ درب، ۶ طبقه قابل تنظیم و ۳ کشو بزرگ. طراحی مینیمال با رنگ‌های خنثی و دستگیره‌های مخفی.',
    desc_fa: 'کمد دیواری آشپزخانه مدرن با ۴ درب، ۶ طبقه قابل تنظیم و ۳ کشو.',
    desc_en: 'Modern kitchen pantry with 4 doors, 6 adjustable shelves, and 3 large drawers.',
    desc_ar: 'خزانة مؤن مطبخ حدیثة بأربعة أبواب و ٦ أرفف قابلة للتعدیل و ۳ أدراج كبیرة.',
    features: JSON.stringify([{key:'درب',value:'۴ عدد'},{key:'طبقه',value:'۶ عدد قابل تنظیم'},{key:'کشو',value:'۳ عدد'},{key:'طراحی',value:'مینیمال'},{key:'گارانتی',value:'۲۴ ماه'}]),
    colors: JSON.stringify([{name:'سفید',hex:'#F5F5F5'},{name:'طوسی',hex:'#808080'},{name:'کرم',hex:'#F5E6C8'}]),
    woodColors: JSON.stringify([{name:'راش',hex:'#D4A373'}]),
    fabrics: '[]',
    keywords: 'کمد دیواری, آشپزخانه, مدرن, pantry, kitchen, modern, MDF',
    createdAt: '2026-06-09T10:00:00.000Z',
  },
]

for (const prod of kitchenProducts) {
  await Product.create(prod)
  console.log('Created:', prod.name_fa)
}

console.log(`Added ${kitchenProducts.length} kitchen products`)
await mongoose.disconnect()
