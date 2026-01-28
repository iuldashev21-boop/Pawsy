import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CompactPremiumBanner from './CompactPremiumBanner'

// Mock useDog context
vi.mock('../../context/DogContext', () => ({
  useDog: () => ({
    activeDog: { id: '1', name: 'Buddy', breed: 'Labrador' },
    loading: false,
  }),
}))

describe('CompactPremiumBanner', () => {
  it('renders upgrade CTA button', () => {
    render(<CompactPremiumBanner />)
    expect(screen.getByRole('button', { name: /upgrade to premium/i })).toBeInTheDocument()
  })

  it('dispatches pawsy:openUpgrade on click', () => {
    const handler = vi.fn()
    window.addEventListener('pawsy:openUpgrade', handler)

    render(<CompactPremiumBanner />)
    fireEvent.click(screen.getByRole('button', { name: /upgrade to premium/i }))

    expect(handler).toHaveBeenCalledTimes(1)
    window.removeEventListener('pawsy:openUpgrade', handler)
  })

  it('shows dog name in message', () => {
    render(<CompactPremiumBanner />)
    expect(screen.getByText(/Buddy's full health journey/i)).toBeInTheDocument()
  })
})
