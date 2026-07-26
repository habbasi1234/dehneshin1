import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ConfirmModal from '../components/admin/ConfirmModal'

describe('ConfirmModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'تأیید حذف',
    message: 'آیا اطمینان دارید؟',
    confirmText: 'حذف',
    cancelText: 'انصراف',
  }

  beforeEach(() => { vi.clearAllMocks() })

  it('renders when open', () => {
    render(<ConfirmModal {...defaultProps} />)
    expect(screen.getByText('تأیید حذف')).toBeDefined()
    expect(screen.getByText('آیا اطمینان دارید؟')).toBeDefined()
  })

  it('does not render when closed', () => {
    render(<ConfirmModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('تأیید حذف')).toBeNull()
  })

  it('calls onClose when cancel clicked', () => {
    const onClose = vi.fn()
    render(<ConfirmModal {...defaultProps} onClose={onClose} />)
    fireEvent.click(screen.getByText('انصراف'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onConfirm when confirm clicked', () => {
    const onConfirm = vi.fn()
    render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />)
    fireEvent.click(screen.getByText('حذف'))
    expect(onConfirm).toHaveBeenCalled()
  })

  it('calls both onConfirm and onClose when confirm clicked', () => {
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    render(<ConfirmModal {...defaultProps} onClose={onClose} onConfirm={onConfirm} />)
    fireEvent.click(screen.getByText('حذف'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows danger styling when danger prop is true', () => {
    const { container } = render(<ConfirmModal {...defaultProps} danger />)
    const modalDiv = container.querySelector('[style*="border"]')
    expect(modalDiv).toBeDefined()
  })

  it('renders custom confirm and cancel text', () => {
    render(<ConfirmModal {...defaultProps} confirmText="بله" cancelText="خیر" />)
    expect(screen.getByText('بله')).toBeDefined()
    expect(screen.getByText('خیر')).toBeDefined()
  })

  it('does not call onConfirm on cancel', () => {
    const onConfirm = vi.fn()
    render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />)
    fireEvent.click(screen.getByText('انصراف'))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('renders danger icon when danger is true', () => {
    render(<ConfirmModal {...defaultProps} danger />)
    expect(screen.getByText('⚠️')).toBeDefined()
  })

  it('renders info icon by default', () => {
    render(<ConfirmModal {...defaultProps} />)
    expect(screen.getByText('💡')).toBeDefined()
  })

  it('closes on backdrop click', () => {
    const onClose = vi.fn()
    const { container } = render(<ConfirmModal {...defaultProps} onClose={onClose} />)
    const backdrop = container.querySelector('[style*="position: fixed"]')
    fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalled()
  })

  it('does not close on modal body click', () => {
    const onClose = vi.fn()
    render(<ConfirmModal {...defaultProps} onClose={onClose} />)
    fireEvent.click(screen.getByText('آیا اطمینان دارید؟'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('shows default confirm text', () => {
    render(<ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} title="تست" message="پیام" />)
    expect(screen.getByText('تأیید')).toBeDefined()
  })

  it('shows default cancel text', () => {
    render(<ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} title="تست" message="پیام" />)
    expect(screen.getByText('انصراف')).toBeDefined()
  })
})
