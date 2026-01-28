import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock useDog context
vi.mock('../../context/DogContext', () => ({
  useDog: vi.fn(() => ({
    activeDog: {
      id: 'dog-1',
      name: 'Buddy',
      vaccinations: [
        { name: 'Rabies', dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString() },
      ],
    },
  })),
}))

// Mock LocalStorageService
vi.mock('../../services/storage/LocalStorageService', () => ({
  default: {
    getPetFacts: vi.fn(() => []),
  },
}))

import VitalStatsGrid from './VitalStatsGrid'
import { useDog } from '../../context/DogContext'
import LocalStorageService from '../../services/storage/LocalStorageService'

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('VitalStatsGrid', () => {
  it('renders 4 stat cards (Weight, Symptoms, Streak, Next Care)', () => {
    render(<VitalStatsGrid />)
    expect(screen.getByText('Weight')).toBeInTheDocument()
    expect(screen.getByText('Symptoms')).toBeInTheDocument()
    expect(screen.getByText('Streak')).toBeInTheDocument()
    expect(screen.getByText('Next Care')).toBeInTheDocument()
  })

  it('shows "All Clear" when no symptoms in last 14 days', () => {
    LocalStorageService.getPetFacts.mockReturnValue([])
    render(<VitalStatsGrid />)
    expect(screen.getByText('All Clear')).toBeInTheDocument()
  })

  it('shows correct streak from localStorage', () => {
    localStorage.setItem('pawsy_streak', JSON.stringify({ currentStreak: 10 }))
    render(<VitalStatsGrid />)
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('shows "On Track" for vaccination 45 days away', () => {
    render(<VitalStatsGrid />)
    expect(screen.getByText('On Track')).toBeInTheDocument()
  })

  it('shows "--" for weight when no weight facts exist', () => {
    LocalStorageService.getPetFacts.mockReturnValue([])
    render(<VitalStatsGrid />)
    expect(screen.getByText('--')).toBeInTheDocument()
  })

  it('shows weight value when weight facts exist', () => {
    LocalStorageService.getPetFacts.mockReturnValue([
      { category: 'weight', value: '65', createdAt: new Date().toISOString() },
    ])
    render(<VitalStatsGrid />)
    expect(screen.getByText('65')).toBeInTheDocument()
    expect(screen.getByText('Stable')).toBeInTheDocument()
  })

  it('shows "Monitor" when 1-2 symptoms logged recently', () => {
    LocalStorageService.getPetFacts.mockReturnValue([
      { category: 'symptom', value: 'cough', createdAt: new Date().toISOString() },
    ])
    render(<VitalStatsGrid />)
    expect(screen.getByText('Monitor')).toBeInTheDocument()
  })

  it('shows "All current" when dog has no vaccinations', () => {
    useDog.mockReturnValue({
      activeDog: { id: 'dog-1', name: 'Buddy', vaccinations: [] },
    })
    render(<VitalStatsGrid />)
    expect(screen.getByText('All current')).toBeInTheDocument()
  })
})
