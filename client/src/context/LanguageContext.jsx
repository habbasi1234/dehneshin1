import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const LANG_KEY = 'dehneshin-lang'

const translations = {
  fa: {
    home: 'خانه',
    products: 'محصولات',
    gallery: 'گالری',
    cart: 'سبد خرید',
    track: 'پیگیری سفارش',
    about: 'درباره ما',
    blog: 'مقالات',
    contact: 'تماس با ما',
    account: 'حساب کاربری',
    catalog: 'دانلود کاتالوگ',
    wholesale: 'خرید عمده',
    farmMap: 'نقشه مزارع',
    search: 'جستجو',
    searchPlaceholder: 'جستجوی محصولات...',
    close: 'بستن',
    loading: 'بارگذاری...',
    noResults: 'مطلبی یافت نشد',
    results: 'نتیجه',
    all: 'همه',
    articles: 'مقالات',
    rss: 'خبرخوان',
    category: 'دسته‌بندی',
    subcategory: 'زیردسته',
    tags: 'برچسب‌ها',
    readMore: 'ادامه مطلب',
    sendMessage: 'ارسال پیام',
    name: 'نام',
    email: 'ایمیل',
    phone: 'تلفن',
    message: 'پیام',
    messageSent: 'پیام شما با موفقیت ارسال شد',
    orderNow: 'سفارش دهید',
    addToCart: 'افزودن به سبد خرید',
    viewDetails: 'مشاهده جزییات',
    guaranty: 'گارانتی',
    price: 'قیمت',
    contactInfo: 'اطلاعات تماس',
    quickLinks: 'لینک‌های سریع',
    socialMedia: 'شبکه‌های اجتماعی',
    newsletter: 'خبرنامه',
    subscribe: 'عضویت',
    copyright: 'تمامی حقوق محفوظ است',
    ourTeam: 'تیم ما',
    ourStory: 'داستان ما',
    milestones: 'نقاط عطف',
    backToHome: 'بازگشت به خانه',
    emptyCart: 'سبد خرید خالی است',
    checkout: 'تکمیل سفارش',
    total: 'مجموع',
    discount: 'تخفیف',
    finalPrice: 'قیمت نهایی',
    orderTracking: 'پیگیری سفارش',
    orderCode: 'کد سفارش',
    trackOrder: 'پیگیری',
    orderStatus: 'وضعیت سفارش',
    customerInfo: 'اطلاعات مشتری',
    address: 'آدرس',
    notes: 'توضیحات',
    submit: 'ثبت',
    cancel: 'انصراف',
    save: 'ذخیره',
    edit: 'ویرایش',
    delete: 'حذف',
    add: 'افزودن',
    confirm: 'تأیید',
  },
  en: {
    home: 'Home',
    products: 'Products',
    gallery: 'Gallery',
    cart: 'Cart',
    track: 'Order Tracking',
    about: 'About Us',
    blog: 'Blog',
    contact: 'Contact Us',
    account: 'My Account',
    catalog: 'Download Catalog',
    wholesale: 'Wholesale',
    farmMap: 'Farm Map',
    search: 'Search',
    searchPlaceholder: 'Search products...',
    close: 'Close',
    loading: 'Loading...',
    noResults: 'No results found',
    all: 'All',
    articles: 'Articles',
    rss: 'RSS Feed',
    category: 'Category',
    subcategory: 'Subcategory',
    tags: 'Tags',
    readMore: 'Read More',
    sendMessage: 'Send Message',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    message: 'Message',
    messageSent: 'Your message has been sent successfully',
    orderNow: 'Order Now',
    addToCart: 'Add to Cart',
    viewDetails: 'View Details',
    guaranty: 'Guaranty',
    price: 'Price',
    contactInfo: 'Contact Info',
    quickLinks: 'Quick Links',
    socialMedia: 'Social Media',
    newsletter: 'Newsletter',
    subscribe: 'Subscribe',
    copyright: 'All rights reserved',
    ourTeam: 'Our Team',
    ourStory: 'Our Story',
    milestones: 'Milestones',
    backToHome: 'Back to Home',
    emptyCart: 'Cart is empty',
    checkout: 'Checkout',
    total: 'Total',
    discount: 'Discount',
    finalPrice: 'Final Price',
    orderTracking: 'Order Tracking',
    orderCode: 'Order Code',
    trackOrder: 'Track',
    orderStatus: 'Order Status',
    customerInfo: 'Customer Info',
    address: 'Address',
    notes: 'Notes',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    confirm: 'Confirm',
  },
  ar: {
    home: 'الرئیسیة',
    products: 'المنتجات',
    cart: 'عربة التسوق',
    track: 'تتبع الطلب',
    about: 'من نحن',
    blog: 'المقالات',
    contact: 'اتصل بنا',
    account: 'حسابي',
    catalog: 'تحمیل الكتالوج',
    wholesale: 'الجملة',
    farmMap: 'خریطة المزارع',
    search: 'بحث',
    searchPlaceholder: 'البحث عن المنتجات...',
    close: 'إغلاق',
    loading: 'جار التحمیل...',
    noResults: 'لم یتم العثور على نتائج',
    all: 'الكل',
    articles: 'المقالات',
    rss: 'آخر الأخبار',
    category: 'التصنیف',
    subcategory: 'التصنیف الفرعي',
    tags: 'الوسوم',
    readMore: 'اقرأ المزید',
    sendMessage: 'إرسال رسالة',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    message: 'الرسالة',
    messageSent: 'تم إرسال رسالتك بنجاح',
    orderNow: 'اطلب الآن',
    addToCart: 'أضف إلى السلة',
    viewDetails: 'عرض التفاصیل',
    guaranty: 'الضمان',
    price: 'السعر',
    contactInfo: 'معلومات الاتصال',
    quickLinks: 'روابط سریعة',
    socialMedia: 'وسائل التواصل',
    newsletter: 'النشرة الإخباریة',
    subscribe: 'اشتراك',
    copyright: 'جميع الحقوق محفوظة',
    ourTeam: 'فريقنا',
    ourStory: 'قصتنا',
    milestones: 'المحطات',
    backToHome: 'العودة للرئیسة',
    emptyCart: 'السلة فارغة',
    checkout: 'إتمام الطلب',
    total: 'المجموع',
    discount: 'الخصم',
    finalPrice: 'السعر النهائي',
    orderTracking: 'تتبع الطلب',
    orderCode: 'رمز الطلب',
    trackOrder: 'تتبع',
    orderStatus: 'حالة الطلب',
    customerInfo: 'معلومات العميل',
    address: 'العنوان',
    notes: 'ملاحظات',
    submit: 'إرسال',
    cancel: 'إلغاء',
    save: 'حفظ',
    edit: 'تعدیل',
    delete: 'حذف',
    add: 'إضافة',
    confirm: 'تأكید',
  },
}

