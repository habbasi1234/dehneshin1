import { useState, useEffect } from 'react'
import axios from 'axios'
import { useToast } from '../../components/admin/Toast'
import { useTheme } from '../../components/ThemeProvider'
import { useLanguage } from '../../context/LanguageContext'
import EmojiPicker from '../../components/admin/EmojiPicker'
import ImageUpload from '../../components/admin/ImageUpload'

function InputField({ label, value, onChange, type = 'text', dir, ...rest }) {
  if (type === 'textarea') {
    return (
      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>{label}</label>
        <textarea value={value} onChange={e => onChange(e.target.value)} dir={dir} rows={3} style={{ ...inputStyle, resize: 'vertical' }} {...rest} />
      </div>
    )
  }
  return (
    <div style={{ marginBottom: 8 }}>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} dir={dir} style={inputStyle} {...rest} />
    </div>
  )
}

const sectionStyle = {
  background: '#FAFAF7', borderRadius: 10, padding: 14,
  border: '1px solid #D4D0C8', marginBottom: 12,
}
const labelStyle = { color: '#2D2D2D', fontSize: 12, display: 'block', marginBottom: 2, marginTop: 6 }
const inputStyle = {
  width: '100%', padding: '6px 8px', background: '#FFFFFF', border: '1px solid #D4D0C8',
  borderRadius: 5, color: '#2D2D2D', fontSize: 12, outline: 'none', boxSizing: 'border-box',
}

const defaultSettings = {
  siteName: 'ده نشین',
  siteDescription: 'محصولات ارگانیک، از مزرعه تا سفره',
  logoText: 'ده',
  phone: '۰۲۱-۴۵۶۷۸۹۰۱',
  mobile: '۰۹۱۲-۳۳۳-۴۴۴۴',
  email: 'info@dehneshin.com',
  address: 'تهران، خیابان ولیعصر، بازار میوه و تره‌بار',
  address2: 'اصفهان، خیابان چهارباغ، مرکز محصولات ارگانیک',
  workingHours: 'شنبه تا پنجشنبه: ۸ صبح تا ۸ شب',
  workingHoursFriday: 'جمعه: ۹ صبح تا ۵ عصر',
  socialLinks: [
    { key: 'instagram', icon: '📷', url: 'https://instagram.com/dehneshin', label: 'اینستاگرام' },
    { key: 'telegram', icon: '✈', url: 'https://t.me/dehneshin', label: 'تلگرام' },
    { key: 'whatsapp', icon: '💬', url: 'https://wa.me/989123334444', label: 'واتساپ' },
    { key: 'bale', icon: '💛', url: '', label: 'بله' },
    { key: 'rubika', icon: '🔵', url: '', label: 'روبیکا' },
    { key: 'youtube', icon: '▶', url: 'https://youtube.com/@dehneshin', label: 'یوتیوب' },
    { key: 'pinterest', icon: '📌', url: 'https://pinterest.com/dehneshin', label: 'پینترست' },
  ],
  footerCopyright: 'تمامی حقوق مادی و معنوی این وب‌سایت متعلق به ده نشین می‌باشد',
  aboutText: 'از مزرعه تا سفره',
  heroBrandName: 'DEH NESHIN',
  heroTitle: 'ده نشین',
  heroSubtitle: 'محصولات ارگانیک · تازه و طبیعی · از مزرعه تا سفره',
  heroDescription: 'ده نشین، پل ارتباطی بین کشاورزان ارگانیک و سفره‌های شما. تازه‌ترین محصولات طبیعی را مستقیم از مزرعه به خانه شما می‌آوریم. طعم واقعی سلامت را تجربه کنید.',
  brandIntroTitle: 'از دل طبیعت، برای سلامتی شما',
  brandIntroText: 'ده نشین با همکاری بیش از ۱۵۰ کشاورز ارگانیک در سراسر ایران، تازه‌ترین و باکیفیت‌ترین محصولات طبیعی را از مزرعه به سفره شما می‌آورد. ما به سلامت شما و حفظ محیط زیست متعهدیم.',
  stats: [
    { icon: '👨‍🌾', value: '۱۵۰', suffix: '+', label: 'کشاورز ارگانیک' },
    { icon: '🌿', value: '۲۰۰', suffix: '+', label: 'محصول طبیعی' },
    { icon: '🌍', value: '۱۵', suffix: '', label: 'استان تولیدکننده' },
    { icon: '✅', value: '۱۰۰', suffix: '%', label: 'تضمین کیفیت' },
  ],
  footerLabels: {
    quickLinks: 'لینک‌های سریع',
    products: 'محصولات',
    connect: 'ارتباط با ما',
    workingHours: 'ساعت کاری',
  },
  heroButtons: {
    primary: 'محصولات ما',
    secondary: 'خرید عمده',
  },
  logoImage_fa: '',
  logoImage_en: '',
  logoImage_ar: '',
  showHeroButtons: true,
  banners: [
    { image: '', title: 'ده نشین', subtitle: 'محصولات ارگانیک · تازه و طبیعی · از مزرعه تا سفره', link: '/products', active: true },
  ],
  languages: [
    { key: 'fa', label: 'فارسی', flag: '🇮🇷', enabled: true },
    { key: 'en', label: 'English', flag: '🇬🇧', enabled: true },
    { key: 'ar', label: 'العربية', flag: '🇸🇦', enabled: true },
  ],
  aboutTitle: 'درباره ده نشین',
  aboutStoryTitle: 'داستان ما',
  aboutIntro: 'ده نشین از سال ۱۳۹۵ فعالیت خود را با هدف ترویج کشاورزی ارگانیک و سالم در ایران آغاز کرد. ما با همکاری کشاورزان ارگانیک در استان‌های مختلف کشور، تازه‌ترین میوه‌ها، سبزیجات، لبنیات و سایر محصولات را بدون واسطه به دست شما می‌رسانیم.',
  aboutFullText: 'امروز با شبکه‌ای از ۱۵۰+ کشاورز ارگانیک در ۱۵ استان ایران، بیش از ۲۰۰ محصول طبیعی را عرضه می‌کنیم. تمام محصولات ما دارای گواهی ارگانیک بوده و بدون استفاده از سموم شیمیایی و کودهای مصنوعی تولید می‌شوند. کیفیت و سلامت، رسالت ماست.',
  aboutImage: '',
  team: [
    { name: 'دکتر احمدی', role: 'بنیان‌گذار', desc: 'متخصص کشاورزی ارگانیک و توسعه پایدار', icon: '👨‍🌾' },
    { name: 'مهندس کریمی', role: 'مدیر کشاورزی', desc: 'کارشناس ارشد باغبانی و کشت ارگانیک', icon: '🌿' },
    { name: 'خانم رضایی', role: 'مدیر کیفیت', desc: 'متخصص کنترل کیفیت و استانداردهای ارگانیک', icon: '✅' },
    { name: 'مهندس موسوی', role: 'مدیر تأمین', desc: 'مسئول ارتباط با مزارع و تأمین محصولات', icon: '🚜' },
    { name: 'خانم نوری', role: 'مدیر فروش', desc: 'متخصص بازاریابی محصولات طبیعی', icon: '🌻' },
  ],
  milestones: [
    { year: '۱۳۹۵', title: 'تأسیس ده نشین', desc: 'آغاز فعالیت با ۲۰ کشاورز ارگانیک در ۳ استان' },
    { year: '۱۳۹۶', title: 'گواهی ارگانیک', desc: 'دریافت نخستین گواهی‌نامه‌های محصول ارگانیک' },
    { year: '۱۳۹۸', title: 'توسعه به ۱۰ استان', desc: 'شبکه مزارع همکار به ۱۰ استان کشور گسترش یافت' },
    { year: '۱۴۰۰', title: '۱۰۰ محصول', desc: 'عبور از مرز ۱۰۰ محصول طبیعی و ارگانیک' },
    { year: '۱۴۰۲', title: 'پیشرو در فروش آنلاین', desc: 'اولین فروشگاه تخصصی محصولات ارگانیک با تحویل درب منزل' },
    { year: '۱۴۰۴', title: '۲۰۰+ محصول و ۱۵۰+ کشاورز', desc: 'بزرگترین شبکه محصولات ارگانیک کشور' },
  ],
  contactTitle: 'تماس با ما',
  contactSubtitle: 'برای سفارش، مشاوره و همکاری با ما در ارتباط باشید',
  mapLat: '35.6892',
  mapLng: '51.3890',
  mapEmbed: '',
  contactFormEmail: 'info@dehneshin.com',
  contactFormEndpoint: '/api/contact',
  contactFormSuccess: 'پیام شما با موفقیت ارسال شد',
  contactFormError: 'خطا در ارسال پیام',
  rssFeeds: [
    { url: '', label: 'انجمن ارگانیک ایران', category: 'اخبار', enabled: true },
  ],
  rssCount: 10,
  rssCategory: 'اخبار',
  rssCategories: [],
  otpEnabled: true,
  otpLength: 5,
  otpExpiry: 180,
  otpMaxAttempts: 3,
  smsApiKey: '',
  smsLineNumber: '',
  smsTemplateId: '',
  smsProvider: 'smsir',
  smsApiBaseUrl: 'https://api.sms.ir/v1',
  themes: {
    active: 'light',
    available: [
      {
        id: 'royal-gold', name: 'سلطنتی طلایی',
        colors: {
          primary: '#D4AF37', primaryDark: '#8B6914', primaryLight: '#F0D060',
          background: '#0A0A0F', surface: '#1a1a1a', surfaceLight: '#222',
          text: '#F5E6C8', textSecondary: '#A89880', border: 'rgba(212,175,55,0.2)',
          cardBg: 'rgba(255,255,255,0.03)', success: '#D27D56', error: '#EF5350',
        },
      },
      { id:'light', name:'سفید سبز آجری', name_en:'White Green Terracotta', name_ar:'أبيض أخضر طيني',
  colors:{ primary:'#4CAF50', primaryDark:'#388E3C', primaryLight:'#C85A17', background:'#FFFFFF', surface:'#F8F8F5', surfaceLight:'#F0F0EA', text:'#2D2D2D', textSecondary:'#6B6B6B', border:'rgba(76,175,80,0.2)', cardBg:'rgba(0,0,0,0.02)', success:'#66BB6A', error:'#F44336' } },
      {
        id: 'purple-gold', name: 'بنفش طلایی',
        colors: {
          primary: '#C9A84C', primaryDark: '#9B59B6', primaryLight: '#D4AF37',
          background: '#1A1A2E', surface: '#16213E', surfaceLight: '#0F3460',
          text: '#F5E6C8', textSecondary: '#B8A9C4', border: 'rgba(201,168,76,0.25)',
          cardBg: 'rgba(255,255,255,0.03)', success: '#D27D56', error: '#EF5350',
        },
      },
      {
        id: 'silver', name: 'نقره‌ای',
        colors: {
          primary: '#C0C0C0', primaryDark: '#808080', primaryLight: '#E8E8E8',
          background: '#0D0D0D', surface: '#1A1A1A', surfaceLight: '#262626',
          text: '#F0F0F0', textSecondary: '#A0A0A0', border: 'rgba(192,192,192,0.2)',
          cardBg: 'rgba(255,255,255,0.03)', success: '#D27D56', error: '#EF5350',
        },
      },
      {
        id: 'copper', name: 'مسی',
        colors: {
          primary: '#B87333', primaryDark: '#8B5E3C', primaryLight: '#D4976C',
          background: '#1A1410', surface: '#2A2218', surfaceLight: '#3A3020',
          text: '#F0E6D6', textSecondary: '#B8A898', border: 'rgba(184,115,51,0.2)',
          cardBg: 'rgba(255,255,255,0.03)', success: '#D27D56', error: '#EF5350',
        },
      },
      {
        id:'emerald', name:'سبز و آجری', name_en:'Green Terracotta', name_ar:'أخضر طيني',
        colors:{ primary:'#4CAF50', primaryDark:'#388E3C', primaryLight:'#C85A17', background:'#0D2B1A', surface:'#1A3D28', surfaceLight:'#2A4F38', text:'#F5E6C8', textSecondary:'#A8D0B0', border:'rgba(76,175,80,0.25)', cardBg:'rgba(255,255,255,0.03)', success:'#66BB6A', error:'#EF5350' },
      },
      {
        id: 'ruby', name: 'یاقوتی',
        colors: {
          primary: '#E0115F', primaryDark: '#8B0040', primaryLight: '#FF6B8A',
          background: '#1A080E', surface: '#2A0F18', surfaceLight: '#3A1A24',
          text: '#F5E0E8', textSecondary: '#C8A0B0', border: 'rgba(224,17,95,0.2)',
          cardBg: 'rgba(255,255,255,0.03)', success: '#D27D56', error: '#EF5350',
        },
      },
      {
        id: 'royal-blue', name: 'آبی سلطنتی',
        colors: {
          primary: '#4169E1', primaryDark: '#1E3A8A', primaryLight: '#6B8FF0',
          background: '#080C1A', surface: '#0F1528', surfaceLight: '#1A2238',
          text: '#E0E8F8', textSecondary: '#90A8D0', border: 'rgba(65,105,225,0.2)',
          cardBg: 'rgba(255,255,255,0.03)', success: '#D27D56', error: '#EF5350',
        },
      },
      {
        id: 'midnight', name: 'نیمه‌شب',
        colors: {
          primary: '#B0B8E0', primaryDark: '#505878', primaryLight: '#D0D8F0',
          background: '#050510', surface: '#0A0A1A', surfaceLight: '#121228',
          text: '#D8DCF0', textSecondary: '#8890B0', border: 'rgba(176,184,224,0.2)',
          cardBg: 'rgba(255,255,255,0.03)', success: '#D27D56', error: '#EF5350',
        },
      },
    ],
  },
  homepageSections: [
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
    { id: 'eco-map', type: 'eco-map', visible: true, order: 13 },
    { id: 'buying-tips', type: 'buying-tips', visible: true, order: 12 },
    { id: 'contact', type: 'contact', visible: true, order: 14 },
  ],
  navLinks: [
    { path: '/', labelKey: 'home', label: 'خانه', visible: true },
    { path: '/products', labelKey: 'products', label: 'محصولات', visible: true },
    { path: '/cart', labelKey: 'cart', label: 'سبد خرید', visible: true },
    { path: '/track', labelKey: 'track', label: 'پیگیری سفارش', visible: true },
    { path: '/about', labelKey: 'about', label: 'درباره ما', visible: true },
    { path: '/account', labelKey: 'account', label: 'حساب کاربری', visible: true },
    { path: '/blog', labelKey: 'blog', label: 'مقالات', visible: true },
    { path: '/contact', labelKey: 'contact', label: 'تماس با ما', visible: true },
  ],
  catalogTitle: 'کاتالوگ محصولات',
  catalogSubtitle: 'جدیدترین محصولات ارگانیک ما را در کاتالوگ دیجیتال مشاهده کنید',
  catalogButtonText: 'دانلود کاتالوگ',
  catalogs: [
    { title: 'کاتالوگ محصولات ۱۴۰۴', file: '', category: 'محصولات', active: true },
  ],
  processTitle: 'از مزرعه تا سفره',
  processSubtitle: 'مسیر تازه‌ترین محصولات از دل طبیعت',
  processSteps: [
    { number: '۱', title: 'کشت طبیعی', desc: 'کشت بدون سم و کود شیمیایی در مزارع ارگانیک', icon: '🌱' },
    { number: '۲', title: 'برداشت تازه', desc: 'برداشت در زمان رسیدن کامل برای حداکثر کیفیت', icon: '🌾' },
    { number: '۳', title: 'بسته‌بندی بهداشتی', desc: 'بسته‌بندی استاندارد و بهداشتی با حفظ تازگی', icon: '📦' },
    { number: '۴', title: 'حمل و نقل سریع', desc: 'زنجیره سرد و حمل و نقل سریع تا درب منزل', icon: '🚚' },
    { number: '۵', title: 'تحویل به مشتری', desc: 'تحویل تازه و سالم محصولات به دست شما', icon: '🏠' },
  ],
  processes: [
    {
      id: 'default',
      title: { fa: 'فرآیند تولید', en: 'Production Process', ar: 'عملیة الإنتاج' },
      subtitle: { fa: 'از مزرعه تا سفره', en: 'From farm to table', ar: 'من المزرعة إلى المائدة' },
      steps: [
        { number: '۱', title: { fa: 'کشت طبیعی', en: 'Natural Cultivation', ar: 'الزراعة الطبیعیة' }, desc: { fa: 'کشت بدون سم و کود شیمیایی در مزارع ارگانیک', en: 'Cultivation without pesticides in organic farms', ar: 'زراعة بدون مبیدات في مزارع عضویة' }, icon: '🌱' },
        { number: '۲', title: { fa: 'برداشت تازه', en: 'Fresh Harvest', ar: 'الحصاد الطازج' }, desc: { fa: 'برداشت در زمان رسیدن کامل برای حداکثر کیفیت', en: 'Harvested at peak ripeness for maximum quality', ar: 'الحصاد في مرحلة النضج الكامل لأقصى جودة' }, icon: '🌾' },
        { number: '۳', title: { fa: 'بسته‌بندی بهداشتی', en: 'Hygienic Packaging', ar: 'التغلیف الصحي' }, desc: { fa: 'بسته‌بندی استاندارد و بهداشتی با حفظ تازگی', en: 'Standard hygienic packaging preserving freshness', ar: 'تغلیف صحي قیاسي یحافظ على النضارة' }, icon: '📦' },
        { number: '۴', title: { fa: 'حمل و نقل سریع', en: 'Fast Delivery', ar: 'التوصیل السریع' }, desc: { fa: 'زنجیره سرد و حمل و نقل سریع تا درب منزل', en: 'Cold chain and express delivery to your door', ar: 'سلسلة التبريد والتوصيل السريع إلى باب منزلك' }, icon: '🚚' },
        { number: '۵', title: { fa: 'تحویل به مشتری', en: 'Customer Delivery', ar: 'التسلیم للعمیل' }, desc: { fa: 'تحویل تازه و سالم محصولات به دست شما', en: 'Fresh and safe delivery of products to you', ar: 'توصیل طازج وآمن للمنتجات إلیك' }, icon: '🏠' },
      ],
    },
  ],
  testimonials: [
    { image: '', text: 'خیارهای ارگانیک ده نشین واقعاً طعم خیارهای باغ مادربزرگمو داره. بعد سال‌ها دوباره طعم واقعی خیار رو چشیدم!', name: 'خانواده احمدی', role: 'مشتری وفادار' },
    { image: '', text: 'از وقتی محصولات ده نشین رو به رژیم غذایی خانواده اضافه کردم، انرژی بچه‌ها خیلی بیشتر شده. مرسی از محصولات باکیفیت‌تون.', name: 'خانم محمدی', role: 'مادر خانواده' },
    { image: '', text: 'کاهو و سبزیجات ده نشین مثل این‌که تازه از باغچه چیده شده باشن. واقعاً تفاوت رو حس می‌کنی.', name: 'آقای رضایی', role: 'سرآشپز حرفه‌ای' },
    { image: '', text: 'روغن زیتون فوق‌العاده‌تون بی‌نظیره. من برای همه سالادها و پخت‌وه‌پزم فقط از محصولات ده نشین استفاده می‌کنم.', name: 'خانم موسوی', role: 'متخصص تغذیه' },
    { image: '', text: 'عسل طبیعی ده نشین رو به همه دوستان و آشنایان توصیه می‌کنم. کیفیتش با عسل‌های معمولی قابل مقایسه نیست.', name: 'آقای کاظمی', role: 'مشتری ثابت' },
    { image: '', text: 'بسته‌بندی محصولات ده نشین خیلی بهداشتی و شکیل هست. با اعتماد کامل می‌تونم به عنوان هدیه هم استفاده کنم.', name: 'خانم حسینی', role: 'طراح داخلی' },
    { image: '', text: 'من مبتلا به حساسیت‌های غذایی هستم و محصولات ارگانیک ده نشین تنها محصولاتی هستن که بدون نگرانی می‌تونم مصرف کنم.', name: 'آقای صادقی', role: 'مشتری ویژه' },
    { image: '', text: 'برنج ارگانیک ده نشین عطر و طعم بی‌نظیری داره. مهمونا همشون از طعم برنج تعریف کردن.', name: 'خانم کریمی', role: 'مدیر رستوران' },
    { image: '', text: 'خیالم راحته که محصولات ده نشین بدون سم و کود شیمیایی هستن. برای یه مادر این مهم‌ترین چیزه.', name: 'خانم رحمانی', role: 'مشتری وفادار' },
    { image: '', text: 'ارسال سریع و به‌موقع، بسته‌بندی عالی و محصولات تازه. ترکیب این سه تا باعث شده مشتری ثابت ده نشین باشم.', name: 'آقای نادری', role: 'خریدار عمده' },
  ],
  ecoMapTitle: 'نقشه مزارع ارگانیک ایران',
  ecoMapSubtitle: 'مهم‌ترین قطب‌های تولید محصولات ارگانیک در سراسر ایران',
  ecoMapButtonText: 'مشاهده نقشه تعاملی مزارع',
  ecoMapCities: [
    { name: 'تهران', count: '۸ مزرعه', color: '#4CAF50' },
    { name: 'اصفهان', count: '۱۵۰+ مزرعه', color: '#E8C84A' },
    { name: 'تبریز', count: '۸۰+ مزرعه', color: '#8B6914' },
    { name: 'مشهد', count: '۵۰+ مزرعه', color: '#4CAF50' },
    { name: 'شیراز', count: '۴۰+ مزرعه', color: '#E8C84A' },
  ],
  galleryTitle: 'گالری محصولات',
  gallerySubtitle: 'مجموعه‌ای از محصولات تازه و طبیعی ده نشین',
  gallerySettings: {
    type: 'grid',
    images: [
      { url: '', category: 'میوه', title: { fa: 'سیب ارگانیک - تازه از باغ‌های ارگانیک آذربایجان' } },
      { url: '', category: 'میوه', title: { fa: 'پرتقال تامسون - شیرین و آبدار از مزارع شمال' } },
      { url: '', category: 'سبزی', title: { fa: 'سبزیجات برگی - تازه و بدون سم از مزارع ارگانیک' } },
      { url: '', category: 'لبنیات', title: { fa: 'ماست ارگانیک - تولید شده از شیر گاوهای آزادچر' } },
      { url: '', category: 'غلات', title: { fa: 'برنج ارگانیک - از شالیزارهای ارگانیک گیلان' } },
      { url: '', category: 'عسل', title: { fa: 'عسل کوهستان - طبیعی و خام از دامنه‌های زاگرس' } },
      { url: '', category: 'خشکبار', title: { fa: 'پسته اکبری - ارگانیک و درشت از مزارع رفسنجان' } },
      { url: '', category: 'هنر', title: { fa: 'سبدهای حصیری - بافته شده توسط بانوان روستایی' } },
      { url: '', category: 'صنعت', title: { fa: 'کشاورزی ارگانیک ایران - قطب‌های تولید تهران، اصفهان، تبریز و مشهد' } },
    ],
  },
  mapSettings: {
    type: 'iran-provinces',
    items: [
      { name: { fa: 'تهران', en: 'Tehran', ar: '' }, country: { fa: 'ایران', en: 'Iran', ar: '' }, count: '۴ شعبه', color: '#4CAF50', lat: 35.6892, lng: 51.3890, branches: [] },
      { name: { fa: 'اصفهان', en: 'Isfahan', ar: '' }, country: { fa: 'ایران', en: 'Iran', ar: '' }, count: '۳ شعبه', color: '#E8C84A', lat: 32.6546, lng: 51.6683, branches: [] },
      { name: { fa: 'مشهد', en: 'Mashhad', ar: '' }, country: { fa: 'ایران', en: 'Iran', ar: '' }, count: '۲ شعبه', color: '#8B6914', lat: 36.2970, lng: 59.6000, branches: [] },
    ],
  },
}

