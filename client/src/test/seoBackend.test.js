import { describe, it, expect } from 'vitest'

const pageDefaults = [
  { path: '/', label: 'صفحه اصلی', langKey: 'home', title: 'ده نشین | محصولات ارگانیک', description: 'ده نشین، فروشگاه محصولات ارگانیک و طبیعی', keywords: 'محصولات ارگانیک, ده نشین, فروشگاه ارگانیک' },
  { path: '/products', label: 'محصولات', langKey: 'products', title: 'محصولات | ده نشین', description: 'مجموعه‌ای از بهترین محصولات ارگانیک و طبیعی', keywords: 'خرید محصولات ارگانیک, میوه ارگانیک, سبزیجات ارگانیک' },
  { path: '/about', label: 'درباره ما', langKey: 'about', title: 'درباره ما | ده نشین', description: 'ده نشین، از مزرعه تا سفره', keywords: 'درباره ده نشین, محصولات طبیعی' },
  { path: '/blog', label: 'مقالات', langKey: 'blog', title: 'مقالات | ده نشین', description: 'جدیدترین مطالب در زمینه تغذیه سالم و ارگانیک', keywords: 'تغذیه سالم, محصولات ارگانیک, مقالات سلامت' },
  { path: '/contact', label: 'تماس با ما', langKey: 'contact', title: 'تماس با ما | ده نشین', description: 'راه‌های ارتباطی با ده نشین', keywords: 'تماس با ده نشین, آدرس فروشگاه' },
  { path: '/catalog', label: 'کاتالوگ', langKey: 'catalog', title: 'کاتالوگ | ده نشین', description: 'دانلود کاتالوگ محصولات ده نشین', keywords: 'کاتالوگ محصولات ارگانیک, دانلود کاتالوگ' },
  { path: '/wholesale', label: 'خرید عمده', langKey: 'wholesale', title: 'خرید عمده | ده نشین', description: 'خرید عمده محصولات ارگانیک با تخفیف ویژه', keywords: 'خرید عمده, محصولات ارگانیک عمده' },
  { path: '/farm-map', label: 'نقشه مزارع', langKey: 'farmMap', title: 'نقشه مزارع | ده نشین', description: 'نقشه مزارع و مراکز تولید', keywords: 'نقشه مزارع, مراکز تولید ارگانیک' },
  { path: '/cart', label: 'سبد خرید', langKey: 'cart', title: 'سبد خرید | ده نشین', description: 'سبد خرید شما', keywords: 'سبد خرید, خرید محصولات ارگانیک' },
  { path: '/track', label: 'پیگیری سفارش', langKey: 'track', title: 'پیگیری سفارش | ده نشین', description: 'پیگیری سفارش آنلاین', keywords: 'پیگیری سفارش, رهگیری خرید' },
]

function calcReport(products, blogs, categories) {
  const missingTitle = products.filter(p => !p.name).length + blogs.filter(b => !b.title).length
  const missingDesc = products.filter(p => !p.description && !p.desc_fa).length + blogs.filter(b => !b.description).length
  const missingKeywords = products.filter(p => !p.keywords).length + blogs.filter(b => !b.keywords).length
  const missingSlug = products.filter(p => !p.slug).length + blogs.filter(b => !b.slug).length + categories.filter(c => !c.slug).length
  const totalContent = products.length + blogs.length
  const optimized = totalContent - missingTitle - missingDesc - missingKeywords - missingSlug

  return {
    totalContent,
    optimized: Math.max(0, optimized),
    issues: { missingTitle, missingDesc, missingKeywords, missingSlug },
    products: products.length,
    blogs: blogs.length,
    categories: categories.length,
  }
}

function extractFreqWords(words, stopWords) {
  const wordFreq = {}
  words.forEach(w => {
    const lower = w.toLowerCase()
    if (!wordFreq[lower]) wordFreq[lower] = 0
    wordFreq[lower]++
  })
  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .filter(([w]) => !stopWords.includes(w))
    .slice(0, 30)
}

