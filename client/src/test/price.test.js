import { describe, it, expect } from 'vitest'
import { normalizeDigits, parsePrice } from '../utils/price'

describe('normalizeDigits', () => {
  it('converts Persian digits to English', () => {
    expect(normalizeDigits('۱۲۳۴۵۶۷۸۹۰')).toBe('1234567890')
  })

  it('converts Arabic digits to English', () => {
    expect(normalizeDigits('١٢٣٤٥٦٧٨٩٠')).toBe('1234567890')
  })

  it('returns empty string for falsy input', () => {
    expect(normalizeDigits('')).toBe('')
    expect(normalizeDigits(null)).toBe('')
    expect(normalizeDigits(undefined)).toBe('')
  })

  it('handles mixed digits', () => {
    expect(normalizeDigits('۱a۲')).toBe('1a2')
  })

  it('returns string unchanged if no Persian/Arabic digits', () => {
    expect(normalizeDigits('hello123')).toBe('hello123')
  })

  it('handles numeric input by converting to string', () => {
    expect(normalizeDigits(123)).toBe('123')
  })
})

describe('parsePrice', () => {
  it('parses numeric input', () => {
    expect(parsePrice(5000000)).toBe(5000000)
  })

  it('parses string with commas', () => {
    expect(parsePrice('5,000,000')).toBe(5000000)
  })

  it('parses Persian digits with commas', () => {
    expect(parsePrice('۵,۰۰۰,۰۰۰')).toBe(5000000)
  })

  it('returns 0 for null/undefined', () => {
    expect(parsePrice(null)).toBe(0)
    expect(parsePrice(undefined)).toBe(0)
  })

  it('returns 0 for non-numeric string', () => {
    expect(parsePrice('abc')).toBe(0)
  })

  it('returns 0 for zero', () => {
    expect(parsePrice(0)).toBe(0)
  })

  it('returns 0 for negative', () => {
    expect(parsePrice(-100)).toBe(0)
  })

  it('handles empty string', () => {
    expect(parsePrice('')).toBe(0)
  })
})
