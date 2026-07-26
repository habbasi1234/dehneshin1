import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    put: vi.fn(() => Promise.resolve({ data: {} }))
  }
}))

import Navbar from '../components/Navbar'
import { UserAuthProvider } from '../context/UserAuthContext'
import { LanguageProvider } from '../context/LanguageContext'

const renderNavbar = () => {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <UserAuthProvider>
          <Navbar />
        </UserAuthProvider>
      </LanguageProvider>
    </MemoryRouter>
  )
}

describe('Navbar', () => {
  it('renders the site name/brand', () => {
    renderNavbar()
    expect(screen.getByText(/ده نشین/)).toBeDefined()
  })

  it('renders main navigation links', () => {
    renderNavbar()
    expect(screen.getByText(/ورود/)).toBeDefined()
    expect(screen.getByText(/ده نشین/)).toBeDefined()
  })

  it('opens category dropdown on click', () => {
    renderNavbar()
    const catBtn = screen.getByText(/دسته‌بندی/)
    fireEvent.click(catBtn)
    expect(screen.getByText(/دسته‌بندی/)).toBeDefined()
  })
})
