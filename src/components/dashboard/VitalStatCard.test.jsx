import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Scale } from 'lucide-react'
import VitalStatCard from './VitalStatCard'

const defaultProps = {
  icon: Scale,
  iconColor: '#7C3AED',
  iconBg: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(107,33,168,0.1) 100%)',
  label: 'WEIGHT',
  value: '78',
  unit: 'lbs',
  status: { label: 'Stable', color: 'green' },
}

function renderCard(overrides = {}) {
  return render(<VitalStatCard {...defaultProps} {...overrides} />)
}

describe('VitalStatCard', () => {
  it('renders label, value, unit, and status badge', () => {
    renderCard()
    expect(screen.getByText('WEIGHT')).toBeInTheDocument()
    expect(screen.getByText('78')).toBeInTheDocument()
    expect(screen.getByText('lbs')).toBeInTheDocument()
    expect(screen.getByText('Stable')).toBeInTheDocument()
  })

  it('renders value without unit when unit is not provided', () => {
    renderCard({ unit: undefined, value: '0' })
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.queryByText('lbs')).not.toBeInTheDocument()
  })

  it('applies green status color class', () => {
    renderCard({ status: { label: 'All Clear', color: 'green' } })
    const badge = screen.getByText('All Clear')
    expect(badge).toHaveClass('text-[#66BB6A]')
  })

  it('applies yellow status color class', () => {
    renderCard({ status: { label: 'Monitor', color: 'yellow' } })
    const badge = screen.getByText('Monitor')
    expect(badge).toHaveClass('text-[#D4854A]')
  })

  it('applies red status color class', () => {
    renderCard({ status: { label: 'Alert', color: 'red' } })
    const badge = screen.getByText('Alert')
    expect(badge).toHaveClass('text-[#EF5350]')
  })
})