const knownTextKeys = [
  'siteName', 'siteDescription', 'logoText', 'footerCopyright', 'aboutText',
  'heroBrandName', 'heroTitle', 'heroSubtitle', 'heroDescription',
  'brandIntroTitle', 'brandIntroText',
  'aboutTitle', 'aboutStoryTitle', 'aboutIntro', 'aboutFullText',
  'contactTitle', 'contactSubtitle',
  'heroButtons.primary', 'heroButtons.secondary',
  'catalogTitle', 'catalogSubtitle', 'catalogButtonText',
  'processTitle', 'processSubtitle',
  'ecoMapTitle', 'ecoMapSubtitle', 'ecoMapButtonText',
  'address', 'address2', 'workingHours', 'workingHoursFriday',
]

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem(LANG_KEY) || 'fa' } catch { return 'fa' }
  })

  const setLang = useCallback((l) => {
    setLangState(l)
    try { localStorage.setItem(LANG_KEY, l) } catch {}
    document.documentElement.dir = /^(fa|ar|he|ur|sd|ku|ps)$/.test(l) ? 'rtl' : 'ltr'
    document.documentElement.lang = l
  }, [])

  useEffect(() => {
    document.documentElement.dir = /^(fa|ar|he|ur|sd|ku|ps)$/.test(lang) ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang])

  const getText = useCallback((field) => {
    if (typeof field === 'string') return field
    if (field && typeof field === 'object') return field[lang] || field.fa || ''
    return ''
  }, [lang])

  const normalizeSettings = useCallback((settings) => {
    if (!settings) return settings
    const s = { ...settings }
    const langs = (s.languages || []).filter(l => l.enabled !== false).map(l => l.key)
    const activeLangs = langs.length > 0 ? langs : ['fa', 'en', 'ar']
    const makeObj = (src) => Object.fromEntries(activeLangs.map(k => [k, src?.[k] || '']))

    knownTextKeys.forEach(key => {
      const parts = key.split('.')
      let obj = s
      for (let i = 0; i < parts.length - 1; i++) {
        if (!obj[parts[i]]) obj[parts[i]] = {}
        obj = obj[parts[i]]
      }
      const last = parts[parts.length - 1]
      const val = obj[last]
      if (typeof val === 'string') {
        obj[last] = makeObj({ [activeLangs[0]]: val })
      }
    })
    if (s.footerLabels && typeof s.footerLabels === 'object') {
      Object.keys(s.footerLabels).forEach(k => {
        const v = s.footerLabels[k]
        if (typeof v === 'string') s.footerLabels[k] = makeObj({ [activeLangs[0]]: v })
      })
    }
    if (s.heroButtons && typeof s.heroButtons === 'object') {
      Object.keys(s.heroButtons).forEach(k => {
        const v = s.heroButtons[k]
        if (typeof v === 'string') s.heroButtons[k] = makeObj({ [activeLangs[0]]: v })
      })
    }
    if (!s.processes || s.processes.length === 0) {
      if (s.processSteps && s.processSteps.length > 0) {
        s.processes = [{
          id: 'default',
          title: s.processTitle ? (typeof s.processTitle === 'object' ? s.processTitle : makeObj({ [activeLangs[0]]: s.processTitle })) : makeObj(),
          subtitle: s.processSubtitle ? (typeof s.processSubtitle === 'object' ? s.processSubtitle : makeObj({ [activeLangs[0]]: s.processSubtitle })) : makeObj(),
          steps: s.processSteps.map((step, i) => ({
            number: step.number || (i + 1).toString(),
            title: typeof step.title === 'object' ? step.title : makeObj({ [activeLangs[0]]: step.title || '' }),
            desc: typeof step.desc === 'object' ? step.desc : makeObj({ [activeLangs[0]]: step.desc || '' }),
            icon: step.icon || '🔧',
          })),
        }]
      }
    }
    const normalizeArray = (arr, fields) =>
      (arr || []).map(item => {
        const obj = { ...item }
        fields.forEach(f => {
          if (typeof obj[f] !== 'object') obj[f] = makeObj({ [activeLangs[0]]: obj[f] || '' })
        })
        return obj
      })
    if (s.processes) {
      s.processes = s.processes.map(proc => ({
        ...proc,
        title: typeof proc.title === 'object' ? proc.title : makeObj({ [activeLangs[0]]: proc.title || '' }),
        subtitle: typeof proc.subtitle === 'object' ? proc.subtitle : makeObj({ [activeLangs[0]]: proc.subtitle || '' }),
        steps: (proc.steps || []).map(step => ({
          ...step,
          title: typeof step.title === 'object' ? step.title : makeObj({ [activeLangs[0]]: step.title || '' }),
          desc: typeof step.desc === 'object' ? step.desc : makeObj({ [activeLangs[0]]: step.desc || '' }),
        })),
      }))
    }
    s.banners = normalizeArray(s.banners, ['title', 'subtitle'])
    s.catalogs = normalizeArray(s.catalogs, ['title'])
    s.ecoMapCities = normalizeArray(s.ecoMapCities, ['name'])
    s.testimonials = normalizeArray(s.testimonials, ['text', 'name', 'role'])
    s.stats = normalizeArray(s.stats, ['label'])
    s.team = normalizeArray(s.team, ['name', 'role', 'desc'])
    s.milestones = normalizeArray(s.milestones, ['title', 'desc'])
    s.socialLinks = normalizeArray(s.socialLinks, ['label'])
    return s
  }, [])

  const t = useCallback((key) => {
    return translations[lang]?.[key] ?? translations.fa?.[key] ?? key
  }, [lang])

  return (
    <LanguageContext.Provider value={{
      lang, setLang, getText, t, normalizeSettings,
      dir: lang === 'fa' || lang === 'ar' ? 'rtl' : 'ltr',
      langMap: { fa: 'fa', en: 'en', ar: 'ar' },
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be inside LanguageProvider')
  return ctx
}