describe('SEO Page Defaults', () => {
  it('has exactly 10 pages', () => {
    expect(pageDefaults.length).toBe(10)
  })

  it('each page has required fields', () => {
    pageDefaults.forEach(page => {
      expect(page).toHaveProperty('path')
      expect(page).toHaveProperty('label')
      expect(page).toHaveProperty('langKey')
      expect(page).toHaveProperty('title')
      expect(page).toHaveProperty('description')
      expect(page).toHaveProperty('keywords')
    })
  })

  it('page paths are unique', () => {
    const paths = pageDefaults.map(p => p.path)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('langKeys are unique', () => {
    const keys = pageDefaults.map(p => p.langKey)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('each path starts with /', () => {
    pageDefaults.forEach(page => {
      expect(page.path.startsWith('/')).toBe(true)
    })
  })

  it('all pages have non-empty titles', () => {
    pageDefaults.forEach(page => {
      expect(page.title.length).toBeGreaterThan(0)
    })
  })

  it('all pages have non-empty descriptions', () => {
    pageDefaults.forEach(page => {
      expect(page.description.length).toBeGreaterThan(0)
    })
  })

  it('all pages have non-empty keywords', () => {
    pageDefaults.forEach(page => {
      expect(page.keywords.length).toBeGreaterThan(0)
    })
  })

  it('every title ends with brand name', () => {
    pageDefaults.forEach(page => {
      expect(page.title.includes('ده نشین')).toBe(true)
    })
  })
})

describe('SEO Report Calculator', () => {
  const products = [
    { name: 'مبل', description: 'desc', keywords: 'kw', slug: 'mobl' },
    { name: 'صندلی', description: 'desc', keywords: 'kw', slug: 'sandali' },
    { name: '', description: '', keywords: '', slug: 'product-3' },
    { name: 'میز', description: 'توضیح', keywords: 'کلمه', slug: 'miz' },
  ]

  const blogs = [
    { title: 'مقاله', description: 'desc', keywords: 'kw', slug: 'article' },
    { title: '', description: '', keywords: '', slug: '' },
  ]

  const categories = [
    { slug: 'classic' },
    { slug: 'modern' },
    { slug: '' },
  ]

  it('calculates total content count', () => {
    const report = calcReport(products, blogs, categories)
    expect(report.totalContent).toBe(6)
  })

  it('counts products', () => {
    const report = calcReport(products, blogs, categories)
    expect(report.products).toBe(4)
  })

  it('counts blogs', () => {
    const report = calcReport(products, blogs, categories)
    expect(report.blogs).toBe(2)
  })

  it('counts categories', () => {
    const report = calcReport(products, blogs, categories)
    expect(report.categories).toBe(3)
  })

  it('counts missing titles', () => {
    const report = calcReport(products, blogs, categories)
    expect(report.issues.missingTitle).toBe(2)
  })

  it('counts missing descriptions', () => {
    const report = calcReport(products, blogs, categories)
    expect(report.issues.missingDesc).toBe(2)
  })

  it('counts missing keywords', () => {
    const report = calcReport(products, blogs, categories)
    expect(report.issues.missingKeywords).toBe(2)
  })

  it('counts missing slugs (products + blogs + categories)', () => {
    const report = calcReport(products, blogs, categories)
    expect(report.issues.missingSlug).toBe(2)
  })

  it('calculates optimized count', () => {
    const report = calcReport(products, blogs, categories)
    expect(report.optimized).toBe(0)
  })

  it('handles empty data', () => {
    const report = calcReport([], [], [])
    expect(report.totalContent).toBe(0)
    expect(report.optimized).toBe(0)
    expect(report.issues.missingTitle).toBe(0)
    expect(report.issues.missingDesc).toBe(0)
  })

  it('optimized never goes negative', () => {
    const report = calcReport(
      [{ name: '', description: '', keywords: '', slug: '' }],
      [{ title: '', description: '', keywords: '', slug: '' }],
      [{ slug: '' }]
    )
    expect(report.optimized).toBe(0)
    expect(report.totalContent).toBe(2)
    expect(report.issues.missingTitle).toBe(2)
    expect(report.issues.missingDesc).toBe(2)
    expect(report.issues.missingKeywords).toBe(2)
    expect(report.issues.missingSlug).toBe(3)
  })

  it('handles fully optimized content', () => {
    const report = calcReport(
      [{ name: 'a', description: 'b', keywords: 'c', slug: 'd' }],
      [{ title: 'a', description: 'b', keywords: 'c', slug: 'd' }],
      [{ slug: 'e' }]
    )
    expect(report.optimized).toBe(2)
    expect(report.issues.missingTitle).toBe(0)
  })
})

describe('Keyword Extractor - Word Frequency', () => {
  const stopWords = ['این', 'آن', 'که', 'با', 'از', 'برای', 'و', 'به', 'در']

  it('counts word frequency correctly', () => {
    const words = ['مبلمان', 'مبلمان', 'کلاسیک', 'مدرن']
    const result = extractFreqWords(words, stopWords)
    expect(result[0]).toEqual(['مبلمان', 2])
    expect(result[1]).toEqual(['کلاسیک', 1])
    expect(result[2]).toEqual(['مدرن', 1])
  })

  it('filters stop words', () => {
    const words = ['مبلمان', 'و', 'کلاسیک', 'در', 'مدرن']
    const result = extractFreqWords(words, stopWords)
    const resultWords = result.map(([w]) => w)
    expect(resultWords).not.toContain('و')
    expect(resultWords).not.toContain('در')
    expect(resultWords).toContain('مبلمان')
    expect(resultWords).toContain('کلاسیک')
  })

  it('limits to 30 results', () => {
    const words = Array.from({ length: 50 }, (_, i) => `word${i}`)
    const result = extractFreqWords(words, stopWords)
    expect(result.length).toBeLessThanOrEqual(30)
  })

  it('does case-insensitive grouping', () => {
    const words = ['مبلمان', 'مبلمان', 'مبلمان']
    const result = extractFreqWords(words, stopWords)
    expect(result[0][1]).toBe(3)
  })

  it('returns empty array for no input', () => {
    const result = extractFreqWords([], stopWords)
    expect(result).toEqual([])
  })

  it('sorts descending by frequency', () => {
    const words = ['کلاسیک', 'مبلمان', 'مبلمان', 'مدرن', 'مدرن', 'مدرن']
    const result = extractFreqWords(words, stopWords)
    expect(result[0][0]).toBe('مدرن')
    expect(result[0][1]).toBe(3)
    expect(result[1][0]).toBe('مبلمان')
    expect(result[1][1]).toBe(2)
    expect(result[2][0]).toBe('کلاسیک')
    expect(result[2][1]).toBe(1)
  })

  it('filters all stop words leaving empty result', () => {
    const words = ['این', 'آن', 'که']
    const result = extractFreqWords(words, stopWords)
    expect(result.length).toBe(0)
  })
})
