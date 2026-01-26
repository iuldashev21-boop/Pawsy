import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('framer-motion', async () => {
  return await import('../../test/mocks/framer-motion.jsx')
})

import UsageLimitModal from './UsageLimitModal'

function renderModal(props = {}) {
  const defaultProps = {
    type: 'chat',
    isOpen: true,
    onClose: vi.fn(),
    onEmergency: vi.fn(),
    onUpgrade: vi.fn(),
    emergencyRemaining: 2,
    ...props,
  }

  return {
    ...render(
      <MemoryRouter>
        <UsageLimitModal {...defaultProps} />
      </MemoryRouter>
    ),
    props: defaultProps,
  }
}

describe('UsageLimitModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when closed', () => {
    renderModal({ isOpen: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows correct limits for chat type', () => {
    renderModal({ type: 'chat' })
    expect(screen.getByText(/free chats/)).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('shows correct limits for photo type', () => {
    renderModal({ type: 'photo' })
    expect(screen.getByText(/free photo scans/)).toBeInTheDocument()
  })

  it('has dialog semantics (role, aria-modal)', () => {
    renderModal()
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'usage-limit-modal-title')
  })

  it('shows emergency button when remaining > 0', () => {
    renderModal({ emergencyRemaining: 2 })
    expect(screen.getByText(/Emergency Chat/)).toBeInTheDocument()
    expect(screen.getByText(/2 remaining/)).toBeInTheDocument()
  })

  it('hides emergency button when remaining is 0', () => {
    renderModal({ emergencyRemaining: 0 })
    expect(screen.queryByText(/Emergency Chat/)).not.toBeInTheDocument()
    expect(screen.getByText(/No emergency chats remaining/)).toBeInTheDocument()
  })

  it('calls onEmergency when emergency button clicked', () => {
    const { props } = renderModal({ emergencyRemaining: 1 })
    fireEvent.click(screen.getByText(/Emergency Chat/))
    expect(props.onEmergency).toHaveBeenCalledTimes(1)
  })

  it('calls onUpgrade when upgrade button clicked', () => {
    const { props } = renderModal()
    fireEvent.click(screen.getByText(/Get Personalized Care/))
    expect(props.onUpgrade).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when close button clicked', () => {
    const { props } = renderModal()
    fireEvent.click(screen.getByLabelText('Close'))
    expect(props.onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose on ESC key', () => {
    const { props } = renderModal()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(props.onClose).toHaveBeenCalledTimes(1)
  })

  it('includes emergency vet link', () => {
    renderModal()
    expect(screen.getByText(/Find Emergency Vet Near Me/)).toBeInTheDocument()
  })
})
