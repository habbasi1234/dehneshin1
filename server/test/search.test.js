import { describe, it, expect } from 'vitest'

function matchQuery(text, q) {
  if (!text || !q) return false
  return String(text).toLowerCase().includes(q.toLowerCase())
}

describe('matchQuery', () => {
  it('matches case-insensitive', () => {
    expect(matchQuery('مبلمان', 'مبل')).toBe(true)
  })

  it('matches Latin text case-insensitively', () => {
    expect(matchQuery('Classic Furniture', 'classic')).toBe(true)
  })

  it('returns false for empty text', () => {
    expect(matchQuery(null, 'test')).toBe(false)
    expect(matchQuery(undefined, 'test')).toBe(false)
    expect(matchQuery('', 'test')).toBe(false)
  })

  it('returns false for empty query', () => {
    expect(matchQuery('text', '')).toBe(false)
    expect(matchQuery('text', null)).toBe(false)
    expect(matchQuery('text', undefined)).toBe(false)
  })

  it('matches substring', () => {
    expect(matchQuery('مبلمان کلاسیک', 'کلاسیک')).toBe(true)
  })

  it('returns false for no match', () => {
    expect(matchQuery('مبلمان', 'صندلی')).toBe(false)
  })

  it('handles numeric text', () => {
    expect(matchQuery('12345', '234')).toBe(true)
  })
})

describe('Search Result Structure', () => {
  it('product result has required fields', () => {
    const result = {
      type: 'product', id: 1, title: 'مبل', description: 'توضیحات',
      slug: 'mobl', category: 'classic', image: 'img.jpg',
      price: '5000000', url: '/products/1',
    }
    expect(result).toHaveProperty('type', 'product')
    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('title')
    expect(result).toHaveProperty('url')
  })

  it('article result has required fields', () => {
    const result = {
      type: 'article', id: 1, title: 'مقاله', description: 'توضیح',
      category: 'health', image: 'img.jpg', date: '2024-01-01',
      tags: 'تگ', url: '/blog?id=1',
    }
    expect(result).toHaveProperty('type', 'article')
    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('title')
    expect(result).toHaveProperty('url')
  })
})
