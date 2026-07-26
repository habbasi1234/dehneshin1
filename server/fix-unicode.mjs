import mongoose from 'mongoose'
import Setting from './models/Setting.js'

const MONGODB_URI = 'mongodb://admin:dehneshin_secret_1404@localhost:27018/dehneshin?authSource=admin'

async function main() {
  await mongoose.connect(MONGODB_URI)

  const doc = await Setting.findById('global').lean()
  console.log('Current state:', Object.keys(doc).length, 'keys')

  const homepageSections = [
    { id: 'hero', type: 'hero', visible: true, order: 0 },
    { id: 'banner', type: 'banner', visible: true, order: 1 },
    { id: 'brand-intro', type: 'brand-intro', visible: true, order: 2 },
    { id: 'product-categories', type: 'product-categories', visible: true, order: 3 },
    { id: 'gallery-3d', type: 'gallery-3d', visible: true, order: 4 },
    { id: 'gallery', type: 'gallery', visible: true, order: 5 },
    { id: 'process-timeline', type: 'process-timeline', visible: true, order: 6 },
    { id: 'milestones', type: 'milestones', visible: true, order: 7 },
    { id: 'why-us', type: 'why-us', visible: true, order: 8 },
    { id: 'testimonials', type: 'testimonials', visible: true, order: 9 },
    { id: 'team', type: 'team', visible: true, order: 10 },
    { id: 'catalog', type: 'catalog', visible: true, order: 11 },
    { id: 'buying-tips', type: 'buying-tips', visible: true, order: 12 },
    { id: 'farm-map', type: 'eco-map', visible: true, order: 13 },
    { id: 'contact', type: 'contact', visible: true, order: 14 },
  ]

  const navLinks = [
    { path: '/', labelKey: 'home', label: 'خانه', visible: true },
    { path: '/products', labelKey: 'products', label: 'محصولات', visible: true },
    { path: '/cart', labelKey: 'cart', label: 'سبد خرید', visible: true },
    { path: '/track', labelKey: 'track', label: 'پیگیری سفارش', visible: true },
    { path: '/about', labelKey: 'about', label: 'درباره ما', visible: true },
    { path: '/account', labelKey: 'account', label: 'حساب کاربری', visible: true },
    { path: '/blog', labelKey: 'blog', label: 'مقالات', visible: true },
    { path: '/contact', labelKey: 'contact', label: 'تماس با ما', visible: true },
  ]

  const processes = [
    {
      id: 'order',
      title: { fa: 'فرآیند سفارش', en: 'Order Process', ar: 'عملية الطلب' },
      subtitle: { fa: 'از انتخاب تا تحویل سفارش شما', en: 'From Selection to Delivery', ar: 'من الاختيار إلى التسليم' },
      steps: [
        { number: '۱', title: { fa: 'انتخاب محصول', en: 'Product Selection', ar: 'اختيار المنتج' }, desc: { fa: 'مشاهده کاتالوگ و انتخاب محصول دلخواه', en: 'Browse catalog and select your product', ar: 'تصفح الكتالوج واختر منتجك' }, icon: '🍎' },
        { number: '۲', title: { fa: 'استعلام قیمت', en: 'Price Inquiry', ar: 'استعلام السعر' }, desc: { fa: 'مشاوره رایگان و استعلام قیمت محصول', en: 'Free consultation and price inquiry', ar: 'استشارة مجانية واستعلام السعر' }, icon: '💬' },
        { number: '۳', title: { fa: 'ثبت سفارش', en: 'Place Order', ar: 'تقديم الطلب' }, desc: { fa: 'ثبت سفارش و پرداخت بیعانه', en: 'Order placement and deposit payment', ar: 'تقديم الطلب ودفع العربون' }, icon: '📋' },
        { number: '۴', title: { fa: 'تولید و ساخت', en: 'Production', ar: 'الإنتاج' }, desc: { fa: 'تولید محصول با نظارت کیفیت', en: 'Production with quality control', ar: 'الإنتاج مع مراقبة الجودة' }, icon: '🔨' },
        { number: '۵', title: { fa: 'تحویل نهایی', en: 'Final Delivery', ar: 'التسليم النهائي' }, desc: { fa: 'تحویل و نصب محصول در محل شما', en: 'Delivery and installation at your location', ar: 'التسليم والتركيب في موقعك' }, icon: '🚚' },
      ]
    },
    {
      id: 'wholesale',
      title: { fa: 'خرید عمده', en: 'Wholesale', ar: 'البيع بالجملة' },
      subtitle: { fa: 'از مزرعه تا کسب‌وکار شما', en: 'From Farm to Your Business', ar: 'من المزرعة إلى عملك' },
      steps: [
        { number: '۱', title: { fa: 'ثبت درخواست', en: 'Submit Request', ar: 'تقديم الطلب' }, desc: { fa: 'ثبت درخواست خرید عمده با مشخصات مورد نظر', en: 'Submit wholesale order with your specifications', ar: 'تقديم طلب الشراء بالجملة مع المواصفات' }, icon: '📝' },
        { number: '۲', title: { fa: 'استعلام قیمت', en: 'Price Quote', ar: 'استعلام السعر' }, desc: { fa: 'دریافت قیمت عمده و تخفیف‌های ویژه', en: 'Get wholesale pricing and special discounts', ar: 'الحصول على أسعار الجملة والخصومات الخاصة' }, icon: '💰' },
        { number: '۳', title: { fa: 'تحویل عمده', en: 'Bulk Delivery', ar: 'التسليم بالجملة' }, desc: { fa: 'ارسال مستقیم از مزرعه به محل کسب‌وکار شما', en: 'Direct delivery from farm to your business', ar: 'توصيل مباشر من المزرعة إلى عملك' }, icon: '🚚' },
      ]
    },
    {
      id: 'reviews',
      title: { fa: 'فرآیند نظرات', en: 'Review Process', ar: 'عملية المراجعة' },
      subtitle: { fa: 'ثبت و بررسی نظرات مشتریان', en: 'Customer Review Process', ar: 'تسجيل ومراجعة آراء العملاء' },
      steps: [
        { number: '۱', title: { fa: 'ثبت نظر', en: 'Submit Review', ar: 'تقديم المراجعة' }, desc: { fa: 'ثبت تجربه خرید و نظر شما', en: 'Share your shopping experience', ar: 'شارك تجربتك في الشراء' }, icon: '✍' },
        { number: '۲', title: { fa: 'بررسی مدیریت', en: 'Admin Review', ar: 'مراجعة الإدارة' }, desc: { fa: 'بررسی و تایید نظر توسط مدیریت', en: 'Review verification by admin', ar: 'مراجعة وتأكيد من الإدارة' }, icon: '👁' },
        { number: '۳', title: { fa: 'انتشار', en: 'Published', ar: 'نشر' }, desc: { fa: 'انتشار نظر در سایت', en: 'Review published on site', ar: 'نشر المراجعة على الموقع' }, icon: '🌟' },
      ]
    }
  ]

  const update = {
    homepageSections,
    navLinks,
    processes,
    gallerySettings: { type: 'grid', images: [] },
    showHeroButtons: true,
  }

  await Setting.findByIdAndUpdate('global', { $set: update }, { upsert: true })

  const verify = await Setting.findById('global').lean()
  console.log('navLinks[0].label:', verify.navLinks?.[0]?.label)
  console.log('processes[0].title.fa:', verify.processes?.[0]?.title?.fa)
  console.log('processes[0].steps.length:', verify.processes?.[0]?.steps?.length)
  console.log('homepageSections:', verify.homepageSections?.length, 'items')

  await mongoose.disconnect()
}

main().catch(err => { console.error(err); process.exit(1) })
