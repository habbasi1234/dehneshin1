import { describe, it, expect } from 'vitest'
import { validateToken, ADMIN_ROLES } from '../middleware/auth.js'

describe('validateToken', () => {
  it('returns null for empty token', () => {
    expect(validateToken(null)).toBeNull()
    expect(validateToken(undefined)).toBeNull()
    expect(validateToken('')).toBeNull()
  })

  it('returns null for token without dash separator', () => {
    expect(validateToken('invalidtoken')).toBeNull()
  })

  it('returns null for expired token (timestamp older than 24h)', () => {
    const oldTs = Date.now() - 86400001
    expect(validateToken(`az-token-1-${oldTs}`)).toBeNull()
  })

  it('returns null for token with invalid prefix', () => {
    const ts = Date.now()
    expect(validateToken(`xx-token-1-${ts}`)).toBeNull()
  })

  it('returns null for token with zero userId', () => {
    const ts = Date.now()
    expect(validateToken(`az-token-0-${ts}`)).toBeNull()
  })

  it('returns null for token with negative userId', () => {
    const ts = Date.now()
    expect(validateToken(`az-token--1-${ts}`)).toBeNull()
  })

  it('returns userId string for valid token', () => {
    const ts = Date.now()
    expect(validateToken(`az-token-42-${ts}`)).toBe('42')
  })

  it('returns null for token missing timestamp part', () => {
    expect(validateToken('az-token-1')).toBeNull()
  })

  it('returns null for non-numeric timestamp', () => {
    expect(validateToken('az-token-1-abc')).toBeNull()
  })

  it('accepts token exactly at 24h boundary (within window)', () => {
    const ts = Date.now() - 86399000 // just under 24h
    expect(validateToken(`az-token-5-${ts}`)).toBe('5')
  })
})

describe('ADMIN_ROLES', () => {
  it('contains expected roles', () => {
    expect(ADMIN_ROLES).toContain('superadmin')
    expect(ADMIN_ROLES).toContain('admin')
    expect(ADMIN_ROLES).toContain('manager')
    expect(ADMIN_ROLES).toContain('support')
    expect(ADMIN_ROLES).toContain('editor')
  })

  it('has exactly 5 roles', () => {
    expect(ADMIN_ROLES.length).toBe(5)
  })
})
