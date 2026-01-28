import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import QuickActionsStrip from './QuickActionsStrip'

function renderStrip() {
  return render(
    <MemoryRouter>
      <QuickActionsStrip />
    </MemoryRouter>
  )
}

describe('QuickActionsStrip', () => {
  it('renders all 4 action items', () => {
    renderStrip()
    expect(screen.getByText('Scan Photo')).toBeInTheDocument()
    expect(screen.getByText('Emergency')).toBeInTheDocument()
    expect(screen.getByText('First Aid')).toBeInTheDocument()
    expect(screen.getByText('Toxic Check')).toBeInTheDocument()
  })

  it('"Scan Photo" links to /photo', () => {
    renderStrip()
    const link = screen.getByLabelText('Scan Photo')
    expect(link).toHaveAttribute('href', '/photo')
  })

  it('"Emergency" links to /emergency-vet', () => {
    renderStrip()
    const link = screen.getByLabelText('Emergency')
    expect(link).toHaveAttribute('href', '/emergency-vet')
  })

  it('"First Aid" links to /emergency-guides', () => {
    renderStrip()
    const link = screen.getByLabelText('First Aid')
    expect(link).toHaveAttribute('href', '/emergency-guides')
  })

  it('"Toxic Check" links to /toxic-checker', () => {
    renderStrip()
    const link = screen.getByLabelText('Toxic Check')
    expect(link).toHaveAttribute('href', '/toxic-checker')
  })
})
