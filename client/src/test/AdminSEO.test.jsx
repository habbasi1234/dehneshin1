import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import axios from 'axios'
import AdminSEO from '../pages/admin/AdminSEO'

vi.mock('axios')

const mockPages = [
  { path: '/', label: 'صفحه اصلی', langKey: 'home', title: 'خانه', description: 'توضیحات خانه', keywords: 'مبلمان' },
  { path: '/products', label: 'محصولات', langKey: 'products', title: 'محصولات', description: 'توضیحات محصولات', keywords: 'خرید' },
  { path: '/about', label: 'درباره ما', langKey: 'about', title: 'درباره ما', description: 'درباره شرکت', keywords: 'درباره' },
  { path: '/blog', label: 'مقالات', langKey: 'blog', title: 'مقالات', description: 'وبلاگ', keywords: 'مقاله' },
  { path: '/contact', label: 'تماس با ما', langKey: 'contact', title: 'تماس', description: 'راه‌های ارتباطی', keywords: 'تماس' },
  { path: '/catalog', label: 'کاتالوگ', langKey: 'catalog', title: 'کاتالوگ', description: 'دانلود کاتالوگ', keywords: 'کاتالوگ' },
  { path: '/wholesale', label: 'خرید عمده', langKey: 'wholesale', title: 'خرید عمده', description: 'سفارش عمده', keywords: 'عمده' },
  { path: '/farm-map', label: 'نقشه مزارع', langKey: 'farmMap', title: 'نقشه مزارع', description: 'نقشه مزارع', keywords: 'مزارع' },
  { path: '/cart', label: 'سبد خرید', langKey: 'cart', title: 'سبد خرید', description: 'سبد خرید شما', keywords: 'سبد خرید' },
  { path: '/track', label: 'پیگیری سفارش', langKey: 'track', title: 'پیگیری', description: 'پیگیری سفارش', keywords: 'رهگیری' },
]

const mockReport = {
  totalContent: 100,
  optimized: 72,
  issues: { missingTitle: 5, missingDesc: 8, missingKeywords: 12, missingSlug: 3 },
  products: 71,
  blogs: 29,
  categories: 6,
}

const mockSettings = {
  schemaOrg: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ده نشین',
    url: 'https://dehneshin.com',
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  axios.get.mockImplementation((url) => {
    if (url === '/api/seo/pages') return Promise.resolve({ data: { pages: mockPages } })
    if (url === '/api/seo/report') return Promise.resolve({ data: mockReport })
    if (url === '/api/admin/settings') return Promise.resolve({ data: mockSettings })
    if (url === '/api/seo/sitemap') return Promise.resolve({ data: { xml: '<?xml version="1.0"?><urlset></urlset>', totalUrls: 1, stats: { static: 1 }, generatedAt: new Date().toISOString() } })
    return Promise.reject(new Error('not found'))
  })
  axios.put.mockResolvedValue({ data: { success: true } })
  axios.post.mockResolvedValue({ data: { keywords: ['ارگانیک', 'طبیعی'], title: 'تست', metaDescription: 'توضیح', metaKeywords: 'کلمه' } })
  global.fetch = vi.fn(() => Promise.resolve({ text: () => Promise.resolve('<?xml version="1.0"?><urlset><url><loc>https://example.com</loc></url></urlset>') }))
  global.alert = vi.fn()
})