export default function AdminSettings() {
  const addToast = useToast()
  const { applyThemeById, setTheme } = useTheme()
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/admin/settings')
      setJsonRaw(JSON.stringify(data, null, 2))
      setSettings(normalizeSettings(data))
    } catch { addToast('خطا در بارگذاری تنظیمات', 'error') }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const hc = (key, value) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.')
      setSettings(prev => ({
        ...prev,
        [parent]: { ...(prev[parent] || {}), [child]: value },
      }))
    } else {
      setSettings(prev => ({ ...prev, [key]: value }))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = activeTab === 'json' ? JSON.parse(jsonRaw) : settings
      await axios.put('/api/admin/settings', payload)
      if (activeTab === 'json') setSettings(normalizeSettings(payload))
      if (payload?.themes) applyThemeById(payload.themes.active, payload.themes)
      addToast('تنظیمات با موفقیت ذخیره شد', 'success')
    } catch (e) { addToast(e.message?.includes('JSON') ? 'JSON نامعتبر است' : 'خطا در ذخیره تنظیمات', 'error') }
    setSaving(false)
  }

  const resetDefaults = async () => {
    try {
      await axios.put('/api/admin/settings', defaultSettings)
      setSettings(defaultSettings)
      addToast('تنظیمات به حالت پیش‌فرض بازگشت', 'success')
    } catch { addToast('خطا در بازگشت به پیش‌فرض', 'error') }
  }

  const addStat = () => {
    setSettings(prev => ({
      ...prev,
      stats: [...(prev.stats || []), { icon: '✨', value: '۱۰۰', suffix: '+', label: { fa: 'مورد جدید', en: '', ar: '' } }],
    }))
  }

  const updateStat = (idx, field, value) => {
    setSettings(prev => {
      const stats = [...(prev.stats || [])]
      stats[idx] = { ...stats[idx], [field]: value }
      return { ...prev, stats }
    })
  }

  const removeStat = (idx) => {
    setSettings(prev => ({
      ...prev,
      stats: (prev.stats || []).filter((_, i) => i !== idx),
    }))
  }

  const addBanner = () => {
    setSettings(prev => ({
      ...prev,
      banners: [...(prev.banners || []), { image: '', title: makeLangObj(), subtitle: makeLangObj(), link: '', active: true }],
    }))
  }

  const updateBanner = (idx, field, value) => {
    setSettings(prev => {
      const banners = [...(prev.banners || [])]
      banners[idx] = { ...banners[idx], [field]: value }
      return { ...prev, banners }
    })
  }

  const removeBanner = (idx) => {
    setSettings(prev => ({
      ...prev,
      banners: (prev.banners || []).filter((_, i) => i !== idx),
    }))
  }

  const { normalizeSettings, getText, lang } = useLanguage()
  const [activeTab, setActiveTab] = useState('general')
  const [emojiPicker, setEmojiPicker] = useState(null) // { target: 'socialLinks'|'stats'|'team', index }
  const [jsonRaw, setJsonRaw] = useState('')

  if (loading) return <div style={{ color: '#6B6B6B', textAlign: 'center', padding: 40 }}>در حال بارگذاری...</div>
  if (!settings) return <div style={{ color: '#ff4444', textAlign: 'center', padding: 40 }}>خطا در بارگذاری</div>

  const getVal = (key) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.')
      return settings[parent]?.[child] ?? ''
    }
    return settings[key] ?? ''
  }

  const getDefaultVal = (key) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.')
      return defaultSettings[parent]?.[child] ?? ''
    }
    return defaultSettings[key] ?? ''
  }

  const renderField = (key, label, options = {}) => {
    const defVal = getDefaultVal(key)
    const ph = options.placeholder || (defVal ? `پیش‌فرض: ${defVal}` : '')
    return (
      <div key={key}>
        <label style={labelStyle}>{label}</label>
        {options.type === 'textarea' ? (
          <textarea value={getVal(key)} onChange={e => hc(key, e.target.value)}
            rows={options.rows || 3} style={{ ...inputStyle, resize: 'vertical' }} placeholder={ph} />
        ) : (
          <input type={options.type || 'text'} value={getVal(key)} onChange={e => hc(key, e.target.value)}
            style={{ ...inputStyle, direction: options.ltr ? 'ltr' : 'rtl' }} placeholder={ph} />
        )}
      </div>
    )
  }

  const langKeys = (settings.languages || []).filter(l => l.enabled !== false).map(l => l.key)
  const langLabels = Object.fromEntries((settings.languages || []).filter(l => l.key).map(l => [l.key, l.label || l.key]))
  const makeLangObj = (src) => Object.fromEntries(langKeys.map(k => [k, src?.[k] || '']))
  const renderLangField = (key, label, options = {}) => {
    const val = getVal(key)
    const isObj = val && typeof val === 'object'
    return (
      <div key={key}>
        <label style={labelStyle}>{label}</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {langKeys.map(lk => (
            <div key={lk} style={{ flex: 1, minWidth: 120 }}>
              <span style={{ fontSize: 10, color: '#4CAF50', display: 'block', marginBottom: 2 }}>{langLabels[lk]}</span>
              {options.type === 'textarea' ? (
                <textarea value={isObj ? (val[lk] || '') : ''} onChange={e => {
                  const cur = getVal(key)
                  const obj = (cur && typeof cur === 'object') ? { ...cur } : makeLangObj()
                  obj[lk] = e.target.value
                  hc(key, obj)
                }} rows={options.rows || 2} style={{ ...inputStyle, resize: 'vertical', fontSize: 11 }} placeholder={options.placeholder || langLabels[lk]} />
              ) : (
                <input type={options.type || 'text'} value={isObj ? (val[lk] || '') : ''} onChange={e => {
                  const cur = getVal(key)
                  const obj = (cur && typeof cur === 'object') ? { ...cur } : makeLangObj()
                  obj[lk] = e.target.value
                  hc(key, obj)
                }} style={{ ...inputStyle, fontSize: 11, direction: options.ltr ? 'ltr' : 'rtl' }} placeholder={langLabels[lk]} />
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
        <h2 style={{ color: '#4CAF50', fontSize: 18, margin: 0 }}>تنظیمات سایت</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={resetDefaults} style={{
            padding: '5px 12px', background: '#F0F0EA', color: '#4CAF50',
            border: '1px solid #FFA726', borderRadius: 6, cursor: 'pointer', fontSize: 11,
          }}>بازگشت به پیش‌فرض</button>
          <button onClick={handleSave} disabled={saving} style={{
            padding: '5px 14px', background: saving ? '#666' : 'linear-gradient(135deg, #4CAF50, #388E3C)',
            color: '#fff', border: 'none', borderRadius: 6, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: 12,
          }}>{saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 3, marginBottom: 10, flexWrap: 'wrap' }}>
        {[
          { key: 'general', label: 'عمومی', icon: '⚙' },
          { key: 'languages', label: 'زبان‌ها', icon: '🌐' },
          { key: 'catalog', label: 'کاتالوگ', icon: '📖' },
          { key: 'process', label: 'فرآیند', icon: '⚙' },
          { key: 'testimonials', label: 'نظرات', icon: '💬' },
          { key: 'eco-map', label: 'نقشه', icon: '🗺' },
          { key: 'gallery', label: 'گالری', icon: '🖼' },
          { key: 'rss', label: 'RSS', icon: '📡' },
          { key: 'otp', label: 'OTP', icon: '🔐' },
          { key: 'theme', label: 'تم', icon: '🎨' },
          { key: 'banners', label: 'بنرها', icon: '🖼' },
          { key: 'about', label: 'درباره ما', icon: 'ℹ' },
          { key: 'hero', label: 'صفحه اصلی', icon: '🏠' },
          { key: 'contact', label: 'تماس', icon: '📞' },
          { key: 'footer', label: 'فوتر', icon: '📄' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '5px 12px', borderRadius: 50, border: activeTab === tab.key ? '2px solid #D4AF37' : '1px solid #444',
            background: activeTab === tab.key ? 'rgba(212,175,55,0.12)' : 'transparent',
            color: activeTab === tab.key ? '#D4AF37' : '#999', cursor: 'pointer', fontSize: 11, fontWeight: activeTab === tab.key ? 700 : 400,
            transition: 'all 0.2s',
          }}>{tab.icon} {tab.label}</button>
        ))}
      </div>

      <div style={{...sectionStyle, display: activeTab === 'languages' ? 'block' : 'none'}}>
        <h3 style={{ color: '#4CAF50', margin: '0 0 8px', fontSize: 14 }}>زبان‌های سایت</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {(settings.languages || []).map((lang, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
              <input value={lang.key || ''} onChange={e => {
                const arr = [...(settings.languages || [])]
                arr[idx] = { ...arr[idx], key: e.target.value }
                hc('languages', arr)
              }} style={{ width: 40, padding: '4px 6px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 4, color: '#2D2D2D', fontSize: 11, textAlign: 'center' }} placeholder="fa" />
              <input value={lang.label || ''} onChange={e => {
                const arr = [...(settings.languages || [])]
                arr[idx] = { ...arr[idx], label: e.target.value }
                hc('languages', arr)
              }} style={{ flex: 1, padding: '4px 6px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 4, color: '#2D2D2D', fontSize: 11 }} placeholder="فارسی" />
              <select value={lang.flag || (lang.key === 'fa' ? '🌐' : '')} onChange={e => {
                const arr = [...(settings.languages || [])]
                arr[idx] = { ...arr[idx], flag: e.target.value }
                hc('languages', arr)
              }} style={{ width: 100, padding: '4px 6px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 4, color: '#2D2D2D', fontSize: 12, textAlign: 'center', outline: 'none' }}>
                {[
                  { v: '🇮🇷', l: 'ایران' }, { v: '🇬🇧', l: 'انگلیس' }, { v: '🇺🇸', l: 'آمریکا' },
                  { v: '🇸🇦', l: 'عربستان' }, { v: '🇦🇪', l: 'امارات' }, { v: '🇹🇷', l: 'ترکیه' },
                  { v: '🇫🇷', l: 'فرانسه' }, { v: '🇩🇪', l: 'آلمان' }, { v: '🇮🇹', l: 'ایتالیا' },
                  { v: '🇪🇸', l: 'اسپانیا' }, { v: '🇷🇺', l: 'روسیه' }, { v: '🇨🇳', l: 'چین' },
                  { v: '🇯🇵', l: 'ژاپن' }, { v: '🇰🇷', l: 'کره' }, { v: '🇮🇳', l: 'هند' },
                  { v: '🇵🇰', l: 'پاکستان' }, { v: '🇦🇫', l: 'افغانستان' }, { v: '🇮🇶', l: 'عراق' },
                  { v: '🇸🇾', l: 'سوریه' }, { v: '🇱🇧', l: 'لبنان' }, { v: '🇪🇬', l: 'مصر' },
                  { v: '🇲🇾', l: 'مالزی' }, { v: '🇨🇦', l: 'کانادا' }, { v: '🇦🇺', l: 'استرالیا' },
                ].map(o => <option key={o.v} value={o.v}>{o.v} {o.l}</option>)}
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6B6B6B', fontSize: 11, cursor: 'pointer' }}>
                <input type="checkbox" checked={lang.enabled !== false} onChange={e => {
                  const arr = [...(settings.languages || [])]
                  arr[idx] = { ...arr[idx], enabled: e.target.checked }
                  hc('languages', arr)
                }} />
                فعال
              </label>
              <button onClick={() => hc('languages', (settings.languages || []).filter((_, i) => i !== idx))} style={{ padding: '2px 6px', background: 'rgba(239,83,80,0.2)', color: '#EF5350', border: 'none', borderRadius: 3, cursor: 'pointer', fontSize: 12 }}>✕</button>
            </div>
          ))}
        </div>
        <button onClick={() => hc('languages', [...(settings.languages || []), { key: '', label: '', flag: '🌐', enabled: true }])} style={{ marginTop: 6, padding: '4px 12px', background: 'rgba(212,175,55,0.15)', color: '#4CAF50', border: '1px dashed #D4AF37', borderRadius: 5, cursor: 'pointer', fontSize: 11 }}>+ افزودن زبان</button>
      </div>

      <div style={{...sectionStyle, display: activeTab === 'catalog' ? 'block' : 'none'}}>
        <h3 style={{ color: '#4CAF50', margin: '0 0 8px', fontSize: 14 }}>تنظیمات بخش کاتالوگ</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          {renderLangField('catalogTitle', 'عنوان بخش')}
          {renderLangField('catalogSubtitle', 'زیرنویس')}
          {renderLangField('catalogButtonText', 'متن دکمه')}
        </div>
        <p style={{ color: '#6B6B6B', fontSize: 11, margin: '10px 0 6px' }}>فایل‌های کاتالوگ (قابل افزایش/کاهش)</p>
        {(settings.catalogs || []).map((cat, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center', padding: 8, background: 'rgba(255,255,255,0.02)', borderRadius: 6, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ color: '#555', fontSize: 11 }}>{idx + 1}.</span>
            <div style={{ minWidth: 140, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {langKeys.map(lk => (
                <div key={lk} style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <span style={{ fontSize: 7, color: '#4CAF50', minWidth: 14 }}>{langLabels[lk]}</span>
                  <input value={typeof cat.title === 'object' ? (cat.title?.[lk] || '') : (lk === lang ? (cat.title || '') : '')} onChange={e => {
                    const arr = [...(settings.catalogs || [])]
                    const existing = arr[idx].title
                    const obj = (typeof existing === 'object' && existing) ? { ...existing } : { fa: '', en: '', ar: '' }
                    obj[lk] = e.target.value
                    arr[idx] = { ...arr[idx], title: obj }
                    hc('catalogs', arr)
                  }} style={{ width: '100%', padding: '3px 4px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 3, color: '#2D2D2D', fontSize: 10 }} placeholder={lk === 'fa' ? 'عنوان' : lk === 'en' ? 'Title' : 'العنوان'} />
                </div>
              ))}
            </div>
            <input value={cat.category || ''} onChange={e => {
              const arr = [...(settings.catalogs || [])]; arr[idx] = { ...arr[idx], category: e.target.value }
              hc('catalogs', arr)
            }} style={{ width: 100, padding: '4px 6px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 3, color: '#2D2D2D', fontSize: 11 }} placeholder="دسته‌بندی" />
            <ImageUpload value={cat.file} onChange={url => {
              const arr = [...(settings.catalogs || [])]; arr[idx] = { ...arr[idx], file: url }
              hc('catalogs', arr)
            }} label="فایل" />
            <label style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#6B6B6B', fontSize: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={cat.active !== false} onChange={e => {
                const arr = [...(settings.catalogs || [])]; arr[idx] = { ...arr[idx], active: e.target.checked }
                hc('catalogs', arr)
              }} />
              فعال
            </label>
            <button onClick={() => hc('catalogs', (settings.catalogs || []).filter((_, i) => i !== idx))} style={{ padding: '2px 6px', background: 'rgba(239,83,80,0.2)', color: '#EF5350', border: 'none', borderRadius: 3, cursor: 'pointer', fontSize: 11 }}>✕</button>
          </div>
        ))}
        <button onClick={() => hc('catalogs', [...(settings.catalogs || []), { title: makeLangObj(), file: '', category: '', active: true }])} style={{ marginTop: 4, padding: '4px 12px', background: 'rgba(212,175,55,0.15)', color: '#4CAF50', border: '1px dashed #D4AF37', borderRadius: 5, cursor: 'pointer', fontSize: 11 }}>+ افزودن کاتالوگ</button>
      </div>

      <div style={{...sectionStyle, display: activeTab === 'process' ? 'block' : 'none'}}>
        <h3 style={{ color: '#4CAF50', margin: '0 0 8px', fontSize: 14 }}>فرآیندهای تولید</h3>
        <p style={{ color: '#6B6B6B', fontSize: 11, marginBottom: 10 }}>می‌توانید چندین فرآیند مختلف تعریف کنید (مثلاً: فرآیند تولید، بسته‌بندی، و...). هر فرآیند مراحل مختص خود را دارد.</p>
        {(settings.processes || []).map((proc, pIdx) => (
          <div key={proc.id || pIdx} style={{ padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8, marginBottom: 10, border: '1px solid #D4D0C8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: '#4CAF50', fontSize: 13, fontWeight: 700 }}>فرآیند {pIdx + 1}</span>
              <button onClick={() => hc('processes', (settings.processes || []).filter((_, i) => i !== pIdx))} style={{ padding: '2px 8px', background: 'rgba(239,83,80,0.2)', color: '#EF5350', border: 'none', borderRadius: 3, cursor: 'pointer', fontSize: 12 }}>✕ حذف فرآیند</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
              <div>
                <label style={{ color: '#2D2D2D', fontSize: 12, display: 'block', marginBottom: 2 }}>عنوان فرآیند</label>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {langKeys.map(lk => (
                    <div key={lk} style={{ flex: 1, minWidth: 80 }}>
                      <span style={{ fontSize: 9, color: '#4CAF50' }}>{langLabels[lk]}</span>
                      <input value={proc.title?.[lk] || ''} onChange={e => {
                        const arr = [...(settings.processes || [])]
                        arr[pIdx] = { ...arr[pIdx], title: { ...(arr[pIdx].title || {}), [lk]: e.target.value } }
                        hc('processes', arr)
                      }} style={{ ...inputStyle, fontSize: 10 }} />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ color: '#2D2D2D', fontSize: 12, display: 'block', marginBottom: 2 }}>زیرنویس فرآیند</label>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {langKeys.map(lk => (
                    <div key={lk} style={{ flex: 1, minWidth: 80 }}>
                      <span style={{ fontSize: 9, color: '#4CAF50' }}>{langLabels[lk]}</span>
                      <input value={proc.subtitle?.[lk] || ''} onChange={e => {
                        const arr = [...(settings.processes || [])]
                        arr[pIdx] = { ...arr[pIdx], subtitle: { ...(arr[pIdx].subtitle || {}), [lk]: e.target.value } }
                        hc('processes', arr)
                      }} style={{ ...inputStyle, fontSize: 10 }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p style={{ color: '#6B6B6B', fontSize: 11, margin: '8px 0 4px' }}>مراحل فرآیند (قابل افزایش/کاهش)</p>
            {(proc.steps || []).map((step, sIdx) => (
              <div key={sIdx} style={{ display: 'flex', gap: 4, alignItems: 'start', padding: 6, background: 'rgba(255,255,255,0.02)', borderRadius: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                <span style={{ color: '#555', fontSize: 10, minWidth: 14, marginTop: 6 }}>{sIdx + 1}.</span>
                <span style={{ fontSize: 18, width: 24, textAlign: 'center', marginTop: 4 }}>{step.icon || '🔧'}</span>
                <input value={step.icon} onChange={e => {
                  const arr = [...(settings.processes || [])]
                  const steps = [...(arr[pIdx].steps || [])]
                  steps[sIdx] = { ...steps[sIdx], icon: e.target.value }
                  arr[pIdx] = { ...arr[pIdx], steps }
                  hc('processes', arr)
                }} style={{ width: 30, padding: '3px 3px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 3, color: '#2D2D2D', fontSize: 10, textAlign: 'center' }} />
                <button onClick={() => setEmojiPicker({ target: 'processes', index: pIdx, stepIndex: sIdx, field: 'icon' })} style={{ padding: '1px 3px', background: 'rgba(212,175,55,0.1)', border: '1px solid #D4D0C8', borderRadius: 3, cursor: 'pointer', fontSize: 10 }}>😀</button>
                <input value={step.number} onChange={e => {
                  const arr = [...(settings.processes || [])]
                  const steps = [...(arr[pIdx].steps || [])]
                  steps[sIdx] = { ...steps[sIdx], number: e.target.value }
                  arr[pIdx] = { ...arr[pIdx], steps }
                  hc('processes', arr)
                }} style={{ width: 20, padding: '3px 3px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 3, color: '#2D2D2D', fontSize: 10, textAlign: 'center' }} />
                <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {langKeys.map(lk => (
                    <div key={lk} style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <span style={{ fontSize: 8, color: '#4CAF50', minWidth: 20 }}>{langLabels[lk]}</span>
                      <input value={step.title?.[lk] || ''} onChange={e => {
                        const arr = [...(settings.processes || [])]
                        const steps = [...(arr[pIdx].steps || [])]
                        steps[sIdx] = { ...steps[sIdx], title: { ...(steps[sIdx].title || {}), [lk]: e.target.value } }
                        arr[pIdx] = { ...arr[pIdx], steps }
                        hc('processes', arr)
                      }} style={{ flex: 1, padding: '2px 4px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 3, color: '#2D2D2D', fontSize: 10 }} placeholder={lk === 'fa' ? 'عنوان' : lk === 'en' ? 'Title' : 'العنوان'} />
                    </div>
                  ))}
                  {langKeys.map(lk => (
                    <div key={lk} style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <span style={{ fontSize: 8, color: '#6B6B6B', minWidth: 20 }}>{langLabels[lk]}</span>
                      <input value={step.desc?.[lk] || ''} onChange={e => {
                        const arr = [...(settings.processes || [])]
                        const steps = [...(arr[pIdx].steps || [])]
                        steps[sIdx] = { ...steps[sIdx], desc: { ...(steps[sIdx].desc || {}), [lk]: e.target.value } }
                        arr[pIdx] = { ...arr[pIdx], steps }
                        hc('processes', arr)
                      }} style={{ flex: 1, padding: '2px 4px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 3, color: '#2D2D2D', fontSize: 10 }} placeholder={lk === 'fa' ? 'توضیحات' : lk === 'en' ? 'Description' : 'الوصف'} />
                    </div>
                  ))}
                </div>
                <button onClick={() => {
                  const arr = [...(settings.processes || [])]
                  arr[pIdx] = { ...arr[pIdx], steps: (arr[pIdx].steps || []).filter((_, i) => i !== sIdx) }
                  hc('processes', arr)
                }} style={{ padding: '2px 6px', background: 'rgba(239,83,80,0.2)', color: '#EF5350', border: 'none', borderRadius: 3, cursor: 'pointer', fontSize: 10, marginTop: 4 }}>✕</button>
              </div>
            ))}
            <button onClick={() => {
              const arr = [...(settings.processes || [])]
              const steps = arr[pIdx].steps || []
              arr[pIdx] = { ...arr[pIdx], steps: [...steps, { number: (steps.length + 1).toString(), title: makeLangObj(), desc: makeLangObj(), icon: '🔧' }] }
              hc('processes', arr)
            }} style={{ marginTop: 4, padding: '3px 10px', background: 'rgba(212,175,55,0.15)', color: '#4CAF50', border: '1px dashed #D4AF37', borderRadius: 4, cursor: 'pointer', fontSize: 10 }}>+ افزودن مرحله</button>
          </div>
        ))}
        <button onClick={() => hc('processes', [...(settings.processes || []), { id: 'proc-' + Date.now(), title: makeLangObj(), subtitle: makeLangObj(), steps: [{ number: '۱', title: makeLangObj(), desc: makeLangObj(), icon: '🔧' }] }])} style={{ padding: '6px 16px', background: 'rgba(212,175,55,0.15)', color: '#4CAF50', border: '1px dashed #D4AF37', borderRadius: 5, cursor: 'pointer', fontSize: 12 }}>+ افزودن فرآیند جدید</button>
      </div>

      <div style={{...sectionStyle, display: activeTab === 'testimonials' ? 'block' : 'none'}}>
        <h3 style={{ color: '#4CAF50', margin: '0 0 8px', fontSize: 14 }}>مدیریت نظرات مشتریان</h3>
        <p style={{ color: '#6B6B6B', fontSize: 11, marginBottom: 10 }}>نظرات مشتریان به همراه عکس در صفحه اصلی نمایش داده می‌شود.</p>
        {(settings.testimonials || []).map((t, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 10, background: 'rgba(255,255,255,0.02)', borderRadius: 8, marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'start' }}>
              <div style={{ width: 60, height: 60, flexShrink: 0 }}>
                <ImageUpload value={t.image} onChange={url => {
                  const arr = [...(settings.testimonials || [])]; arr[idx] = { ...arr[idx], image: url }
                  hc('testimonials', arr)
                }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <input value={t.name} onChange={e => {
                  const arr = [...(settings.testimonials || [])]; arr[idx] = { ...arr[idx], name: e.target.value }
                  hc('testimonials', arr)
                }} style={{ ...inputStyle, fontSize: 12 }} placeholder="نام مشتری" />
                <input value={t.role} onChange={e => {
                  const arr = [...(settings.testimonials || [])]; arr[idx] = { ...arr[idx], role: e.target.value }
                  hc('testimonials', arr)
                }} style={{ ...inputStyle, fontSize: 12 }} placeholder="سمت / عنوان" />
              </div>
              <button onClick={() => hc('testimonials', (settings.testimonials || []).filter((_, i) => i !== idx))} style={{ padding: '2px 8px', background: 'rgba(239,83,80,0.2)', color: '#EF5350', border: 'none', borderRadius: 3, cursor: 'pointer', fontSize: 12 }}>✕</button>
            </div>
            <textarea value={t.text} onChange={e => {
              const arr = [...(settings.testimonials || [])]; arr[idx] = { ...arr[idx], text: e.target.value }
              hc('testimonials', arr)
            }} rows={2} style={{ ...inputStyle, fontSize: 11, resize: 'vertical' }} placeholder="متن نظر" />
          </div>
        ))}
        <button onClick={() => hc('testimonials', [...(settings.testimonials || []), { image: '', text: '', name: '', role: '' }])} style={{ padding: '6px 16px', background: 'rgba(212,175,55,0.15)', color: '#4CAF50', border: '1px dashed #D4AF37', borderRadius: 5, cursor: 'pointer', fontSize: 12 }}>+ افزودن نظر</button>
      </div>

      <div style={{...sectionStyle, display: activeTab === 'eco-map' ? 'block' : 'none'}}>
        <h3 style={{ color: '#4CAF50', margin: '0 0 8px', fontSize: 14 }}>تنظیمات نقشه</h3>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>نوع نقشه</label>
          <select value={settings.mapSettings?.type || 'iran-provinces'} onChange={e => hc('mapSettings', { ...(settings.mapSettings || {}), type: e.target.value, items: settings.mapSettings?.items || [] })}
            style={{ padding: '6px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 5, color: '#2D2D2D', fontSize: 12, outline: 'none' }}>
            <option value="iran-provinces">استان‌های ایران (اکوسیستم)</option>
            <option value="world-countries">کشورهای جهان</option>
            <option value="world-cities">شهرهای جهان</option>
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          {renderLangField('ecoMapTitle', 'عنوان')}
          {renderLangField('ecoMapSubtitle', 'زیرنویس')}
          {renderLangField('ecoMapButtonText', 'متن دکمه')}
        </div>
        <p style={{ color: '#6B6B6B', fontSize: 11, margin: '10px 0 6px' }}>مکان‌ها (قابل افزایش/کاهش)</p>
        {(() => {
          const items = settings.mapSettings?.items || settings.ecoMapCities || []
          return items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center', padding: 6, background: 'rgba(255,255,255,0.02)', borderRadius: 6, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ color: '#555', fontSize: 11 }}>{idx + 1}.</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {langKeys.map(lk => (
                <div key={lk} style={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <span style={{ fontSize: 7, color: '#4CAF50', minWidth: 12 }}>{langLabels[lk]}</span>
                  <input value={typeof item.name === 'object' ? (item.name?.[lk] || '') : (lk === lang ? (item.name || '') : '')} onChange={e => {
                    const arr = [...items]
                    const existing = arr[idx].name
                    const obj = (typeof existing === 'object' && existing) ? { ...existing } : { fa: '', en: '', ar: '' }
                    obj[lk] = e.target.value
                    arr[idx] = { ...arr[idx], name: obj }
                    hc('mapSettings', { ...(settings.mapSettings || {}), items: arr })
                  }} style={{ width: 70, padding: '2px 4px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 2, color: '#2D2D2D', fontSize: 10 }} placeholder="نام" />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {langKeys.map(lk => (
                <div key={lk} style={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <span style={{ fontSize: 7, color: '#6B6B6B', minWidth: 12 }}>{langLabels[lk]}</span>
                  <input value={typeof item.country === 'object' ? (item.country?.[lk] || '') : (lk === lang ? (item.country || '') : '')} onChange={e => {
                    const arr = [...items]
                    const existing = arr[idx].country
                    const obj = (typeof existing === 'object' && existing) ? { ...existing } : { fa: '', en: '', ar: '' }
                    obj[lk] = e.target.value
                    arr[idx] = { ...arr[idx], country: obj }
                    hc('mapSettings', { ...(settings.mapSettings || {}), items: arr })
                  }} style={{ width: 60, padding: '2px 4px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 2, color: '#2D2D2D', fontSize: 10 }} placeholder="کشور" />
                </div>
              ))}
            </div>
            <input value={item.count || ''} onChange={e => {
              const arr = [...items]; arr[idx] = { ...arr[idx], count: e.target.value }
              hc('mapSettings', { ...(settings.mapSettings || {}), items: arr })
            }} style={{ width: 70, padding: '2px 4px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 2, color: '#2D2D2D', fontSize: 10 }} placeholder="۴ شعبه" />
            <input value={item.color || '#D4AF37'} onChange={e => {
              const arr = [...items]; arr[idx] = { ...arr[idx], color: e.target.value }
              hc('mapSettings', { ...(settings.mapSettings || {}), items: arr })
            }} style={{ width: 60, padding: '2px 4px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 2, color: '#2D2D2D', fontSize: 10 }} placeholder="#D4AF37" />
            <input type="color" value={item.color || '#D4AF37'} onChange={e => {
              const arr = [...items]; arr[idx] = { ...arr[idx], color: e.target.value }
              hc('mapSettings', { ...(settings.mapSettings || {}), items: arr })
            }} style={{ width: 24, height: 24, padding: 0, border: 'none', borderRadius: 2, cursor: 'pointer', background: 'none' }} />
            <div style={{ display: 'flex', gap: 1 }}>
              <input value={item.lat ?? ''} onChange={e => {
                const arr = [...items]; arr[idx] = { ...arr[idx], lat: parseFloat(e.target.value) || 0 }
                hc('mapSettings', { ...(settings.mapSettings || {}), items: arr })
              }} style={{ width: 50, padding: '2px 4px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 2, color: '#2D2D2D', fontSize: 10, direction: 'ltr' }} placeholder="عرض" />
              <input value={item.lng ?? ''} onChange={e => {
                const arr = [...items]; arr[idx] = { ...arr[idx], lng: parseFloat(e.target.value) || 0 }
                hc('mapSettings', { ...(settings.mapSettings || {}), items: arr })
              }} style={{ width: 50, padding: '2px 4px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 2, color: '#2D2D2D', fontSize: 10, direction: 'ltr' }} placeholder="طول" />
            </div>
            <input value={(item.branches || []).join(', ')} onChange={e => {
              const arr = [...items]; arr[idx] = { ...arr[idx], branches: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
              hc('mapSettings', { ...(settings.mapSettings || {}), items: arr })
            }} style={{ width: 120, padding: '2px 4px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 2, color: '#2D2D2D', fontSize: 10 }} placeholder="شعبه‌ها (با کاما)" />
            <button onClick={() => {
              const arr = items.filter((_, i) => i !== idx)
              hc('mapSettings', { ...(settings.mapSettings || {}), items: arr })
            }} style={{ padding: '2px 6px', background: 'rgba(239,83,80,0.2)', color: '#EF5350', border: 'none', borderRadius: 3, cursor: 'pointer', fontSize: 11 }}>✕</button>
          </div>
        ))})()}
        <button onClick={() => hc('mapSettings', { ...(settings.mapSettings || {}), items: [...((settings.mapSettings?.items) || []), { name: { fa: '', en: '', ar: '' }, country: { fa: '', en: '', ar: '' }, count: '', color: '#4CAF50', lat: 0, lng: 0, branches: [] }] })}
          style={{ marginTop: 4, padding: '4px 12px', background: 'rgba(212,175,55,0.15)', color: '#4CAF50', border: '1px dashed #D4AF37', borderRadius: 5, cursor: 'pointer', fontSize: 11 }}>+ افزودن مکان</button>
      </div>

      <div style={{...sectionStyle, display: activeTab === 'gallery' ? 'block' : 'none'}}>
        <h3 style={{ color: '#4CAF50', margin: '0 0 8px', fontSize: 14 }}>تنظیمات گالری تصاویر</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px', marginBottom: 10 }}>
          {renderLangField('galleryTitle', 'عنوان گالری')}
          {renderLangField('gallerySubtitle', 'زیرنویس گالری')}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>نوع گالری</label>
          <select value={settings.gallerySettings?.type || 'grid'} onChange={e => hc('gallerySettings', { ...(settings.gallerySettings || {}), type: e.target.value })}
            style={{ padding: '6px 10px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 5, color: '#2D2D2D', fontSize: 12, outline: 'none' }}>
            <option value="grid">شبکه‌ای (Grid)</option>
            <option value="masonry">چیدمان آزاد (Masonry)</option>
            <option value="carousel">اسلایدر (Carousel)</option>
            <option value="slideshow">نمایش اسلاید (Slideshow)</option>
          </select>
        </div>
        <p style={{ color: '#6B6B6B', fontSize: 11, marginBottom: 6 }}>تصاویر گالری</p>
        {(settings.gallerySettings?.images || []).map((img, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center', padding: 8, background: 'rgba(255,255,255,0.02)', borderRadius: 6, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ color: '#555', fontSize: 11 }}>{idx + 1}.</span>
            <div style={{ width: 50, height: 50, borderRadius: 4, overflow: 'hidden', flexShrink: 0, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {img.url ? <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#555', fontSize: 10 }}>ندارد</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                <input value={img.category || ''} onChange={e => {
                  const arr = [...((settings.gallerySettings?.images) || [])]
                  arr[idx] = { ...arr[idx], category: e.target.value }
                  hc('gallerySettings', { ...(settings.gallerySettings || {}), images: arr })
                }} style={{ width: 80, padding: '3px 5px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 3, color: '#999', fontSize: 10, direction: 'rtl' }} placeholder="دسته" />
              </div>
              {langKeys.map(lk => (
                <div key={lk} style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <span style={{ fontSize: 8, color: '#4CAF50', minWidth: 16 }}>{langLabels[lk]}</span>
                  <input value={img.title?.[lk] || ''} onChange={e => {
                    const arr = [...((settings.gallerySettings?.images) || [])]
                    const obj = { ...arr[idx], title: { ...(arr[idx]?.title || {}), [lk]: e.target.value } }
                    arr[idx] = obj
                    hc('gallerySettings', { ...(settings.gallerySettings || {}), images: arr })
                  }} style={{ width: '100%', padding: '3px 5px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 3, color: '#2D2D2D', fontSize: 11 }} placeholder={lk === 'fa' ? 'عنوان' : lk === 'en' ? 'Title' : 'العنوان'} />
                </div>
              ))}
            </div>
            <ImageUpload value={img.url || ''} onUpload={url => {
              const arr = [...((settings.gallerySettings?.images) || [])]
              arr[idx] = { ...arr[idx], url }
              hc('gallerySettings', { ...(settings.gallerySettings || {}), images: arr })
            }} label="تصویر" />
            <button onClick={() => {
              const arr = (settings.gallerySettings?.images || []).filter((_, i) => i !== idx)
              hc('gallerySettings', { ...(settings.gallerySettings || {}), images: arr })
            }} style={{ padding: '4px 8px', background: 'rgba(239,83,80,0.2)', color: '#EF5350', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14 }}>✕</button>
          </div>
        ))}
        <button onClick={() => hc('gallerySettings', { ...(settings.gallerySettings || {}), images: [...((settings.gallerySettings?.images) || []), { url: '', title: {} }] })}
          style={{ marginTop: 4, padding: '4px 12px', background: 'rgba(212,175,55,0.15)', color: '#4CAF50', border: '1px dashed #D4AF37', borderRadius: 5, cursor: 'pointer', fontSize: 11 }}>+ افزودن تصویر</button>
      </div>

      <div style={{...sectionStyle, display: activeTab === 'rss' ? 'block' : 'none'}}>
        <h3 style={{ color: '#4CAF50', margin: '0 0 8px', fontSize: 14 }}>خبرخوان‌های RSS (مقالات)</h3>
        <p style={{ color: '#6B6B6B', fontSize: 11, marginBottom: 8 }}>منابع RSS را اضافه کنید. مقالات هر منبع با دسته‌بندی مشخص شده در سایت نمایش داده می‌شود.</p>
        {(settings.rssFeeds || []).map((feed, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center', padding: 8, background: 'rgba(255,255,255,0.02)', borderRadius: 6, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ color: '#555', fontSize: 11 }}>{idx + 1}.</span>
            <input value={feed.url} onChange={e => {
              const arr = [...(settings.rssFeeds || [])]; arr[idx] = { ...arr[idx], url: e.target.value }
              hc('rssFeeds', arr)
            }} style={{ width: 200, padding: '4px 6px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 3, color: '#2D2D2D', fontSize: 11, direction: 'ltr' }} placeholder="https://example.com/rss" />
            <input value={feed.label || ''} onChange={e => {
              const arr = [...(settings.rssFeeds || [])]; arr[idx] = { ...arr[idx], label: e.target.value }
              hc('rssFeeds', arr)
            }} style={{ width: 100, padding: '4px 6px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 3, color: '#2D2D2D', fontSize: 11 }} placeholder="عنوان منبع" />
            <select value={feed.category || 'اخبار'} onChange={e => {
              const arr = [...(settings.rssFeeds || [])]; arr[idx] = { ...arr[idx], category: e.target.value }
              hc('rssFeeds', arr)
            }} style={{ padding: '4px 6px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 3, color: '#2D2D2D', fontSize: 11, outline: 'none' }}>
              {['اخبار', 'دکوراسیون', 'متریال', 'رنگ شناسی', 'طراحی', 'مراقبت', 'ترند', 'عمومی'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#6B6B6B', fontSize: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={feed.enabled !== false} onChange={e => {
                const arr = [...(settings.rssFeeds || [])]; arr[idx] = { ...arr[idx], enabled: e.target.checked }
                hc('rssFeeds', arr)
              }} />
              فعال
            </label>
            <button onClick={() => hc('rssFeeds', (settings.rssFeeds || []).filter((_, i) => i !== idx))} style={{ padding: '2px 6px', background: 'rgba(239,83,80,0.2)', color: '#EF5350', border: 'none', borderRadius: 3, cursor: 'pointer', fontSize: 11 }}>✕</button>
          </div>
        ))}
        <button onClick={() => hc('rssFeeds', [...(settings.rssFeeds || []), { url: '', label: '', category: 'اخبار', enabled: true }])} style={{ marginTop: 4, padding: '4px 12px', background: 'rgba(212,175,55,0.15)', color: '#4CAF50', border: '1px dashed #D4AF37', borderRadius: 5, cursor: 'pointer', fontSize: 11 }}>+ افزودن منبع RSS</button>
        <div style={{ marginTop: 10 }}>
          <label style={{ color: '#6B6B6B', fontSize: 11, display: 'block', marginBottom: 2 }}>تعداد آیتم هر منبع</label>
          <input type="number" min={1} max={50} value={settings.rssCount ?? 10} onChange={e => hc('rssCount', parseInt(e.target.value) || 10)} style={{ width: 80, padding: '6px 8px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 13, outline: 'none' }} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ color: '#2D2D2D', fontSize: 13, display: 'block', marginBottom: 6 }}>فیلتر دسته RSS (اختیاری)</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['کشاورزی', 'تغذیه', 'سلامت', 'محصولات', 'بازار', 'اخبار'].map(cat => {
              const isActive = (settings.rssCategories || []).includes(cat)
              return (
                <button key={cat} onClick={() => {
                  const arr = settings.rssCategories || []
                  hc('rssCategories', isActive ? arr.filter(c => c !== cat) : [...arr, cat])
                }} style={{
                  padding: '5px 12px', borderRadius: 50, border: isActive ? '1px solid #D4AF37' : '1px solid #444',
                  background: isActive ? 'rgba(212,175,55,0.15)' : 'transparent',
                  color: isActive ? '#D4AF37' : '#888', cursor: 'pointer', fontSize: 12,
                  transition: 'all 0.2s',
                }}>{cat}</button>
              )
            })}
          </div>
          <input value={(settings.rssCategories || []).join(', ')} onChange={e => hc('rssCategories', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} style={{ ...inputStyle, fontSize: 12, direction: 'ltr', marginTop: 4 }} placeholder="دستی: کشاورزی, تغذیه" />
          <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>فقط آیتم‌های RSS که دسته (category) شان با این موارد مطابقت دارد نمایش داده می‌شود. خالی = همه</div>
        </div>
      </div>

      <div style={{...sectionStyle, display: activeTab === 'otp' ? 'block' : 'none'}}>
        <h3 style={{ color: '#4CAF50', margin: '0 0 12px', fontSize: 14 }}>تنظیمات کد تأیید (OTP)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2D2D2D', fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={settings.otpEnabled !== false} onChange={e => hc('otpEnabled', e.target.checked)} />
            فعال بودن کد تأیید
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 16px' }}>
            <div>
              <label style={labelStyle}>تعداد ارقام</label>
              <input type="number" min={4} max={8} value={settings.otpLength ?? 5} onChange={e => hc('otpLength', parseInt(e.target.value) || 5)}
                style={{ ...inputStyle, width: 80, textAlign: 'center' }} />
            </div>
            <div>
              <label style={labelStyle}>مدت اعتبار (ثانیه)</label>
              <input type="number" min={30} max={600} value={settings.otpExpiry ?? 180} onChange={e => hc('otpExpiry', parseInt(e.target.value) || 180)}
                style={{ ...inputStyle, width: 100, textAlign: 'center' }} />
            </div>
            <div>
              <label style={labelStyle}>حداکثر تلاش اشتباه</label>
              <input type="number" min={1} max={10} value={settings.otpMaxAttempts ?? 3} onChange={e => hc('otpMaxAttempts', parseInt(e.target.value) || 3)}
                style={{ ...inputStyle, width: 80, textAlign: 'center' }} />
            </div>
          </div>

          <div style={{ height: 1, background: '#F0F0EA', margin: '12px 0' }} />

          <h4 style={{ color: '#4CAF50', margin: '0 0 8px', fontSize: 13 }}>پیکربندی SMS (sms.ir)</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <label style={labelStyle}>API Key</label>
              <input value={settings.smsApiKey || ''} onChange={e => hc('smsApiKey', e.target.value)}
                style={{ ...inputStyle, fontSize: 11, fontFamily: 'monospace', direction: 'ltr' }} placeholder="X-API-KEY از پنل sms.ir" />
            </div>
            <div>
              <label style={labelStyle}>شناسه قالب (TemplateId)</label>
              <input value={settings.smsTemplateId || ''} onChange={e => hc('smsTemplateId', e.target.value)}
                style={{ ...inputStyle, direction: 'ltr' }} placeholder="مثلاً: 100000" />
            </div>
            <div>
              <label style={labelStyle}>شماره خط (برای ارسال مستقیم)</label>
              <input value={settings.smsLineNumber || ''} onChange={e => hc('smsLineNumber', e.target.value)}
                style={{ ...inputStyle, direction: 'ltr' }} placeholder="۳۰۰۰۴۵۰۵۰۰۰۰۲۷" />
            </div>
            <div>
              <label style={labelStyle}>آدرس API (Base URL)</label>
              <input value={settings.smsApiBaseUrl || ''} onChange={e => hc('smsApiBaseUrl', e.target.value)}
                style={{ ...inputStyle, fontSize: 11, fontFamily: 'monospace', direction: 'ltr' }} placeholder="https://api.sms.ir/v1" />
            </div>
          </div>
          <p style={{ color: '#666', fontSize: 10, marginTop: 4 }}>
            کلید API را از پنل sms.ir &gt; برنامه‌نویسان دریافت کنید. اگر TemplateId وارد شود از سرویس verify استفاده می‌شود، در غیر این صورت از ارسال خط خدماتی (bulk) استفاده می‌شود و شماره خط الزامی است.
          </p>
        </div>
      </div>

      <div style={{...sectionStyle, display: activeTab === 'theme' ? 'block' : 'none'}}>
        <h3 style={{ color: '#4CAF50', margin: '0 0 8px', fontSize: 14 }}>تنظیمات تم (قالب ظاهری)</h3>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          {(settings.themes?.available || []).map(t => (
            <button key={t.id} onClick={() => {
              setSettings(prev => ({ ...prev, themes: { ...prev.themes, active: t.id } }))
              setTheme(t.id)
            }} style={{
              padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
              border: settings.themes?.active === t.id ? '2px solid ' + t.colors.primary : '1px solid #444',
              background: settings.themes?.active === t.id ? t.colors.primary + '22' : '#1a1a1a',
              color: settings.themes?.active === t.id ? t.colors.primary : '#aaa',
              fontWeight: settings.themes?.active === t.id ? 700 : 400,
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.3s',
            }}>
              <span style={{ width: 14, height: 14, borderRadius: '50%', display: 'inline-block', background: t.colors.primary }} />
              {t.name}
              {settings.themes?.active === t.id && <span style={{ fontSize: 12 }}>✓</span>}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
          <button onClick={() => {
            if (settings?.themes) applyThemeById(settings.themes.active, settings.themes)
            addToast('تم اعمال شد', 'success')
          }} style={{
            padding: '8px 28px', background: 'linear-gradient(135deg, #4CAF50, #388E3C)',
            color: '#2D2D2D', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 'bold',
            transition: 'all 0.3s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(212,175,55,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >⚡ اعمال تم</button>
        </div>
        {(settings.themes?.available || []).filter(t => t.id === settings.themes?.active).map(t => (
          <div key={t.id} style={{
            padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 10,
            border: '1px solid #D4D0C8',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ color: '#2D2D2D', fontSize: 14, fontWeight: 700 }}>{t.name}</span>
              <span style={{ color: '#6B6B6B', fontSize: 11, direction: 'ltr' }}>{t.id}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
              {Object.entries(t.colors).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="color" value={val} onChange={e => {
                    const newVal = e.target.value
                    setSettings(prev => ({
                      ...prev,
                      themes: {
                        ...prev.themes,
                        available: (prev.themes?.available || []).map(tm =>
                          tm.id === t.id ? { ...tm, colors: { ...tm.colors, [key]: newVal } } : tm
                        ),
                      },
                    }))
                  }} style={{ width: 36, height: 36, borderRadius: 6, border: 'none', cursor: 'pointer', padding: 0, background: 'transparent' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: '#6B6B6B', marginBottom: 1 }}>
                      {({ primary: 'اصلی', primaryDark: 'تیره اصلی', primaryLight: 'روشن اصلی', background: 'پس‌زمینه', surface: 'سطح', surfaceLight: 'سطح روشن', text: 'متن', textSecondary: 'متن فرعی', border: 'حاشیه', cardBg: 'پس‌زمینه کارت', success: 'موفقیت', error: 'خطا' }[key] || key)}
                    </div>
                    <input value={val} onChange={e => {
                      setSettings(prev => ({
                        ...prev,
                        themes: {
                          ...prev.themes,
                          available: (prev.themes?.available || []).map(tm =>
                            tm.id === t.id ? { ...tm, colors: { ...tm.colors, [key]: e.target.value } } : tm
                          ),
                        },
                      }))
                    }} style={{ width: '100%', padding: '3px 6px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 4, color: '#2D2D2D', fontSize: 11, outline: 'none', direction: 'ltr' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button onClick={() => {
            const id = 'theme-' + Date.now()
            setSettings(prev => ({
              ...prev,
              themes: {
                ...prev.themes,
                available: [...(prev.themes?.available || []), {
                  id, name: 'تم جدید', colors: {
                    primary: '#D4AF37', primaryDark: '#8B6914', primaryLight: '#F0D060',
                    background: '#0A0A0F', surface: '#1a1a1a', surfaceLight: '#222',
                    text: '#F5E6C8', textSecondary: '#A89880', border: 'rgba(212,175,55,0.2)',
                    cardBg: 'rgba(255,255,255,0.03)', success: '#D27D56', error: '#EF5350',
                  },
                }],
                active: id,
              },
            }))
          }} style={{
            padding: '6px 16px', background: 'rgba(212,175,55,0.15)', color: '#4CAF50',
            border: '1px solid #4CAF50', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 'bold',
          }}>+ افزودن تم جدید</button>
          <button onClick={() => {
            if (!settings.themes?.active) return
            if (settings.themes?.active === 'emerald') return
            if ((settings.themes?.available || []).length <= 1) return
            setSettings(prev => {
              const remaining = (prev.themes?.available || []).filter(t => t.id !== prev.themes?.active)
              return {
                ...prev,
                themes: { ...prev.themes, available: remaining, active: remaining[0]?.id || 'emerald' },
              }
            })
          }} style={{
            padding: '6px 16px', background: settings.themes?.active === 'emerald' ? 'rgba(128,128,128,0.15)' : 'rgba(239,83,80,0.15)',
            color: settings.themes?.active === 'emerald' ? '#888' : '#EF5350',
            border: settings.themes?.active === 'emerald' ? '1px solid #888' : '1px solid #EF5350',
            borderRadius: 6, cursor: settings.themes?.active === 'emerald' ? 'not-allowed' : 'pointer', fontSize: 13,
          }}>✕ حذف تم فعال{settings.themes?.active === 'emerald' ? ' (پیش‌فرض)' : ''}</button>
        </div>
      </div>

      <div style={{...sectionStyle, display: activeTab === 'banners' ? 'block' : 'none'}}>
        <h3 style={{ color: '#4CAF50', margin: '0 0 8px', fontSize: 14 }}>بنرهای اسلایدر (صفحه اصلی)</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ color: '#6B6B6B', fontSize: 12 }}>تصاویر به ترتیب نمایش داده می‌شوند</span>
          <button onClick={addBanner} style={{
            padding: '6px 16px', background: 'rgba(212,175,55,0.15)', color: '#4CAF50',
            border: '1px solid #4CAF50', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 'bold',
          }}>+ افزودن بنر</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(settings.banners || []).map((banner, idx) => (
            <div key={idx} style={{
              display: 'flex', flexDirection: 'column', gap: 8, padding: 14,
              background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid #D4D0C8',
            }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ color: '#6B6B6B', fontSize: 12 }}>بنر {idx + 1}</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#2D2D2D', fontSize: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={banner.active} onChange={e => updateBanner(idx, 'active', e.target.checked)} />
                  فعال
                </label>
                <button onClick={() => removeBanner(idx)} style={{
                  padding: '2px 10px', background: 'rgba(239,83,80,0.2)', color: '#EF5350',
                  border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, marginRight: 'auto',
                }}>✕ حذف</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 10px' }}>
                <div>
                  <label style={{ color: '#6B6B6B', fontSize: 11, display: 'block', marginBottom: 2 }}>تصویر بنر</label>
                  <ImageUpload value={banner.image} onChange={url => updateBanner(idx, 'image', url)} />
                </div>
                <div>
                  <label style={{ color: '#6B6B6B', fontSize: 11, display: 'block', marginBottom: 2 }}>لینک</label>
                  <input value={banner.link} onChange={e => updateBanner(idx, 'link', e.target.value)}
                    style={{ ...inputStyle, fontSize: 12, direction: 'ltr' }} placeholder="پیش‌فرض: /products" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 10px' }}>
                <div>
                  <label style={{ color: '#6B6B6B', fontSize: 11, display: 'block', marginBottom: 2 }}>عنوان</label>
                  <div style={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                    {langKeys.map(lk => (
                      <div key={lk} style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <span style={{ fontSize: 8, color: '#4CAF50', minWidth: 16 }}>{langLabels[lk]}</span>
                        <input value={typeof banner.title === 'object' ? (banner.title?.[lk] || '') : (lk === lang ? (banner.title || '') : '')} onChange={e => {
                          const existing = banner.title
                          const obj = (typeof existing === 'object' && existing) ? { ...existing } : { fa: '', en: '', ar: '' }
                          obj[lk] = e.target.value
                          updateBanner(idx, 'title', obj)
                        }}
                          style={{ flex: 1, ...inputStyle, fontSize: 11 }} placeholder={lk === 'fa' ? 'عنوان' : lk === 'en' ? 'Title' : 'العنوان'} />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ color: '#6B6B6B', fontSize: 11, display: 'block', marginBottom: 2 }}>زیرعنوان</label>
                  <div style={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                    {langKeys.map(lk => (
                      <div key={lk} style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <span style={{ fontSize: 8, color: '#4CAF50', minWidth: 16 }}>{langLabels[lk]}</span>
                        <input value={typeof banner.subtitle === 'object' ? (banner.subtitle?.[lk] || '') : (lk === lang ? (banner.subtitle || '') : '')} onChange={e => {
                          const existing = banner.subtitle
                          const obj = (typeof existing === 'object' && existing) ? { ...existing } : { fa: '', en: '', ar: '' }
                          obj[lk] = e.target.value
                          updateBanner(idx, 'subtitle', obj)
                        }}
                          style={{ flex: 1, ...inputStyle, fontSize: 11 }} placeholder={lk === 'fa' ? 'زیرعنوان' : lk === 'en' ? 'Subtitle' : 'العنوان الفرعي'} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{...sectionStyle, display: activeTab === 'about' ? 'block' : 'none'}}>
        <h3 style={{ color: '#4CAF50', margin: '0 0 8px', fontSize: 14 }}>بخش درباره ما</h3>
        {renderLangField('aboutTitle', 'عنوان صفحه')}
        {renderLangField('aboutStoryTitle', 'عنوان داستان ما')}
        {renderLangField('aboutIntro', 'مقدمه (پاراگراف اول)', { type: 'textarea', rows: 3 })}
        {renderLangField('aboutFullText', 'متن کامل (پاراگراف دوم)', { type: 'textarea', rows: 3 })}
        <ImageUpload current={settings.aboutImage} onUpload={url => setSettings(prev => ({ ...prev, aboutImage: url }))} onDelete={() => setSettings(prev => ({ ...prev, aboutImage: '' }))} label="تصویر درباره ما" />

        <h4 style={{ color: '#4CAF50', fontSize: 14, margin: '20px 0 12px' }}>تیم (قابل افزایش/کاهش)</h4>
        {(settings.team || []).map((member, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: 10, background: 'rgba(255,255,255,0.02)', borderRadius: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ color: '#6B6B6B', fontSize: 12 }}>{idx + 1}.</span>
            <div style={{ position: 'relative' }}>
              {member.image ? (
                <img src={member.image} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1px solid #D4D0C8' }} />
              ) : (
                <span style={{ fontSize: 24 }}>{member.icon || '👤'}</span>
              )}
              <input type="file" accept="image/*" style={{ display: 'none' }} id={`teamImg${idx}`} onChange={async (e) => {
                const fd = new FormData()
                fd.append('image', e.target.files[0])
                try {
                  const { data } = await axios.post('/api/upload/single', fd)
                  const arr = [...(settings.team || [])]
                  arr[idx] = { ...arr[idx], image: data.url }
                  hc('team', arr)
                } catch {}
                e.target.value = ''
              }} />
              <button onClick={() => document.getElementById(`teamImg${idx}`).click()} style={{
                position: 'absolute', bottom: -4, right: -4, width: 18, height: 18, borderRadius: '50%',
                background: '#D4AF37', color: '#2D2D2D', border: 'none', cursor: 'pointer', fontSize: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>📁</button>
            </div>
            <div style={{ flex: 1, minWidth: 100, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {langKeys.map(lk => (
                <div key={lk} style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <span style={{ fontSize: 8, color: '#4CAF50', minWidth: 16 }}>{langLabels[lk]}</span>
                  <input value={typeof member.name === 'object' ? (member.name?.[lk] || '') : (lk === lang ? (member.name || '') : '')} onChange={e => {
                    const arr = [...(settings.team || [])]
                    const existing = arr[idx].name
                    const obj = (typeof existing === 'object' && existing) ? { ...existing } : { fa: '', en: '', ar: '' }
                    obj[lk] = e.target.value
                    arr[idx] = { ...arr[idx], name: obj }
                    hc('team', arr)
                  }} style={{ width: '100%', padding: '4px 6px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 4, color: '#2D2D2D', fontSize: 12 }} placeholder={lk === 'fa' ? 'نام' : lk === 'en' ? 'Name' : 'الاسم'} />
                </div>
              ))}
            </div>
            <div style={{ flex: 1, minWidth: 100, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {langKeys.map(lk => (
                <div key={lk} style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <span style={{ fontSize: 8, color: '#4CAF50', minWidth: 16 }}>{langLabels[lk]}</span>
                  <input value={typeof member.role === 'object' ? (member.role?.[lk] || '') : (lk === lang ? (member.role || '') : '')} onChange={e => {
                    const arr = [...(settings.team || [])]
                    const existing = arr[idx].role
                    const obj = (typeof existing === 'object' && existing) ? { ...existing } : { fa: '', en: '', ar: '' }
                    obj[lk] = e.target.value
                    arr[idx] = { ...arr[idx], role: obj }
                    hc('team', arr)
                  }} style={{ width: '100%', padding: '4px 6px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 4, color: '#2D2D2D', fontSize: 12 }} placeholder={lk === 'fa' ? 'نقش' : lk === 'en' ? 'Role' : 'الدور'} />
                </div>
              ))}
            </div>
            <div style={{ flex: 2, minWidth: 150, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {langKeys.map(lk => (
                <div key={lk} style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <span style={{ fontSize: 8, color: '#4CAF50', minWidth: 16 }}>{langLabels[lk]}</span>
                  <input value={typeof member.desc === 'object' ? (member.desc?.[lk] || '') : (lk === lang ? (member.desc || '') : '')} onChange={e => {
                    const arr = [...(settings.team || [])]
                    const existing = arr[idx].desc
                    const obj = (typeof existing === 'object' && existing) ? { ...existing } : { fa: '', en: '', ar: '' }
                    obj[lk] = e.target.value
                    arr[idx] = { ...arr[idx], desc: obj }
                    hc('team', arr)
                  }} style={{ width: '100%', padding: '4px 6px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 4, color: '#2D2D2D', fontSize: 12 }} placeholder={lk === 'fa' ? 'توضیحات' : lk === 'en' ? 'Description' : 'الوصف'} />
                </div>
              ))}
            </div>
            <button onClick={() => hc('team', (settings.team || []).filter((_, i) => i !== idx))} style={{ padding: '4px 10px', background: 'rgba(239,83,80,0.2)', color: '#EF5350', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14 }}>✕</button>
          </div>
        ))}
        <button onClick={() => hc('team', [...(settings.team || []), { name: makeLangObj(), role: makeLangObj(), desc: makeLangObj(), icon: '👤' }])} style={{ marginTop: 6, padding: '6px 16px', background: 'rgba(212,175,55,0.15)', color: '#4CAF50', border: '1px dashed #D4AF37', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>+ افزودن عضو تیم</button>

        <h4 style={{ color: '#4CAF50', fontSize: 14, margin: '20px 0 12px' }}>نقاط عطف (تایم‌لاین)</h4>
        {(settings.milestones || []).map((m, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: 10, background: 'rgba(255,255,255,0.02)', borderRadius: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ color: '#6B6B6B', fontSize: 12 }}>{idx + 1}.</span>
            <input value={m.year || ''} onChange={e => {
              const arr = [...(settings.milestones || [])]
              arr[idx] = { ...arr[idx], year: e.target.value }
              hc('milestones', arr)
            }} style={{ width: 60, padding: '6px 6px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 4, color: '#2D2D2D', fontSize: 13, textAlign: 'center' }} placeholder="سال" />
            <div style={{ flex: 1, minWidth: 120, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {langKeys.map(lk => (
                <div key={lk} style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <span style={{ fontSize: 8, color: '#4CAF50', minWidth: 16 }}>{langLabels[lk]}</span>
                  <input value={typeof m.title === 'object' ? (m.title?.[lk] || '') : (lk === lang ? (m.title || '') : '')} onChange={e => {
                    const arr = [...(settings.milestones || [])]
                    const existing = arr[idx].title
                    const obj = (typeof existing === 'object' && existing) ? { ...existing } : { fa: '', en: '', ar: '' }
                    obj[lk] = e.target.value
                    arr[idx] = { ...arr[idx], title: obj }
                    hc('milestones', arr)
                  }} style={{ width: '100%', padding: '4px 6px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 4, color: '#2D2D2D', fontSize: 12 }} placeholder={lk === 'fa' ? 'عنوان' : lk === 'en' ? 'Title' : 'العنوان'} />
                </div>
              ))}
            </div>
            <div style={{ flex: 2, minWidth: 150, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {langKeys.map(lk => (
                <div key={lk} style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <span style={{ fontSize: 8, color: '#4CAF50', minWidth: 16 }}>{langLabels[lk]}</span>
                  <input value={typeof m.desc === 'object' ? (m.desc?.[lk] || '') : (lk === lang ? (m.desc || '') : '')} onChange={e => {
                    const arr = [...(settings.milestones || [])]
                    const existing = arr[idx].desc
                    const obj = (typeof existing === 'object' && existing) ? { ...existing } : { fa: '', en: '', ar: '' }
                    obj[lk] = e.target.value
                    arr[idx] = { ...arr[idx], desc: obj }
                    hc('milestones', arr)
                  }} style={{ width: '100%', padding: '4px 6px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 4, color: '#2D2D2D', fontSize: 12 }} placeholder={lk === 'fa' ? 'توضیحات' : lk === 'en' ? 'Description' : 'الوصف'} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {m.image ? (
                <img src={m.image} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', border: '1px solid #D4D0C8' }} />
              ) : null}
              <input type="file" accept="image/*" style={{ display: 'none' }} id={`milestoneImg${idx}`} onChange={async (e) => {
                const fd = new FormData()
                fd.append('image', e.target.files[0])
                try {
                  const { data } = await axios.post('/api/upload/single', fd)
                  const arr = [...(settings.milestones || [])]
                  arr[idx] = { ...arr[idx], image: data.url }
                  hc('milestones', arr)
                } catch {}
                e.target.value = ''
              }} />
              <button onClick={() => document.getElementById(`milestoneImg${idx}`).click()} style={{
                padding: '4px 8px', background: '#F0F0EA', color: '#4CAF50', border: '1px solid #D4D0C8',
                borderRadius: 4, cursor: 'pointer', fontSize: 11,
              }}>📁</button>
              {m.image && <button onClick={() => {
                const arr = [...(settings.milestones || [])]
                arr[idx] = { ...arr[idx], image: '' }
                hc('milestones', arr)
              }} style={{ padding: '2px 6px', background: 'rgba(239,83,80,0.2)', color: '#EF5350', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 10 }}>✕</button>}
            </div>
            <button onClick={() => hc('milestones', (settings.milestones || []).filter((_, i) => i !== idx))} style={{ padding: '4px 10px', background: 'rgba(239,83,80,0.2)', color: '#EF5350', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14 }}>✕</button>
          </div>
        ))}
        <button onClick={() => hc('milestones', [...(settings.milestones || []), { year: '', title: makeLangObj(), desc: makeLangObj() }])} style={{ marginTop: 6, padding: '6px 16px', background: 'rgba(212,175,55,0.15)', color: '#4CAF50', border: '1px dashed #D4AF37', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>+ افزودن نقطه عطف</button>
      </div>

      <div style={{...sectionStyle, display: activeTab === 'hero' ? 'block' : 'none'}}>
        <h3 style={{ color: '#4CAF50', margin: '0 0 8px', fontSize: 14 }}>نکات خرید مبل (خرید و شناخت مبل)</h3>
        {renderLangField('buyingTipsTitle', 'عنوان بخش')}
        {renderLangField('buyingTipsSubtitle', 'زیرعنوان', { type: 'textarea', rows: 2 })}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0 8px' }}>
          <h4 style={{ color: '#4CAF50', fontSize: 13, margin: 0 }}>مطالب آموزشی</h4>
          <button onClick={() => hc('buyingTips', [...(settings.buyingTips || []), { id: 'tip-' + Date.now(), title: makeLangObj(), summary: makeLangObj(), category: makeLangObj(), image: '' }])} style={{
            padding: '6px 16px', background: 'rgba(212,175,55,0.15)', color: '#4CAF50',
            border: '1px dashed #D4AF37', borderRadius: 6, cursor: 'pointer', fontSize: 12,
          }}>+ افزودن مطلب</button>
        </div>
        {(settings.buyingTips || []).map((tip, idx) => (
          <div key={tip.id || idx} style={{ display: 'flex', gap: 8, padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ color: '#6B6B6B', fontSize: 12, minWidth: 20 }}>{idx + 1}.</span>
            <div style={{ minWidth: 120, display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
              {langKeys.map(lk => (
                <div key={lk} style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <span style={{ fontSize: 8, color: '#4CAF50', minWidth: 14 }}>{langLabels[lk]}</span>
                  <input value={typeof tip.title === 'object' ? (tip.title?.[lk] || '') : (lk === lang ? (tip.title || '') : '')} onChange={e => {
                    const arr = [...(settings.buyingTips || [])]
                    const existing = arr[idx].title
                    const obj = (typeof existing === 'object' && existing) ? { ...existing } : { fa: '', en: '', ar: '' }
                    obj[lk] = e.target.value
                    arr[idx] = { ...arr[idx], title: obj }
                    hc('buyingTips', arr)
                  }} style={{ flex: 1, padding: '4px 6px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 4, color: '#2D2D2D', fontSize: 11 }} placeholder={lk === 'fa' ? 'عنوان' : lk === 'en' ? 'Title' : 'العنوان'} />
                </div>
              ))}
            </div>
            <div style={{ minWidth: 150, display: 'flex', flexDirection: 'column', gap: 2, flex: 2 }}>
              {langKeys.map(lk => (
                <div key={lk} style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <span style={{ fontSize: 8, color: '#4CAF50', minWidth: 14 }}>{langLabels[lk]}</span>
                  <input value={typeof tip.summary === 'object' ? (tip.summary?.[lk] || '') : (lk === lang ? (tip.summary || '') : '')} onChange={e => {
                    const arr = [...(settings.buyingTips || [])]
                    const existing = arr[idx].summary
                    const obj = (typeof existing === 'object' && existing) ? { ...existing } : { fa: '', en: '', ar: '' }
                    obj[lk] = e.target.value
                    arr[idx] = { ...arr[idx], summary: obj }
                    hc('buyingTips', arr)
                  }} style={{ flex: 1, padding: '4px 6px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 4, color: '#2D2D2D', fontSize: 11 }} placeholder={lk === 'fa' ? 'خلاصه' : lk === 'en' ? 'Summary' : 'الملخص'} />
                </div>
              ))}
            </div>
            <div style={{ minWidth: 100, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {langKeys.map(lk => (
                <div key={lk} style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <span style={{ fontSize: 8, color: '#4CAF50', minWidth: 14 }}>{langLabels[lk]}</span>
                  <input value={typeof tip.category === 'object' ? (tip.category?.[lk] || '') : (lk === lang ? (tip.category || '') : '')} onChange={e => {
                    const arr = [...(settings.buyingTips || [])]
                    const existing = arr[idx].category
                    const obj = (typeof existing === 'object' && existing) ? { ...existing } : { fa: '', en: '', ar: '' }
                    obj[lk] = e.target.value
                    arr[idx] = { ...arr[idx], category: obj }
                    hc('buyingTips', arr)
                  }} style={{ flex: 1, padding: '4px 6px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 4, color: '#2D2D2D', fontSize: 11 }} placeholder={lk === 'fa' ? 'دسته' : lk === 'en' ? 'Category' : 'الفئة'} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {tip.image ? (
                <img src={tip.image} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', border: '1px solid #D4D0C8' }} />
              ) : null}
              <input type="file" accept="image/*" style={{ display: 'none' }} id={`tipImg${idx}`} onChange={async (e) => {
                const fd = new FormData()
                fd.append('image', e.target.files[0])
                try {
                  const { data } = await axios.post('/api/admin/upload', fd)
                  const arr = [...(settings.buyingTips || [])]
                  arr[idx] = { ...arr[idx], image: data.url }
                  hc('buyingTips', arr)
                } catch {}
              }} />
              <button onClick={() => document.getElementById(`tipImg${idx}`).click()} style={{ padding: '4px 8px', background: 'rgba(212,175,55,0.1)', border: '1px solid #D4D0C8', borderRadius: 4, cursor: 'pointer', fontSize: 11, color: '#4CAF50' }}>تصویر</button>
              {tip.image && <button onClick={() => {
                const arr = [...(settings.buyingTips || [])]
                arr[idx] = { ...arr[idx], image: '' }
                hc('buyingTips', arr)
              }} style={{ padding: '2px 6px', background: 'rgba(239,83,80,0.2)', color: '#EF5350', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 10 }}>✕</button>}
            </div>
            <button onClick={() => hc('buyingTips', (settings.buyingTips || []).filter((_, i) => i !== idx))} style={{ padding: '4px 10px', background: 'rgba(239,83,80,0.2)', color: '#EF5350', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14 }}>✕</button>
          </div>
        ))}
      </div>

      <div style={{...sectionStyle, display: activeTab === 'contact' ? 'block' : 'none'}}>
        <h3 style={{ color: '#4CAF50', margin: '0 0 8px', fontSize: 14 }}>عنوان صفحه تماس</h3>
        {renderLangField('contactTitle', 'عنوان صفحه')}
        {renderLangField('contactSubtitle', 'زیرعنوان', { type: 'textarea', rows: 2 })}

        <h3 style={{ color: '#4CAF50', margin: '16px 0 8px', fontSize: 14 }}>اطلاعات تماس</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          {renderField('phone', 'شماره تماس')}
          {renderField('mobile', 'موبایل')}
          {renderField('email', 'ایمیل', { ltr: true })}
          {renderLangField('address', 'آدرس نمایشگاه')}
          {renderLangField('address2', 'آدرس دوم')}
          {renderLangField('workingHours', 'ساعت کاری (روزهای عادی)')}
          {renderLangField('workingHoursFriday', 'ساعت کاری (جمعه)')}
        </div>

        <h3 style={{ color: '#4CAF50', margin: '16px 0 8px', fontSize: 14 }}>نقشه</h3>
        {renderField('mapLat', 'عرض جغرافیایی (Latitude)', { ltr: true, placeholder: '35.6892' })}
        {renderField('mapLng', 'طول جغرافیایی (Longitude)', { ltr: true, placeholder: '51.3890' })}
        {renderField('mapEmbed', 'کد Embed نقشه', { type: 'textarea', rows: 3, ltr: true, placeholder: '<iframe src=...' })}

        <h3 style={{ color: '#4CAF50', margin: '16px 0 8px', fontSize: 14 }}>فرم تماس</h3>
        {renderField('contactFormEmail', 'ایمیل دریافت فرم تماس', { ltr: true, placeholder: 'info@example.com' })}
        {renderField('contactFormEndpoint', 'آدرس API فرم تماس', { ltr: true, placeholder: '/api/contact' })}
        {renderLangField('contactFormSuccess', 'متن پیام موفقیت', { placeholder: 'پیام شما با موفقیت ارسال شد' })}
        {renderLangField('contactFormError', 'متن پیام خطا', { placeholder: 'خطا در ارسال پیام' })}
      </div>

      <div style={{...sectionStyle, display: activeTab === 'hero' ? 'block' : 'none'}}>
        <h3 style={{ color: '#4CAF50', margin: '0 0 8px', fontSize: 14 }}>بخش‌های قابل نمایش در سایت</h3>
        <p style={{ color: '#6B6B6B', fontSize: 11, marginBottom: 8 }}>بخش‌هایی که تیک ندارند در سایت نمایش داده نمی‌شوند.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[...(settings.homepageSections || [])].sort((a, b) => a.order - b.order).map(sec => (
            <label key={sec.id} style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px',
              background: sec.visible !== false ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.02)',
              borderRadius: 6, cursor: 'pointer', fontSize: 11, color: sec.visible !== false ? '#F5E6C8' : '#666',
              border: sec.visible !== false ? '1px solid rgba(212,175,55,0.2)' : '1px solid #333',
            }}>
              <input type="checkbox" checked={sec.visible !== false} onChange={e => {
                const arr = [...(settings.homepageSections || [])]
                const i = arr.findIndex(s => s.id === sec.id)
                if (i >= 0) { arr[i] = { ...arr[i], visible: e.target.checked }; hc('homepageSections', arr) }
              }} />
              {({
                'hero': 'بخش اصلی (Hero)',
                'banner': 'اسلایدر بنر',
                'brand-intro': 'معرفی برند',
                'product-categories': 'دسته‌بندی محصولات',
                'gallery': 'گالری تصاویر',
                'gallery-3d': 'گالری سه‌بعدی',
                'process-timeline': 'روند کاری',
                'milestones': 'نشان‌ها و افتخارات',
                'why-us': 'چرا ما',
                'testimonials': 'نظرات مشتریان',
                'team': 'تیم ما',
                'buying-tips': 'راهنمای خرید',
                'catalog': 'کاتالوگ',
                'eco-map': 'نقشه تعاملی',
                'festival': 'جشنواره فروش',
                'contact': 'فرم تماس',
              }[sec.id] || sec.id)}
            </label>
          ))}
        </div>
      </div>

      <div style={{...sectionStyle, display: activeTab === 'hero' ? 'block' : 'none'}}>
        <h3 style={{ color: '#4CAF50', margin: '0 0 8px', fontSize: 14 }}>منوی بالای سایت</h3>
        <p style={{ color: '#6B6B6B', fontSize: 11, marginBottom: 8 }}>لینک‌های منوی اصلی سایت را فعال یا غیرفعال کنید.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(settings.navLinks || []).map((link, idx) => (
            <label key={link.path} style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px',
              background: link.visible !== false ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.02)',
              borderRadius: 6, cursor: 'pointer', fontSize: 11, color: link.visible !== false ? '#F5E6C8' : '#666',
              border: link.visible !== false ? '1px solid rgba(212,175,55,0.2)' : '1px solid #333',
            }}>
              <input type="checkbox" checked={link.visible !== false} onChange={e => {
                const arr = [...(settings.navLinks || [])]
                arr[idx] = { ...arr[idx], visible: e.target.checked }
                hc('navLinks', arr)
              }} />
              {link.label || link.path}
            </label>
          ))}
        </div>
      </div>

      <div style={{...sectionStyle, display: activeTab === 'hero' ? 'block' : 'none'}}>
        <h3 style={{ color: '#2D2D2D', margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>مدیریت اسلایدر صفحه اصلی</h3>
        <p style={{ color: '#6B6B6B', fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>
          اسلایدهای هدر را مدیریت کنید. هر اسلاید می‌تواند از نوع بنر (تصویر+متن)، محصولات (نمایش محصولات) یا پروموشن (تخفیف ویژه) باشد.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
          {(settings.heroSlides || []).map((slide, idx) => {
            const slideType = slide.type || 'banner'
            return (
              <div key={idx} style={{
                background: '#FAFAF7', borderRadius: 12, padding: 16,
                border: slide.active === false ? '1px dashed #CCC' : '1px solid #E8E4DC',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ color: '#2D2D2D', fontSize: 13, fontWeight: 600 }}>
                    اسلاید {idx + 1}
                    {slide.active === false && <span style={{ color: '#999', fontSize: 11, marginRight: 8 }}>(غیرفعال)</span>}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => {
                      const arr = [...(settings.heroSlides || [])]; arr[idx] = { ...arr[idx], active: !arr[idx].active }
                      hc('heroSlides', arr)
                    }} style={{ padding: '4px 10px', background: 'transparent', border: '1px solid #D4D0C8', borderRadius: 5, cursor: 'pointer', fontSize: 11, color: '#6B6B6B' }}>
                      {slide.active === false ? 'فعال کردن' : 'غیرفعال'}
                    </button>
                    <button onClick={() => hc('heroSlides', (settings.heroSlides || []).filter((_, i) => i !== idx))} style={{ padding: '4px 10px', background: 'rgba(239,83,80,0.1)', border: '1px solid rgba(239,83,80,0.2)', borderRadius: 5, cursor: 'pointer', fontSize: 11, color: '#EF5350' }}>حذف</button>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 10 }}>
                  <div>
                    <label style={{ color: '#6B6B6B', fontSize: 11, display: 'block', marginBottom: 4 }}>نوع اسلاید</label>
                    <select value={slideType} onChange={e => {
                      const arr = [...(settings.heroSlides || [])]; arr[idx] = { ...arr[idx], type: e.target.value }
                      hc('heroSlides', arr)
                    }} style={{ padding: '8px 12px', background: '#FFF', border: '1px solid #D4D0C8', borderRadius: 6, color: '#2D2D2D', fontSize: 12, outline: 'none', width: '100%' }}>
                      <option value="banner">بنر (تصویر و متن)</option>
                      <option value="products">محصولات</option>
                      <option value="promo">پروموشن (تخفیف)</option>
                    </select>
                  </div>

                  {slideType !== 'products' && (
                    <div>
                      <label style={{ color: '#6B6B6B', fontSize: 11, display: 'block', marginBottom: 4 }}>تصویر اسلاید</label>
                      <ImageUpload value={slide.image} onChange={url => {
                        const arr = [...(settings.heroSlides || [])]; arr[idx] = { ...arr[idx], image: url }
                        hc('heroSlides', arr)
                      }} />
                    </div>
                  )}

                  {slideType === 'banner' && (
                    <>
                      <InputField label="عنوان" value={slide.title || ''} onChange={v => {
                        const arr = [...(settings.heroSlides || [])]; arr[idx] = { ...arr[idx], title: v }
                        hc('heroSlides', arr)
                      }} />
                      <InputField label="زیرعنوان" value={slide.subtitle || ''} onChange={v => {
                        const arr = [...(settings.heroSlides || [])]; arr[idx] = { ...arr[idx], subtitle: v }
                        hc('heroSlides', arr)
                      }} />
                      <InputField label="متن توضیحات" type="textarea" value={slide.description || ''} onChange={v => {
                        const arr = [...(settings.heroSlides || [])]; arr[idx] = { ...arr[idx], description: v }
                        hc('heroSlides', arr)
                      }} />
                    </>
                  )}

                  {slideType === 'products' && (
                    <>
                      <InputField label="عنوان بخش محصولات" value={slide.productsTitle || ''} onChange={v => {
                        const arr = [...(settings.heroSlides || [])]; arr[idx] = { ...arr[idx], productsTitle: v }
                        hc('heroSlides', arr)
                      }} />
                    </>
                  )}

                  {slideType === 'promo' && (
                    <>
                      <InputField label="عنوان پروموشن" value={slide.promoTitle || ''} onChange={v => {
                        const arr = [...(settings.heroSlides || [])]; arr[idx] = { ...arr[idx], promoTitle: v }
                        hc('heroSlides', arr)
                      }} />
                      <InputField label="توضیحات پروموشن" type="textarea" value={slide.promoDescription || ''} onChange={v => {
                        const arr = [...(settings.heroSlides || [])]; arr[idx] = { ...arr[idx], promoDescription: v }
                        hc('heroSlides', arr)
                      }} />
                    </>
                  )}

                  <InputField label="متن دکمه" value={slide.buttonText || ''} onChange={v => {
                    const arr = [...(settings.heroSlides || [])]; arr[idx] = { ...arr[idx], buttonText: v }
                    hc('heroSlides', arr)
                  }} />
                  <InputField label="لینک دکمه" value={slide.buttonLink || ''} onChange={v => {
                    const arr = [...(settings.heroSlides || [])]; arr[idx] = { ...arr[idx], buttonLink: v }
                    hc('heroSlides', arr)
                  }} dir="ltr" />
                </div>
              </div>
            )
          })}
        </div>

        <button onClick={() => hc('heroSlides', [...(settings.heroSlides || []), { type: 'banner', image: '', title: '', subtitle: '', description: '', buttonText: 'مشاهده محصولات', buttonLink: '/products', active: true }])}
          style={{ padding: '8px 20px', background: 'transparent', border: '1px dashed #4CAF50', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: '#4CAF50', marginBottom: 20 }}>
          + افزودن اسلاید جدید
        </button>

        <hr style={{ border: 'none', borderTop: '1px solid #E8E4DC', margin: '16px 0' }} />
        <h4 style={{ color: '#2D2D2D', margin: '0 0 12px', fontSize: 14, fontWeight: 600 }}>تنظیمات پیش‌فرض هدر</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          {renderLangField('heroBrandName', 'نام برند (لاتین)', { ltr: true })}
          {renderLangField('heroTitle', 'عنوان اصلی')}
          {renderLangField('heroSubtitle', 'زیرعنوان')}
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6B6B6B', fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={settings.showHeroButtons} onChange={e => hc('showHeroButtons', e.target.checked)} />
            نمایش دکمه‌ها در بخش Hero
          </label>
        </div>
      </div>

      <div style={{...sectionStyle, display: activeTab === 'hero' ? 'block' : 'none'}}>
        <h3 style={{ color: '#4CAF50', margin: '0 0 8px', fontSize: 14 }}>بخش Brand Intro (معرفی برند)</h3>
        {renderLangField('brandIntroTitle', 'عنوان بخش')}
        {renderLangField('brandIntroText', 'متن توضیحات', { type: 'textarea', rows: 2 })}
      </div>

      <div style={{...sectionStyle, display: activeTab === 'hero' ? 'block' : 'none'}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: '#4CAF50', margin: 0, fontSize: 16 }}>آمار و ویژگی‌ها (قابل افزایش/کاهش)</h3>
          <button onClick={addStat} style={{
            padding: '6px 16px', background: 'rgba(212,175,55,0.15)', color: '#4CAF50',
            border: '1px solid #4CAF50', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 'bold',
          }}>+ افزودن آیتم</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(settings.stats || []).map((stat, idx) => (
            <div key={idx} style={{
              display: 'flex', gap: 8, alignItems: 'center', padding: 12,
              background: 'rgba(255,255,255,0.03)', borderRadius: 8, flexWrap: 'wrap',
            }}>
              <span style={{ color: '#6B6B6B', fontSize: 12, minWidth: 24 }}>{idx + 1}.</span>
              <input value={stat.icon} onChange={e => updateStat(idx, 'icon', e.target.value)}
                style={{ width: 50, padding: '6px 8px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 4, color: '#2D2D2D', fontSize: 13, textAlign: 'center', outline: 'none' }}
                placeholder="🎯" />
              <input value={stat.value} onChange={e => updateStat(idx, 'value', e.target.value)}
                style={{ width: 70, padding: '6px 8px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 4, color: '#2D2D2D', fontSize: 13, textAlign: 'center', outline: 'none', direction: 'ltr' }}
                placeholder="مقدار" />
              <input value={stat.suffix} onChange={e => updateStat(idx, 'suffix', e.target.value)}
                style={{ width: 50, padding: '6px 8px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 4, color: '#2D2D2D', fontSize: 13, textAlign: 'center', outline: 'none' }}
                placeholder="+" />
              <div style={{ flex: 1, minWidth: 120, display: 'flex', gap: 2, flexDirection: 'column' }}>
                {langKeys.map(lk => (
                  <div key={lk} style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <span style={{ fontSize: 8, color: '#4CAF50', minWidth: 18 }}>{langLabels[lk]}</span>
                    <input value={typeof stat.label === 'object' ? (stat.label?.[lk] || '') : (lk === lang ? (stat.label || '') : '')} onChange={e => {
                      const existing = stat.label
                      const obj = (typeof existing === 'object' && existing) ? { ...existing } : { fa: '', en: '', ar: '' }
                      obj[lk] = e.target.value
                      updateStat(idx, 'label', obj)
                    }}
                      style={{ flex: 1, padding: '4px 6px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 4, color: '#2D2D2D', fontSize: 12, outline: 'none' }}
                      placeholder={lk === 'fa' ? 'برچسب' : lk === 'en' ? 'Label' : 'التسمیة'} />
                  </div>
                ))}
              </div>
              <button onClick={() => removeStat(idx)} style={{
                padding: '4px 10px', background: 'rgba(239,83,80,0.2)', color: '#EF5350',
                border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14,
              }}>✕</button>
            </div>
          ))}
        </div>
      </div>

      <div style={{...sectionStyle, display: activeTab === 'general' ? 'block' : 'none'}}>
        <h3 style={{ color: '#4CAF50', margin: '0 0 8px', fontSize: 14 }}>عنوان و توضیحات سایت</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          {renderLangField('siteName', 'نام سایت')}
          {renderLangField('siteDescription', 'توضیحات سایت')}
        </div>
        <h3 style={{ color: '#4CAF50', margin: '16px 0 8px', fontSize: 14 }}>لوگوی سایت</h3>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16,
          padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8,
        }}>
          <div>
            <label style={{ color: '#6B6B6B', fontSize: 11, display: 'block', marginBottom: 2 }}>لوگوی فارسی</label>
            <ImageUpload value={settings.logoImage_fa} onChange={v => hc('logoImage_fa', v)} />
          </div>
          <div>
            <label style={{ color: '#6B6B6B', fontSize: 11, display: 'block', marginBottom: 2 }}>لوگوی انگلیسی</label>
            <ImageUpload value={settings.logoImage_en} onChange={v => hc('logoImage_en', v)} />
          </div>
          <div>
            <label style={{ color: '#6B6B6B', fontSize: 11, display: 'block', marginBottom: 2 }}>لوگوی عربی</label>
            <ImageUpload value={settings.logoImage_ar} onChange={v => hc('logoImage_ar', v)} />
          </div>
        </div>
      </div>

      <div style={{...sectionStyle, display: activeTab === 'footer' ? 'block' : 'none'}}>
        <h3 style={{ color: '#4CAF50', margin: '0 0 8px', fontSize: 14 }}>متون فوتر</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          {renderLangField('footerLabels.quickLinks', 'عنوان: لینک‌های سریع')}
          {renderLangField('footerLabels.products', 'عنوان: محصولات')}
          {renderLangField('footerLabels.connect', 'عنوان: ارتباط با ما')}
          {renderLangField('footerLabels.workingHours', 'عنوان: ساعت کاری')}
        </div>
      </div>

      <div style={{...sectionStyle, display: activeTab === 'footer' ? 'block' : 'none'}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: '#4CAF50', margin: 0, fontSize: 16 }}>لینک‌های شبکه‌های اجتماعی (قابل افزایش/کاهش)</h3>
          <button onClick={() => hc('socialLinks', [...(settings.socialLinks || []), { key: 'new' + Date.now(), icon: '🔗', url: '', label: makeLangObj() }])} style={{
            padding: '6px 16px', background: 'rgba(212,175,55,0.15)', color: '#4CAF50',
            border: '1px solid #4CAF50', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 'bold',
          }}>+ افزودن شبکه</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(settings.socialLinks || []).map((sl, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: 10, background: 'rgba(255,255,255,0.02)', borderRadius: 8, flexWrap: 'wrap' }}>
              <span style={{ color: '#6B6B6B', fontSize: 12, minWidth: 20 }}>{idx + 1}.</span>
              {sl.icon && sl.icon.startsWith('http') ? (
                <img src={sl.icon} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{sl.icon || '🔗'}</span>
              )}
              <input value={sl.icon} onChange={e => {
                const arr = [...(settings.socialLinks || [])]
                arr[idx] = { ...arr[idx], icon: e.target.value }
                hc('socialLinks', arr)
              }} style={{ width: 50, padding: '6px 6px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 4, color: '#2D2D2D', fontSize: 11, textAlign: 'center' }} placeholder="آیکون" />
              <button onClick={() => setEmojiPicker({ target: 'socialLinks', index: idx })} style={{ padding: '3px 6px', background: 'rgba(212,175,55,0.1)', border: '1px solid #D4D0C8', borderRadius: 4, cursor: 'pointer', fontSize: 12, lineHeight: 1 }}>😀</button>
              <div style={{ flex: 1, minWidth: 80, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {langKeys.map(lk => (
                  <div key={lk} style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <span style={{ fontSize: 7, color: '#4CAF50', minWidth: 14 }}>{langLabels[lk]}</span>
                    <input value={typeof sl.label === 'object' ? (sl.label?.[lk] || '') : (lk === lang ? (sl.label || '') : '')} onChange={e => {
                      const arr = [...(settings.socialLinks || [])]
                      const existing = arr[idx].label
                      const obj = (typeof existing === 'object' && existing) ? { ...existing } : { fa: '', en: '', ar: '' }
                      obj[lk] = e.target.value
                      arr[idx] = { ...arr[idx], label: obj }
                      hc('socialLinks', arr)
                    }} style={{ width: '100%', padding: '3px 4px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 3, color: '#2D2D2D', fontSize: 10 }} placeholder={lk === 'fa' ? 'برچسب' : lk === 'en' ? 'Label' : 'التسمیة'} />
                  </div>
                ))}
              </div>
              <input value={sl.url || ''} onChange={e => {
                const arr = [...(settings.socialLinks || [])]
                arr[idx] = { ...arr[idx], url: e.target.value }
                hc('socialLinks', arr)
              }} style={{ flex: 1, minWidth: 150, padding: '6px 8px', background: '#FFFFFF', border: '1px solid #D4D0C8', borderRadius: 4, color: '#2D2D2D', fontSize: 11, direction: 'ltr' }} placeholder="https://..." />
              <button onClick={() => hc('socialLinks', (settings.socialLinks || []).filter((_, i) => i !== idx))} style={{ padding: '4px 10px', background: 'rgba(239,83,80,0.2)', color: '#EF5350', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14 }}>✕</button>
            </div>
          ))}
        </div>
      </div>

      <div style={{...sectionStyle, display: activeTab === 'footer' ? 'block' : 'none'}}>
        <h3 style={{ color: '#4CAF50', margin: '0 0 8px', fontSize: 14 }}>متون پایانی</h3>
        {renderLangField('footerCopyright', 'متن کپی‌رایت فوتر', { type: 'textarea', rows: 2 })}
      </div>

      <div style={{...sectionStyle, display: activeTab === 'json' ? 'block' : 'none'}}>
        <h3 style={{ color: '#4CAF50', margin: '0 0 8px', fontSize: 14 }}>ویرایش JSON تنظیمات</h3>
        <p style={{ color: '#6B6B6B', fontSize: 10, marginBottom: 8 }}>
          تنظیمات را مستقیماً به صورت JSON ویرایش کنید. برای اعتبارسنجی JSON دقت کنید.
        </p>
        <textarea value={jsonRaw} onChange={e => setJsonRaw(e.target.value)}
          style={{ width: '100%', minHeight: 400, padding: 8, background: '#FFFFFF', border: '1px solid #D4D0C8',
            borderRadius: 5, color: '#0f0', fontSize: 11, fontFamily: 'monospace', direction: 'ltr',
            outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
      </div>

      <div style={{ textAlign: 'left', marginTop: 12 }}>
        <button onClick={handleSave} disabled={saving} style={{
          padding: '6px 16px', background: saving ? '#666' : 'linear-gradient(135deg, #4CAF50, #388E3C)',
          color: '#fff', border: 'none', borderRadius: 6, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: 12,
        }}>{saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}</button>
      </div>

      {emojiPicker && (
        <EmojiPicker
          onSelect={(emoji) => {
            const { target, index, stepIndex, field } = emojiPicker
            if (target === 'socialLinks') {
              const arr = [...(settings.socialLinks || [])]
              arr[index] = { ...arr[index], icon: emoji }
              hc('socialLinks', arr)
            } else if (target === 'processes') {
              const arr = [...(settings.processes || [])]
              const steps = [...(arr[index].steps || [])]
              const key = field || 'icon'
              steps[stepIndex] = { ...steps[stepIndex], [key]: emoji }
              arr[index] = { ...arr[index], steps }
              hc('processes', arr)
            }
          }}
          onClose={() => setEmojiPicker(null)}
        />
      )}
    </div>
  )
}