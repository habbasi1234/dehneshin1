import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'

const { mockAxios } = vi.hoisted(() => {
  const mockAxios = {
    get: vi.fn(),
    post: vi.fn(),
  }
  return { mockAxios }
})

vi.mock('axios', () => ({
  default: mockAxios
}))

import { UserAuthProvider, useUserAuth } from '../context/UserAuthContext'

function TestConsumer() {
  const { user, loading, login, register, logout } = useUserAuth()
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.name : 'null'}</span>
      <button data-testid="login" onClick={() => login('admin', 'pass')}>login</button>
      <button data-testid="register" onClick={() => register({ name: 'Test', phone: '0912' })}>register</button>
      <button data-testid="logout" onClick={logout}>logout</button>
    </div>
  )
}

describe('UserAuthProvider', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    try { localStorage.removeItem('userToken') } catch {}
  })

  it('renders children', () => {
    render(
      <UserAuthProvider>
        <div>child</div>
      </UserAuthProvider>
    )
    expect(screen.getByText('child')).toBeDefined()
  })

  it('shows loading false after mount with no token', async () => {
    render(
      <UserAuthProvider>
        <TestConsumer />
      </UserAuthProvider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
  })

  it('fetches profile when token exists in localStorage', async () => {
    try { localStorage.setItem('userToken', 'test-token') } catch {}
    mockAxios.get.mockResolvedValueOnce({ data: { name: 'Admin' } })

    render(
      <UserAuthProvider>
        <TestConsumer />
      </UserAuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })

    expect(mockAxios.get).toHaveBeenCalledWith('/api/auth/profile', {
      headers: { Authorization: 'Bearer test-token' }
    })
    expect(screen.getByTestId('user').textContent).toBe('Admin')
  })

  it('removes token on profile fetch failure', async () => {
    try { localStorage.setItem('userToken', 'bad-token') } catch {}
    mockAxios.get.mockRejectedValueOnce(new Error('unauthorized'))

    render(
      <UserAuthProvider>
        <TestConsumer />
      </UserAuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })

    expect(screen.getByTestId('user').textContent).toBe('null')
  })

  it('sets loading false when no token', async () => {
    render(
      <UserAuthProvider>
        <TestConsumer />
      </UserAuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
  })

  it('login stores token and sets user', async () => {
    mockAxios.get.mockRejectedValueOnce(new Error('no token'))
    mockAxios.post.mockResolvedValueOnce({ data: { token: 'new-token', user: { name: 'Admin' } } })

    render(
      <UserAuthProvider>
        <TestConsumer />
      </UserAuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })

    await screen.getByTestId('login').click()

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('Admin')
    })

    expect(mockAxios.post).toHaveBeenCalledWith('/api/auth/login', { username: 'admin', password: 'pass' })
  })

  it('register calls API and returns data', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: null })
    mockAxios.post.mockResolvedValueOnce({ data: { success: true } })

    render(
      <UserAuthProvider>
        <TestConsumer />
      </UserAuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })

    await screen.getByTestId('register').click()

    expect(mockAxios.post).toHaveBeenCalledWith('/api/auth/register', { name: 'Test', phone: '0912' })
  })

  it('logout clears token and user', async () => {
    try { localStorage.setItem('userToken', 'some-token') } catch {}
    mockAxios.get.mockResolvedValueOnce({ data: { name: 'Admin' } })

    render(
      <UserAuthProvider>
        <TestConsumer />
      </UserAuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('Admin')
    })

    screen.getByTestId('logout').click()

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('null')
    })
  })
})

describe('useUserAuth outside provider', () => {
  it('throws error', () => {
    function Bad() {
      useUserAuth()
      return null
    }
    expect(() => render(<Bad />)).toThrow('useUserAuth must be used within UserAuthProvider')
  })
})
