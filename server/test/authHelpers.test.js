import { describe, it, expect } from 'vitest'
import { randomBytes } from 'crypto'

function normalizeMobile(m) {
  let s = String(m).replace(/[\s\-]/g, '').replace(/^(\+|00)?98/, '')
  if (s.startsWith('0')) s = s.slice(1)
  return s
}

function generateOtp(length) {
  const min = Math.pow(10, length - 1)
  const max = Math.pow(10, length) - 1
  return String(Math.floor(min + Math.random() * (max - min + 1)))
}

function checkPasswordComplexity(password) {
  const errors = []
  if (password.length < 8) errors.push('حداقل ۸ کاراکتر')
  if (!/[A-Z]/.test(password)) errors.push('حداقل یک حرف بزرگ لاتین')
  if (!/[a-z]/.test(password)) errors.push('حداقل یک حرف کوچک لاتین')
  if (!/[0-9]/.test(password)) errors.push('حداقل یک عدد')
  if (!/[!@#$%^&*(),.?":{}|<>\-_]/.test(password)) errors.push('حداقل یک کاراکتر خاص')
  return errors
}

function generateToken() {
  return randomBytes(32).toString('hex') + '-' + Date.now()
}

describe('normalizeMobile', () => {
  it('removes leading zero', () => {
    expect(normalizeMobile('09121234567')).toBe('9121234567')
  })

  it('removes +98 prefix', () => {
    expect(normalizeMobile('+989121234567')).toBe('9121234567')
  })

  it('removes 0098 prefix', () => {
    expect(normalizeMobile('00989121234567')).toBe('9121234567')
  })

  it('removes spaces and dashes', () => {
    expect(normalizeMobile('0912-123-4567')).toBe('9121234567')
    expect(normalizeMobile('0912 123 4567')).toBe('9121234567')
  })

  it('handles already clean number', () => {
    expect(normalizeMobile('9121234567')).toBe('9121234567')
  })
})

describe('checkPasswordComplexity', () => {
  it('returns empty array for strong password', () => {
    expect(checkPasswordComplexity('Abcdef1!')).toEqual([])
  })

  it('rejects short password', () => {
    const errors = checkPasswordComplexity('Ab1!')
    expect(errors).toContain('حداقل ۸ کاراکتر')
  })

  it('rejects password without uppercase', () => {
    const errors = checkPasswordComplexity('abcdef1!')
    expect(errors).toContain('حداقل یک حرف بزرگ لاتین')
  })

  it('rejects password without lowercase', () => {
    const errors = checkPasswordComplexity('ABCDEF1!')
    expect(errors).toContain('حداقل یک حرف کوچک لاتین')
  })

  it('rejects password without digit', () => {
    const errors = checkPasswordComplexity('Abcdefg!')
    expect(errors).toContain('حداقل یک عدد')
  })

  it('rejects password without special char', () => {
    const errors = checkPasswordComplexity('Abcdefg1')
    expect(errors).toContain('حداقل یک کاراکتر خاص')
  })

  it('returns multiple errors for weak password', () => {
    const errors = checkPasswordComplexity('abc')
    expect(errors.length).toBeGreaterThanOrEqual(3)
  })
})

describe('generateOtp', () => {
  it('generates OTP of correct length', () => {
    expect(generateOtp(4).length).toBe(4)
    expect(generateOtp(5).length).toBe(5)
    expect(generateOtp(6).length).toBe(6)
  })

  it('generates numeric only string', () => {
    const otp = generateOtp(5)
    expect(/^\d{5}$/.test(otp)).toBe(true)
  })

  it('generates values in range', () => {
    const otp = parseInt(generateOtp(4))
    expect(otp).toBeGreaterThanOrEqual(1000)
    expect(otp).toBeLessThanOrEqual(9999)
  })
})

describe('generateToken', () => {
  it('generates hex + timestamp format', () => {
    const token = generateToken()
    const parts = token.split('-')
    expect(parts.length).toBeGreaterThanOrEqual(2)
    const ts = parseInt(parts[parts.length - 1])
    expect(ts).toBeGreaterThan(0)
  })

  it('generates unique tokens', () => {
    const t1 = generateToken()
    const t2 = generateToken()
    expect(t1).not.toBe(t2)
  })
})
