import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('framer-motion', async () => {
  return await import('../../test/mocks/framer-motion.jsx')
})

import BottomNav from './BottomNav'

function renderNav(route = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <BottomNav />
    </MemoryRouter>
  )
}

describe('BottomNav', () => {
  it('renders all 4 nav items', () => {
    renderNav()

    expect(screen.getByLabelText('Home')).toBeInTheDocument()
    expect(screen.getByLabelText('Chat')).toBeInTheDocument()
    expect(screen.getByLabelText('Photo')).toBeInTheDocument()
    expect(screen.getByLabelText('Settings')).toBeInTheDocument()
  })

  it('renders navigation element', () => {
    renderNav()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('links to correct paths', () => {
    renderNav()

    expect(screen.getByLabelText('Home').closest('a')).toHaveAttribute('href', '/dashboard')
    expect(screen.getByLabelText('Chat').closest('a')).toHaveAttribute('href', '/chat')
    expect(screen.getByLabelText('Photo').closest('a')).toHaveAttribute('href', '/photo')
    expect(screen.getByLabelText('Settings').closest('a')).toHaveAttribute('href', '/settings')
  })

  it('shows labels for each item', () => {
    renderNav()

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Chat')).toBeInTheDocument()
    expect(screen.getByText('Photo')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })
})
