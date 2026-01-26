import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, act } from '@testing-library/react'
import { renderWithProviders, seedAuthState } from '../test/test-utils'
import { useToast } from './ToastContext'

vi.mock('framer-motion', async () => {
  return await import('../test/mocks/framer-motion.jsx')
})

function ToastConsumer() {
  const { showToast } = useToast()
  return (
    <div>
      <button onClick={() => showToast('Test message')}>Show Toast</button>
      <button onClick={() => showToast('Premium message', 'premium')}>Show Premium</button>
    </div>
  )
}

describe('ToastContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('showToast displays toast message', () => {
    seedAuthState()
    renderWithProviders(<ToastConsumer />)

    act(() => {
      screen.getByText('Show Toast').click()
    })

    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('toast auto-dismisses after 3500ms', () => {
    seedAuthState()
    renderWithProviders(<ToastConsumer />)

    act(() => {
      screen.getByText('Show Toast').click()
    })

    expect(screen.getByText('Test message')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(3600)
    })

    expect(screen.queryByText('Test message')).not.toBeInTheDocument()
  })

  it('dismiss button hides toast immediately', () => {
    seedAuthState()
    renderWithProviders(<ToastConsumer />)

    act(() => {
      screen.getByText('Show Toast').click()
    })

    expect(screen.getByText('Test message')).toBeInTheDocument()

    // Use native click (not userEvent) since we're in fake timer mode
    act(() => {
      screen.getByLabelText('Dismiss').click()
    })

    expect(screen.queryByText('Test message')).not.toBeInTheDocument()
  })

  it('shows premium toast type', () => {
    seedAuthState()
    renderWithProviders(<ToastConsumer />)

    act(() => {
      screen.getByText('Show Premium').click()
    })

    expect(screen.getByText('Premium message')).toBeInTheDocument()
  })
})
