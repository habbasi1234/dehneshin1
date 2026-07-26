import { describe, it, expect } from 'vitest'

function getSectionFromPath(path) {
  if (!path || path === '/' || path === '') return 'home'
  const clean = path.split('?')[0].split('#')[0].replace(/\/+$/, '')
  const parts = clean.split('/').filter(Boolean)
  if (parts.length === 0) return 'home'
  if (parts[0] === 'products' && parts[1]) return 'product-detail'
  if (parts[0] === 'products') return 'products'
  if (parts[0] === 'blog' && parts[1]) return 'blog-article'
  if (parts[0] === 'blog') return 'blog'
  if (parts[0] === 'about') return 'about'
  if (parts[0] === 'contact') return 'contact'
  if (parts[0] === 'cart') return 'cart'
  if (parts[0] === 'account') return 'account'
  if (parts[0] === 'wholesale') return 'wholesale'
  if (parts[0] === 'catalog') return 'catalog'
  if (parts[0] === 'farm-map') return 'farm-map'
  if (parts[0] === 'track') return 'track'
  if (parts[0] === 'customer-club') return 'customer-club'
  if (parts[0] === 'admin') return 'admin'
  return parts[0]
}

function getClientIP(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.ip || req.connection?.remoteAddress || '0.0.0.0'
}

describe('getSectionFromPath', () => {
  it('returns home for empty path', () => {
    expect(getSectionFromPath('')).toBe('home')
    expect(getSectionFromPath(null)).toBe('home')
    expect(getSectionFromPath(undefined)).toBe('home')
  })

  it('returns home for root path', () => {
    expect(getSectionFromPath('/')).toBe('home')
  })

  it('returns products for /products', () => {
    expect(getSectionFromPath('/products')).toBe('products')
  })

  it('returns product-detail for /products/123', () => {
    expect(getSectionFromPath('/products/123')).toBe('product-detail')
  })

  it('returns blog for /blog', () => {
    expect(getSectionFromPath('/blog')).toBe('blog')
  })

  it('returns blog-article for /blog/123', () => {
    expect(getSectionFromPath('/blog/123')).toBe('blog-article')
  })

  it('strips query strings', () => {
    expect(getSectionFromPath('/products?category=fruits')).toBe('products')
  })

  it('strips hash fragments', () => {
    expect(getSectionFromPath('/about#section1')).toBe('about')
  })

  it('handles trailing slashes', () => {
    expect(getSectionFromPath('/products/')).toBe('products')
  })

  it('returns correct section for each known path', () => {
    expect(getSectionFromPath('/about')).toBe('about')
    expect(getSectionFromPath('/contact')).toBe('contact')
    expect(getSectionFromPath('/cart')).toBe('cart')
    expect(getSectionFromPath('/account')).toBe('account')
    expect(getSectionFromPath('/wholesale')).toBe('wholesale')
    expect(getSectionFromPath('/catalog')).toBe('catalog')
    expect(getSectionFromPath('/farm-map')).toBe('farm-map')
    expect(getSectionFromPath('/track')).toBe('track')
    expect(getSectionFromPath('/customer-club')).toBe('customer-club')
    expect(getSectionFromPath('/admin')).toBe('admin')
  })

  it('returns first segment for unknown paths', () => {
    expect(getSectionFromPath('/unknown-page')).toBe('unknown-page')
  })
})

describe('getClientIP', () => {
  it('extracts first IP from x-forwarded-for', () => {
    const req = { headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }, ip: '9.9.9.9' }
    expect(getClientIP(req)).toBe('1.2.3.4')
  })

  it('returns ip when no forwarded header', () => {
    const req = { headers: {}, ip: '127.0.0.1' }
    expect(getClientIP(req)).toBe('127.0.0.1')
  })

  it('falls back to connection.remoteAddress', () => {
    const req = { headers: {}, ip: undefined, connection: { remoteAddress: '192.168.1.1' } }
    expect(getClientIP(req)).toBe('192.168.1.1')
  })

  it('returns 0.0.0.0 as last resort', () => {
    const req = { headers: {}, ip: undefined, connection: undefined }
    expect(getClientIP(req)).toBe('0.0.0.0')
  })
})
