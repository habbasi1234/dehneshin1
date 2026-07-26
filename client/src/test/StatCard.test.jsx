import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => {
      const filteredProps = {}
      Object.keys(props).forEach(k => {
        if (!['whileHover', 'whileTap', 'initial', 'animate', 'exit', 'transition', 'variants', 'viewport'].includes(k)) {
          filteredProps[k] = props[k]
        }
      })
      return <div {...filteredProps}>{children}</div>
    },
  },
}))

import StatCard from '../components/admin/StatCard'

describe('StatCard', () => {
  it('renders value and label', () => {
    render(<StatCard icon="📦" value={150} label="Orders" />)
    expect(screen.getByText('150')).toBeDefined()
    expect(screen.getByText('Orders')).toBeDefined()
  })

  it('renders icon', () => {
    render(<StatCard icon="🛒" value={0} label="Cart" />)
    expect(screen.getByText('🛒')).toBeDefined()
  })

  it('shows trend up with green color', () => {
    render(<StatCard icon="📈" value={100} label="Revenue" trend={{ up: true, value: 12 }} />)
    expect(screen.getByText('↑')).toBeDefined()
    expect(screen.getByText('12%')).toBeDefined()
    expect(screen.getByText('↑').style.color).toContain('rgb(76, 175, 80)')
  })

  it('shows trend down with red color', () => {
    render(<StatCard icon="📉" value={50} label="Bounce" trend={{ up: false, value: 5 }} />)
    expect(screen.getByText('↓')).toBeDefined()
    expect(screen.getByText('5%')).toBeDefined()
    expect(screen.getByText('↓').style.color).toContain('rgb(255, 107, 107)')
  })

  it('does not show trend when not provided', () => {
    render(<StatCard icon="📊" value={0} label="Metric" />)
    expect(screen.queryByText('↑')).toBeNull()
    expect(screen.queryByText('↓')).toBeNull()
  })

  it('calls onClick when provided', () => {
    const onClick = vi.fn()
    render(<StatCard icon="👆" value={1} label="Clickable" onClick={onClick} />)
    screen.getByText('1').closest('div').parentElement.parentElement.click()
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('applies custom color', () => {
    render(<StatCard icon="🎨" value={42} label="Color" color="#FF5722" />)
    expect(screen.getByText('42')).toBeDefined()
  })
})