describe('AdminSEO - Tab Navigation', () => {
  it('renders all 6 tab buttons', async () => {
    render(<AdminSEO />)
    await waitFor(() => expect(screen.getByText('📄 صفحات')).toBeDefined())
    expect(screen.getByText('📊 گزارش')).toBeDefined()
    expect(screen.getByText('🔧 Schema')).toBeDefined()
    expect(screen.getByText('🗺 نقشه سایت')).toBeDefined()
    expect(screen.getByText('🔍 استخراج کلمات')).toBeDefined()
    expect(screen.getByText('🕷 خزش و رقبا')).toBeDefined()
  })

  it('defaults to pages tab', async () => {
    render(<AdminSEO />)
    await waitFor(() => {
      expect(screen.getByText('مدیریت SEO صفحات')).toBeDefined()
    })
  })

  it('switches to report tab on click', async () => {
    render(<AdminSEO />)
    await waitFor(() => expect(screen.getByText('📊 گزارش')).toBeDefined())
    fireEvent.click(screen.getByText('📊 گزارش'))
    await waitFor(() => {
      expect(screen.getByText('گزارش SEO')).toBeDefined()
    })
  })

  it('switches to schema tab on click', async () => {
    render(<AdminSEO />)
    await waitFor(() => expect(screen.getByText('🔧 Schema')).toBeDefined())
    fireEvent.click(screen.getByText('🔧 Schema'))
    await waitFor(() => {
      expect(screen.getByText('تنظیمات Schema.org')).toBeDefined()
    })
  })

  it('switches to sitemap tab on click', async () => {
    render(<AdminSEO />)
    await waitFor(() => expect(screen.getByText('🗺 نقشه سایت')).toBeDefined())
    fireEvent.click(screen.getByText('🗺 نقشه سایت'))
    expect(screen.getByText('نقشه سایت')).toBeDefined()
  })

  it('switches to extract tab on click', async () => {
    render(<AdminSEO />)
    await waitFor(() => expect(screen.getByText('🔍 استخراج کلمات')).toBeDefined())
    fireEvent.click(screen.getByText('🔍 استخراج کلمات'))
    expect(screen.getByPlaceholderText('https://example.com')).toBeDefined()
  })
})

describe('AdminSEO - Pages Tab', () => {
  it('fetches and displays all page cards from API', async () => {
    render(<AdminSEO />)
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/seo/pages')
    })
    await waitFor(() => {
      expect(screen.getByText('صفحه اصلی')).toBeDefined()
      expect(screen.getByText('محصولات')).toBeDefined()
      expect(screen.getByText('درباره ما')).toBeDefined()
      expect(screen.getByText('مقالات')).toBeDefined()
      expect(screen.getByText('تماس با ما')).toBeDefined()
    })
  })

  it('shows page paths on cards', async () => {
    render(<AdminSEO />)
    await waitFor(() => {
      expect(screen.getByText('/')).toBeDefined()
      expect(screen.getByText('/products')).toBeDefined()
      expect(screen.getByText('/about')).toBeDefined()
    })
  })

  it('renders title input fields', async () => {
    render(<AdminSEO />)
    await waitFor(() => {
      const titleFields = screen.getAllByText('عنوان (Title)')
      expect(titleFields.length).toBe(10)
    })
  })

  it('shows preview with page title', async () => {
    render(<AdminSEO />)
    await waitFor(() => {
      expect(screen.getByText(/خانه \| ده نشین/)).toBeDefined()
    })
  })

  it('updates input fields on change', async () => {
    render(<AdminSEO />)
    await waitFor(() => {
      const inputs = screen.getAllByDisplayValue('خانه')
      expect(inputs.length).toBeGreaterThan(0)
    })
    const firstInput = screen.getAllByDisplayValue('خانه')[0]
    fireEvent.change(firstInput, { target: { value: 'صفحه اصلی جدید' } })
    expect(firstInput.value).toBe('صفحه اصلی جدید')
  })

  it('calls save API when save button clicked', async () => {
    render(<AdminSEO />)
    await waitFor(() => {
      expect(screen.getByText('💾 ذخیره SEO')).toBeDefined()
    })
    fireEvent.click(screen.getByText('💾 ذخیره SEO'))
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('/api/seo/pages', { pages: mockPages })
    })
  })

  it('shows loading state on save', async () => {
    axios.put.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: { success: true } }), 100)))
    render(<AdminSEO />)
    await waitFor(() => expect(screen.getByText('💾 ذخیره SEO')).toBeDefined())
    fireEvent.click(screen.getByText('💾 ذخیره SEO'))
    await waitFor(() => {
      expect(screen.getByText('در حال ذخیره...')).toBeDefined()
    })
  })

  it('shows saved confirmation after save', async () => {
    render(<AdminSEO />)
    await waitFor(() => expect(screen.getByText('💾 ذخیره SEO')).toBeDefined())
    fireEvent.click(screen.getByText('💾 ذخیره SEO'))
    await waitFor(() => {
      expect(screen.getByText('✓ ذخیره شد')).toBeDefined()
    })
  })
})

