import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, screen, act } from '@testing-library/react'

import { ToastProvider, useToast } from '../components/admin/Toast'

function ToastTrigger() {
  const addToast = useToast()
  return (
    <div>
      <button data-testid="add-success" onClick={() => addToast('Success msg', 'success')}>success</button>
      <button data-testid="add-error" onClick={() => addToast('Error msg', 'error')}>error</button>
      <button data-testid="add-default" onClick={() => addToast('Default msg')}>default</button>
    </div>
  )
}

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders children', () => {
    render(
      <ToastProvider>
        <div>child</div>
      </ToastProvider>
    )
    expect(screen.getByText('child')).toBeDefined()
  })

  it('shows toast when addToast is called', () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    )

    act(() => {
      screen.getByTestId('add-success').click()
    })

    expect(screen.getByText('Success msg')).toBeDefined()
  })

  it('shows success toast with green border', () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    )

    act(() => {
      screen.getByTestId('add-success').click()
    })

    const toast = screen.getByText('Success msg')
    expect(toast.style.border).toContain('#4CAF50')
  })

  it('shows error toast with red border', () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    )

    act(() => {
      screen.getByTestId('add-error').click()
    })

    const toast = screen.getByText('Error msg')
    expect(toast.style.border).toContain('#ff4444')
  })

  it('shows default toast with blue border', () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    )

    act(() => {
      screen.getByTestId('add-default').click()
    })

    const toast = screen.getByText('Default msg')
    expect(toast.style.border).toContain('#4488ff')
  })

  it('auto-dismisses toast after 3500ms', () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    )

    act(() => {
      screen.getByTestId('add-success').click()
    })

    expect(screen.getByText('Success msg')).toBeDefined()

    act(() => {
      vi.advanceTimersByTime(3500)
    })

    expect(screen.queryByText('Success msg')).toBeNull()
  })

  it('dismisses toast on click', () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    )

    act(() => {
      screen.getByTestId('add-success').click()
    })

    act(() => {
      screen.getByText('Success msg').click()
    })

    expect(screen.queryByText('Success msg')).toBeNull()
  })

  it('shows multiple toasts', () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    )

    act(() => {
      screen.getByTestId('add-success').click()
    })

    act(() => {
      screen.getByTestId('add-error').click()
    })

    expect(screen.getByText('Success msg')).toBeDefined()
    expect(screen.getByText('Error msg')).toBeDefined()
  })
})

describe('useToast outside provider', () => {
  it('returns undefined when outside provider', () => {
    let toastFn
    function Collector() {
      toastFn = useToast()
      return null
    }
    render(<Collector />)
    expect(toastFn).toBeUndefined()
  })
})
