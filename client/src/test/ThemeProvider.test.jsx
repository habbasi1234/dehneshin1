import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'

vi.mock('axios', () => ({
  default: { get: vi.fn(() => Promise.resolve({ data: {} })), put: vi.fn(() => Promise.resolve({ data: {} })) }
}))

import { ThemeProvider } from '../components/ThemeProvider'

describe('ThemeProvider', () => {
  it('renders children', () => {
    render(
      <ThemeProvider>
        <div>Test Child</div>
      </ThemeProvider>
    )
    expect(screen.getByText('Test Child')).toBeDefined()
  })

  it('renders multiple children', () => {
    render(
      <ThemeProvider>
        <div>Child 1</div>
        <div>Child 2</div>
      </ThemeProvider>
    )
    expect(screen.getByText('Child 1')).toBeDefined()
    expect(screen.getByText('Child 2')).toBeDefined()
  })

  it('does not crash with empty children', () => {
    render(<ThemeProvider></ThemeProvider>)
  })
})