describe('AdminSEO - Report Tab', () => {
  it('fetches report on mount', async () => {
    render(<AdminSEO />)
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/seo/report')
    })
  })

  it('displays report data', async () => {
    render(<AdminSEO />)
    await waitFor(() => {
      expect(screen.getByText('📊 گزارش')).toBeDefined()
    })
    fireEvent.click(screen.getByText('📊 گزارش'))
    await waitFor(() => {
      expect(screen.getByText('72')).toBeDefined()
      expect(screen.getByText('بهینه شده')).toBeDefined()
    })
  })

  it('shows issue counts', async () => {
    render(<AdminSEO />)
    fireEvent.click(screen.getByText('📊 گزارش'))
    await waitFor(() => {
      expect(screen.getByText('5')).toBeDefined()
      expect(screen.getByText('8')).toBeDefined()
      expect(screen.getByText('12')).toBeDefined()
      expect(screen.getByText('3')).toBeDefined()
    })
  })

  it('shows content type counts', async () => {
    render(<AdminSEO />)
    fireEvent.click(screen.getByText('📊 گزارش'))
    await waitFor(() => {
      expect(screen.getByText('71')).toBeDefined()
      expect(screen.getByText('29')).toBeDefined()
      expect(screen.getByText('6')).toBeDefined()
    })
  })

  it('refreshes report on button click', async () => {
    render(<AdminSEO />)
    fireEvent.click(screen.getByText('📊 گزارش'))
    await waitFor(() => expect(screen.getByText('🔄 بروزرسانی گزارش')).toBeDefined())
    axios.get.mockClear()
    fireEvent.click(screen.getByText('🔄 بروزرسانی گزارش'))
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/seo/report')
    })
  })

  it('shows loading text when no report yet', () => {
    axios.get.mockImplementation((url) => {
      if (url === '/api/seo/pages') return Promise.resolve({ data: { pages: mockPages } })
      return new Promise(() => {})
    })
    render(<AdminSEO />)
    fireEvent.click(screen.getByText('📊 گزارش'))
    expect(screen.getByText('در حال بارگذاری...')).toBeDefined()
  })
})

describe('AdminSEO - Schema Tab', () => {
  it('loads schema when بارگذاری button is clicked', async () => {
    render(<AdminSEO />)
    fireEvent.click(screen.getByText('🔧 Schema'))
    fireEvent.click(screen.getByText('🔄 بارگذاری'))
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/admin/settings')
    })
  })

  it('displays schema JSON in textarea after loading', async () => {
    render(<AdminSEO />)
    fireEvent.click(screen.getByText('🔧 Schema'))
    fireEvent.click(screen.getByText('🔄 بارگذاری'))
    await waitFor(() => {
      const textarea = screen.getByDisplayValue(/ده نشین/)
      expect(textarea).toBeDefined()
    })
  })

  it('saves schema on button click after loading', async () => {
    render(<AdminSEO />)
    fireEvent.click(screen.getByText('🔧 Schema'))
    fireEvent.click(screen.getByText('🔄 بارگذاری'))
    await waitFor(() => expect(screen.getByText('💾 ذخیره Schema')).toBeDefined())
    fireEvent.click(screen.getByText('💾 ذخیره Schema'))
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('/api/admin/settings', expect.objectContaining({
        schemaOrg: expect.objectContaining({ '@type': 'Organization' })
      }))
    })
  })

  it('shows alert on invalid JSON', async () => {
    render(<AdminSEO />)
    fireEvent.click(screen.getByText('🔧 Schema'))
    await waitFor(() => {
      const textarea = document.querySelector('textarea')
      if (textarea) {
        fireEvent.change(textarea, { target: { value: 'not json' } })
      }
    })
    fireEvent.click(screen.getByText('💾 ذخیره Schema'))
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalled()
    })
  })

  it('loads schema fresh on بارگذاری button click', async () => {
    render(<AdminSEO />)
    fireEvent.click(screen.getByText('🔧 Schema'))
    await waitFor(() => expect(screen.getByText('🔄 بارگذاری')).toBeDefined())
    axios.get.mockClear()
    fireEvent.click(screen.getByText('🔄 بارگذاری'))
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/admin/settings')
    })
  })
})

