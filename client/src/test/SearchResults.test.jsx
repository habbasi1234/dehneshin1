import { describe, it, expect } from 'vitest'

function fullTextSearch(query, items) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const terms = q.split(/\s+/)
  return items.filter(item => {
    const searchText = [item.title, item.description, item.category, ...(item.tags || [])].join(' ').toLowerCase()
    return terms.some(term => searchText.includes(term))
  })
}

const typeLabel = (type) => {
  if (type === 'product') return 'محصول'
  if (type === 'article') return 'مقاله'
  return type
}

const typeColor = (type) => {
  if (type === 'product') return '#4CAF50'
  if (type === 'article') return '#388E3C'
  return '#888'
}

const searchableProducts = [
  { id: 1, type: 'product', url: '/products/1', title: 'سیب قرمز ارگانیک', description: 'سیب قرمز درختی', category: 'fruits', tags: ['سیب', 'میوه', 'ارگانیک'] },
  { id: 2, type: 'product', url: '/products/2', title: 'پرتقال ارگانیک', description: 'پرتقال تازه شمال', category: 'fruits', tags: ['پرتقال', 'ویتامین'] },
  { id: 3, type: 'article', url: '/articles/3', title: 'مزایای میوه ارگانیک', description: 'میوه‌های ارگانیک برای سلامتی مفیدند', category: 'health', tags: ['سلامت', 'ارگانیک', 'fruit'] },
  { id: 4, type: 'product', url: '/products/4', title: 'شیر محلی ارگانیک', description: 'شیر تازه گاو', category: 'dairy', tags: ['شیر', 'لبنیات'] },
]

describe('fullTextSearch', () => {
  it('returns empty array for empty query', () => {
    expect(fullTextSearch('', searchableProducts)).toEqual([])
  })

  it('returns empty array for whitespace-only query', () => {
    expect(fullTextSearch('   ', searchableProducts)).toEqual([])
  })

  it('finds item by title match', () => {
    const results = fullTextSearch('سیب', searchableProducts)
    expect(results.length).toBe(1)
    expect(results[0].id).toBe(1)
  })

  it('finds item by description match', () => {
    const results = fullTextSearch('تازه', searchableProducts)
    expect(results.some(r => r.title === 'پرتقال ارگانیک')).toBe(true)
  })

  it('finds item by tag match', () => {
    const results = fullTextSearch('ویتامین', searchableProducts)
    expect(results.length).toBe(1)
    expect(results[0].id).toBe(2)
  })

  it('finds item by category match', () => {
    const results = fullTextSearch('dairy', searchableProducts)
    expect(results.length).toBe(1)
    expect(results[0].id).toBe(4)
  })

  it('finds multiple items with single term', () => {
    const results = fullTextSearch('ارگانیک', searchableProducts)
    expect(results.length).toBeGreaterThanOrEqual(3)
  })

  it('supports multi-word queries (OR match)', () => {
    const results = fullTextSearch('سیب پرتقال', searchableProducts)
    expect(results.length).toBe(2)
    expect(results.map(r => r.id)).toContain(1)
    expect(results.map(r => r.id)).toContain(2)
  })

  it('is case insensitive', () => {
    const results = fullTextSearch('FRUIT', searchableProducts)
    expect(results.length).toBeGreaterThan(0)
  })

  it('returns no results for unmatched query', () => {
    const results = fullTextSearch('xyz123nonexistent', searchableProducts)
    expect(results.length).toBe(0)
  })

  it('matches partial terms', () => {
    const results = fullTextSearch('قرمز', searchableProducts)
    expect(results.length).toBe(1)
    expect(results[0].id).toBe(1)
  })

  it('handles items without tags gracefully', () => {
    const items = [{ id: 1, type: 'product', title: 'Test', description: 'desc', category: 'cat', tags: [] }]
    expect(fullTextSearch('test', items).length).toBe(1)
  })

  it('handles items with undefined tags', () => {
    const items = [{ id: 1, type: 'product', title: 'Test', description: 'desc', category: 'cat' }]
    expect(fullTextSearch('test', items).length).toBe(1)
  })

  it('trims whitespace from query', () => {
    const results = fullTextSearch('  سیب  ', searchableProducts)
    expect(results.length).toBe(1)
  })
})

describe('typeLabel', () => {
  it('returns correct label for product', () => {
    expect(typeLabel('product')).toBe('محصول')
  })

  it('returns correct label for article', () => {
    expect(typeLabel('article')).toBe('مقاله')
  })

  it('returns raw type for unknown', () => {
    expect(typeLabel('unknown')).toBe('unknown')
  })
})

describe('typeColor', () => {
  it('returns green for product', () => {
    expect(typeColor('product')).toBe('#4CAF50')
  })

  it('returns darker green for article', () => {
    expect(typeColor('article')).toBe('#388E3C')
  })

  it('returns gray for unknown type', () => {
    expect(typeColor('other')).toBe('#888')
  })
})

describe('searchableProducts structure', () => {
  it('each item has required fields', () => {
    searchableProducts.forEach(item => {
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('type')
      expect(item).toHaveProperty('url')
      expect(item).toHaveProperty('title')
      expect(item).toHaveProperty('description')
      expect(item).toHaveProperty('category')
      expect(item).toHaveProperty('tags')
      expect(Array.isArray(item.tags)).toBe(true)
    })
  })

  it('contains both product and article types', () => {
    const types = new Set(searchableProducts.map(p => p.type))
    expect(types.has('product')).toBe(true)
    expect(types.has('article')).toBe(true)
  })
})
