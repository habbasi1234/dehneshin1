import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

function debounce(fn, ms) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

describe('debounce utility', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('calls function after delay', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced()
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledOnce()
  })

  it('cancels previous call on rapid invocation', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced()
    debounced()
    debounced()
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledOnce()
  })

  it('passes arguments correctly', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 50)
    debounced('arg1', 'arg2')
    vi.advanceTimersByTime(50)
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
  })
})
