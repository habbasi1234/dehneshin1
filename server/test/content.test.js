import { describe, it, expect } from 'vitest'

const COLLECTIONS = ['testimonials', 'blog', 'customers']

function isValidCollection(type) {
  return COLLECTIONS.includes(type)
}

function generateCustomerCode(existingCodes) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  for (let attempt = 0; attempt < 100; attempt++) {
    let code = 'AZ'
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
    if (!existingCodes.includes(code)) return code
  }
  return 'AZ' + Date.now().toString(36).toUpperCase()
}

describe('Collection Validation', () => {
  it('accepts valid collection types', () => {
    expect(isValidCollection('testimonials')).toBe(true)
    expect(isValidCollection('blog')).toBe(true)
    expect(isValidCollection('customers')).toBe(true)
  })

  it('rejects invalid collection types', () => {
    expect(isValidCollection('users')).toBe(false)
    expect(isValidCollection('admin')).toBe(false)
    expect(isValidCollection('')).toBe(false)
    expect(isValidCollection('DROP TABLE')).toBe(false)
  })
})

describe('generateCustomerCode', () => {
  it('generates code starting with AZ', () => {
    const code = generateCustomerCode([])
    expect(code.startsWith('AZ')).toBe(true)
  })

  it('generates 10 character code', () => {
    const code = generateCustomerCode([])
    expect(code.length).toBe(10)
  })

  it('avoids existing codes', () => {
    const existing = Array.from({ length: 50 }, () => generateCustomerCode([]))
    const newCode = generateCustomerCode(existing)
    expect(existing).not.toContain(newCode)
  })

  it('generates unique codes', () => {
    const codes = new Set()
    for (let i = 0; i < 20; i++) {
      codes.add(generateCustomerCode([...codes]))
    }
    expect(codes.size).toBe(20)
  })
})

describe('Content Types', () => {
  it('each collection type has a string type', () => {
    COLLECTIONS.forEach(type => {
      expect(typeof type).toBe('string')
      expect(type.length).toBeGreaterThan(0)
    })
  })
})