describe('AdminSEO - Sitemap Tab', () => {
  it('fetches sitemap on button click', async () => {
    render(<AdminSEO />)
    fireEvent.click(screen.getByText('🗺 نقشه سایت'))
    await waitFor(() => expect(screen.getByText('📂 دریافت آخرین نسخه')).toBeDefined())
    fireEvent.click(screen.getByText('📂 دریافت آخرین نسخه'))
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/sitemap.xml')
      expect(axios.get).toHaveBeenCalledWith('/api/seo/sitemap')
    })
  })

  it('displays sitemap XML content', async () => {
    render(<AdminSEO />)
    fireEvent.click(screen.getByText('🗺 نقشه سایت'))
    await waitFor(() => expect(screen.getByText('📂 دریافت آخرین نسخه')).toBeDefined())
    fireEvent.click(screen.getByText('📂 دریافت آخرین نسخه'))
    await waitFor(() => {
      expect(screen.getByText(/https:\/\/example.com/)).toBeDefined()
    })
  })

  it('generates sitemap on click', async () => {
    axios.post.mockImplementation((url) => {
      if (url === '/api/seo/generate-sitemap') return Promise.resolve({ data: { xml: '<urlset><url><loc>https://example.com/new</loc></url></urlset>', totalUrls: 1, stats: { static: 1 }, generatedAt: new Date().toISOString() } })
      return Promise.resolve({ data: { keywords: ['ارگانیک', 'طبیعی'], title: 'تست', metaDescription: 'توضیح', metaKeywords: 'کلمه' } })
    })
    render(<AdminSEO />)
    fireEvent.click(screen.getByText('🗺 نقشه سایت'))
    await waitFor(() => expect(screen.getByText('🔄 تولید نقشه سایت')).toBeDefined())
    fireEvent.click(screen.getByText('🔄 تولید نقشه سایت'))
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/seo/generate-sitemap')
    })
  })

  it('shows error message on fetch failure', async () => {
    global.fetch.mockRejectedValueOnce(new Error('fail'))
    axios.get.mockRejectedValueOnce(new Error('fail'))
    render(<AdminSEO />)
    fireEvent.click(screen.getByText('🗺 نقشه سایت'))
    await waitFor(() => expect(screen.getByText('📂 دریافت آخرین نسخه')).toBeDefined())
    fireEvent.click(screen.getByText('📂 دریافت آخرین نسخه'))
    await waitFor(() => {
      expect(screen.getByText('خطا در دریافت sitemap')).toBeDefined()
    })
  })
})

