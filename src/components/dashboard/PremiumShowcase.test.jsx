import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders, seedFullAppState } from '../../test/test-utils'
import PremiumShowcase from './PremiumShowcase'

vi.mock('framer-motion', async () => {
  return await import('../../test/mocks/framer-motion.jsx')
})

describe('PremiumShowcase', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders 3 feature preview cards', () => {
    seedFullAppState()
    renderWithProviders(<PremiumShowcase />)

    // Both mobile + desktop versions render in JSDOM, so expect 2 of each
    expect(screen.getAllByText('Chat History')).toHaveLength(2)
    expect(screen.getAllByText('Care Schedule')).toHaveLength(2)
    expect(screen.getAllByText('Health Alerts')).toHaveLength(2)
  })

  it('shows single CTA button with correct text', () => {
    seedFullAppState()
    renderWithProviders(<PremiumShowcase />)

    const buttons = screen.getAllByRole('button', { name: /Upgrade to Premium/i })
    expect(buttons.length).toBe(2) // mobile + desktop
    expect(buttons[0]).toBeInTheDocument()
  })

  it('dispatches pawsy:openUpgrade on click', () => {
    seedFullAppState()
    renderWithProviders(<PremiumShowcase />)

    const handler = vi.fn()
    window.addEventListener('pawsy:openUpgrade', handler)

    const buttons = screen.getAllByRole('button', { name: /Upgrade to Premium/i })
    fireEvent.click(buttons[0])

    expect(handler).toHaveBeenCalledTimes(1)
    window.removeEventListener('pawsy:openUpgrade', handler)
  })

  it('shows feature descriptions', () => {
    seedFullAppState()
    renderWithProviders(<PremiumShowcase />)

    expect(screen.getAllByText('Saved & searchable sessions')).toHaveLength(2)
    expect(screen.getAllByText('Medication & vaccine tracking')).toHaveLength(2)
    expect(screen.getAllByText('AI-powered health monitoring')).toHaveLength(2)
  })

  it('shows the subtitle text', () => {
    seedFullAppState()
    renderWithProviders(<PremiumShowcase />)

    expect(screen.getAllByText('Unlock saved chats, care reminders, and health alerts')).toHaveLength(2)
  })
})
