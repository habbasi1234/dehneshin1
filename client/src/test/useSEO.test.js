import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import useSEO from '../hooks/useSEO'

describe('useSEO', () => {
  beforeEach(() => {
    document.title = ''
    document.head.innerHTML = ''
  })

  afterEach(() => {
    document.title = ''
    document.head.innerHTML = ''
  })

  it('sets document title', () => {
    useSEO({ title: 'محصولات' })
    expect(document.title).toBe('محصولات | ده نشین')
  })

  it('does not duplicate brand name when already present', () => {
    useSEO({ title: 'ده نشین | محصولات ارگانیک' })
    expect(document.title).toBe('ده نشین | محصولات ارگانیک')
  })

  it('handles string argument as title', () => {
    useSEO('تماس با ما')
    expect(document.title).toBe('تماس با ما | ده نشین')
  })

  it('sets default title when no options provided', () => {
    useSEO({})
    expect(document.title).toBe('ده نشین | محصولات ارگانیک')
  })

  it('creates meta description tag', () => {
    const desc = 'توضیحات صفحه'
    useSEO({ description: desc })
    const meta = document.querySelector('meta[name="description"]')
    expect(meta).toBeDefined()
    expect(meta.getAttribute('content')).toBe(desc)
  })

  it('sets default description when not provided', () => {
    useSEO({ title: 'test' })
    const meta = document.querySelector('meta[name="description"]')
    expect(meta).toBeDefined()
    expect(meta.getAttribute('content')).toContain('ده نشین، فروشگاه آنلاین محصولات ارگانیک و طبیعی')
  })

  it('creates meta keywords tag', () => {
    useSEO({ keywords: 'ارگانیک, طبیعی, تازه' })
    const meta = document.querySelector('meta[name="keywords"]')
    expect(meta).toBeDefined()
    expect(meta.getAttribute('content')).toBe('ارگانیک, طبیعی, تازه')
  })

  it('does not create keywords tag when not provided', () => {
    useSEO({ title: 'test' })
    const meta = document.querySelector('meta[name="keywords"]')
    expect(meta).toBeNull()
  })

  it('sets og:title meta tag', () => {
    useSEO({ title: 'محصولات', ogTitle: 'OG Title' })
    const meta = document.querySelector('meta[property="og:title"]')
    expect(meta).toBeDefined()
    expect(meta.getAttribute('content')).toBe('OG Title')
  })

  it('falls back to fullTitle for og:title', () => {
    useSEO({ title: 'محصولات' })
    const meta = document.querySelector('meta[property="og:title"]')
    expect(meta.getAttribute('content')).toBe('محصولات | ده نشین')
  })

  it('sets og:description meta tag', () => {
    useSEO({ ogDescription: 'OG Desc' })
    const meta = document.querySelector('meta[property="og:description"]')
    expect(meta).toBeDefined()
    expect(meta.getAttribute('content')).toBe('OG Desc')
  })

  it('falls back to description for og:description', () => {
    useSEO({ description: 'توضیحات صفحه' })
    const meta = document.querySelector('meta[property="og:description"]')
    expect(meta.getAttribute('content')).toBe('توضیحات صفحه')
  })

  it('sets og:image with full URL when relative', () => {
    useSEO({ ogImage: '/custom-og.jpg' })
    const meta = document.querySelector('meta[property="og:image"]')
    expect(meta.getAttribute('content')).toBe('https://dehneshin.com/custom-og.jpg')
  })

  it('keeps og:image as-is when absolute URL', () => {
    useSEO({ ogImage: 'https://example.com/image.jpg' })
    const meta = document.querySelector('meta[property="og:image"]')
    expect(meta.getAttribute('content')).toBe('https://example.com/image.jpg')
  })

  it('uses default OG image when not provided', () => {
    useSEO({ title: 'test' })
    const meta = document.querySelector('meta[property="og:image"]')
    expect(meta.getAttribute('content')).toBe('https://dehneshin.com/og-default.jpg')
  })

  it('sets og:url from ogUrl option', () => {
    useSEO({ ogUrl: 'https://example.com/page' })
    const meta = document.querySelector('meta[property="og:url"]')
    expect(meta.getAttribute('content')).toBe('https://example.com/page')
  })

  it('sets og:url from canonical when ogUrl not provided', () => {
    useSEO({ canonical: '/page' })
    const meta = document.querySelector('meta[property="og:url"]')
    expect(meta.getAttribute('content')).toBe('https://dehneshin.com/page')
  })

  it('sets og:url from window location when nothing provided', () => {
    useSEO({})
    const meta = document.querySelector('meta[property="og:url"]')
    expect(meta).toBeDefined()
  })

  it('sets og:type to website', () => {
    useSEO({})
    const meta = document.querySelector('meta[property="og:type"]')
    expect(meta.getAttribute('content')).toBe('website')
  })

  it('sets og:site_name', () => {
    useSEO({})
    const meta = document.querySelector('meta[property="og:site_name"]')
    expect(meta.getAttribute('content')).toBe('ده نشین')
  })

  it('sets twitter:card', () => {
    useSEO({})
    const meta = document.querySelector('meta[property="twitter:card"]')
    expect(meta.getAttribute('content')).toBe('summary_large_image')
  })

  it('sets twitter:title', () => {
    useSEO({ title: 'محصولات', ogTitle: 'Tw Title' })
    const meta = document.querySelector('meta[property="twitter:title"]')
    expect(meta.getAttribute('content')).toBe('Tw Title')
  })

  it('sets twitter:description', () => {
    useSEO({ ogDescription: 'Tw Desc' })
    const meta = document.querySelector('meta[property="twitter:description"]')
    expect(meta.getAttribute('content')).toBe('Tw Desc')
  })

  it('sets twitter:image', () => {
    useSEO({ ogImage: '/tw-image.jpg' })
    const meta = document.querySelector('meta[property="twitter:image"]')
    expect(meta.getAttribute('content')).toBe('https://dehneshin.com/tw-image.jpg')
  })

  it('creates canonical link element', () => {
    useSEO({ canonical: '/products' })
    const link = document.querySelector('link[rel="canonical"]')
    expect(link).toBeDefined()
    expect(link.getAttribute('href')).toBe('https://dehneshin.com/products')
  })

  it('uses window path for canonical when not provided', () => {
    useSEO({})
    const link = document.querySelector('link[rel="canonical"]')
    expect(link).toBeDefined()
  })

  it('does not duplicate meta tags on multiple calls', () => {
    useSEO({ title: 'صفحه اول', description: 'اول' })
    useSEO({ title: 'صفحه دوم', description: 'دوم' })
    const metas = document.querySelectorAll('meta[name="description"]')
    expect(metas.length).toBe(1)
    expect(metas[0].getAttribute('content')).toBe('دوم')
  })

  it('does not duplicate canonical link on multiple calls', () => {
    useSEO({ canonical: '/page1' })
    useSEO({ canonical: '/page2' })
    const links = document.querySelectorAll('link[rel="canonical"]')
    expect(links.length).toBe(1)
    expect(links[0].getAttribute('href')).toBe('https://dehneshin.com/page2')
  })

  it('handles Persian title with proper brand suffix', () => {
    useSEO({ title: 'درباره ما' })
    expect(document.title).toBe('درباره ما | ده نشین')
  })

  it('handles null/undefined options gracefully', () => {
    expect(() => useSEO(null)).not.toThrow()
    expect(() => useSEO(undefined)).not.toThrow()
  })
})