describe('AdminSEO - Extract Tab', () => {
  it('renders URL input', async () => {
    render(<AdminSEO />)
    fireEvent.click(screen.getByText('🔍 استخراج کلمات'))
    await waitFor(() => {
      expect(screen.getByPlaceholderText('https://example.com')).toBeDefined()
    })
  })

  it('disables extract button when URL is empty', async () => {
    render(<AdminSEO />)
    fireEvent.click(screen.getByText('🔍 استخراج کلمات'))
    await waitFor(() => {
      const btn = screen.getByText('🔍 استخراج')
      expect(btn.closest('button')).toBeDisabled()
    })
  })

  it('enables extract button when URL is entered', async () => {
    render(<AdminSEO />)
    fireEvent.click(screen.getByText('🔍 استخراج کلمات'))
    const input = screen.getByPlaceholderText('https://example.com')
    fireEvent.change(input, { target: { value: 'https://example.com' } })
    const btn = screen.getByText('🔍 استخراج')
    expect(btn.closest('button')).not.toBeDisabled()
  })

  it('calls extract API on button click', async () => {
    render(<AdminSEO />)
    fireEvent.click(screen.getByText('🔍 استخراج کلمات'))
    const input = screen.getByPlaceholderText('https://example.com')
    fireEvent.change(input, { target: { value: 'https://example.com' } })
    fireEvent.click(screen.getByText('🔍 استخراج'))
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/seo/extract-keywords', { url: 'https://example.com' })
    })
  })

  it('displays extracted title', async () => {
    render(<AdminSEO />)
    fireEvent.click(screen.getByText('🔍 استخراج کلمات'))
    const input = screen.getByPlaceholderText('https://example.com')
    fireEvent.change(input, { target: { value: 'https://example.com' } })
    fireEvent.click(screen.getByText('🔍 استخراج'))
    await waitFor(() => {
      expect(screen.getByText('تست')).toBeDefined()
    })
  })

  it('displays extracted description', async () => {
    render(<AdminSEO />)
    fireEvent.click(screen.getByText('🔍 استخراج کلمات'))
    const input = screen.getByPlaceholderText('https://example.com')
    fireEvent.change(input, { target: { value: 'https://example.com' } })
    fireEvent.click(screen.getByText('🔍 استخراج'))
    await waitFor(() => {
      expect(screen.getByText('توضیح')).toBeDefined()
    })
  })

  it('displays extracted keywords', async () => {
    render(<AdminSEO />)
    fireEvent.click(screen.getByText('🔍 استخراج کلمات'))
    const input = screen.getByPlaceholderText('https://example.com')
    fireEvent.change(input, { target: { value: 'https://example.com' } })
    fireEvent.click(screen.getByText('🔍 استخراج'))
    await waitFor(() => {
      expect(screen.getByText('ارگانیک')).toBeDefined()
      expect(screen.getByText('طبیعی')).toBeDefined()
    })
  })

  it('shows error when extract fails', async () => {
    axios.post.mockRejectedValueOnce(new Error('fail'))
    render(<AdminSEO />)
    fireEvent.click(screen.getByText('🔍 استخراج کلمات'))
    const input = screen.getByPlaceholderText('https://example.com')
    fireEvent.change(input, { target: { value: 'https://example.com' } })
    fireEvent.click(screen.getByText('🔍 استخراج'))
    await waitFor(() => {
      expect(screen.getByText('خطا در دریافت اطلاعات')).toBeDefined()
    })
  })
})

describe('AdminSEO - Error Handling', () => {
  it('handles pages fetch error gracefully', async () => {
    axios.get.mockImplementation((url) => {
      if (url === '/api/seo/pages') return Promise.reject(new Error('fail'))
      if (url === '/api/seo/report') return Promise.resolve({ data: mockReport })
      if (url === '/api/admin/settings') return Promise.resolve({ data: mockSettings })
      return Promise.reject(new Error('not found'))
    })
    render(<AdminSEO />)
    await waitFor(() => {
      expect(screen.getByText('مدیریت SEO صفحات')).toBeDefined()
    })
  })

  it('handles report fetch error gracefully', async () => {
    axios.get.mockImplementation((url) => {
      if (url === '/api/seo/pages') return Promise.resolve({ data: { pages: mockPages } })
      if (url === '/api/seo/report') return Promise.reject(new Error('fail'))
      if (url === '/api/admin/settings') return Promise.resolve({ data: mockSettings })
      return Promise.reject(new Error('not found'))
    })
    render(<AdminSEO />)
    fireEvent.click(screen.getByText('📊 گزارش'))
    await waitFor(() => {
      expect(screen.getByText('🔄 بروزرسانی گزارش')).toBeDefined()
    })
  })

  it('handles save error gracefully', async () => {
    axios.put.mockRejectedValueOnce(new Error('fail'))
    render(<AdminSEO />)
    await waitFor(() => expect(screen.getByText('💾 ذخیره SEO')).toBeDefined())
    fireEvent.click(screen.getByText('💾 ذخیره SEO'))
    await waitFor(() => {
      expect(screen.getByText('💾 ذخیره SEO')).toBeDefined()
    })
  })
})

describe('AdminSEO - Section Component', () => {
  it('renders section title', () => {
    const { container } = render(<AdminSEO />)
    const headings = container.querySelectorAll('h2')
    expect(headings.length).toBeGreaterThan(0)
  })
})

describe('AdminSEO - Field Component', () => {
  it('renders text inputs', async () => {
    render(<AdminSEO />)
    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox')
      expect(inputs.length).toBeGreaterThan(0)
    })
  })
})
