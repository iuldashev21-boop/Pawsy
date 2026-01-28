import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AlertQueue from './AlertQueue'

const mockAlerts = [
  {
    id: 'alert-1',
    type: 'breed_risk',
    priority: 'high',
    title: 'Hip Dysplasia Risk',
    message: 'German Shepherds are prone to hip dysplasia.',
    status: 'active',
  },
  {
    id: 'alert-2',
    type: 'vaccination_due',
    priority: 'medium',
    title: 'Rabies Due',
    message: 'Rabies vaccination due in 14 days.',
    status: 'active',
  },
  {
    id: 'alert-3',
    type: 'symptom_pattern',
    priority: 'low',
    title: 'Recurring Cough',
    message: 'Cough logged 3 times in the past week.',
    status: 'active',
  },
]

function renderQueue(overrides = {}) {
  const props = {
    alerts: mockAlerts,
    onDismiss: vi.fn(),
    onSnooze: vi.fn(),
    ...overrides,
  }
  return {
    ...render(
      <MemoryRouter>
        <AlertQueue {...props} />
      </MemoryRouter>
    ),
    props,
  }
}

describe('AlertQueue', () => {
  it('renders alert count badge', () => {
    renderQueue()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders "View all" link to /alerts', () => {
    renderQueue()
    const link = screen.getByText(/View all/)
    expect(link.closest('a')).toHaveAttribute('href', '/alerts')
  })

  it('renders alert titles', () => {
    renderQueue()
    expect(screen.getByText('Hip Dysplasia Risk')).toBeInTheDocument()
    expect(screen.getByText('Rabies Due')).toBeInTheDocument()
    expect(screen.getByText('Recurring Cough')).toBeInTheDocument()
  })

  it('calls onDismiss when X clicked', async () => {
    const user = userEvent.setup()
    const { props } = renderQueue()
    const dismissBtn = screen.getByLabelText('Dismiss Hip Dysplasia Risk alert')
    await user.click(dismissBtn)
    expect(props.onDismiss).toHaveBeenCalledWith('alert-1')
  })

  it('calls onSnooze when clock clicked', async () => {
    const user = userEvent.setup()
    const { props } = renderQueue()
    const snoozeBtn = screen.getByLabelText('Snooze Hip Dysplasia Risk alert for 7 days')
    await user.click(snoozeBtn)
    expect(props.onSnooze).toHaveBeenCalledWith('alert-1')
  })

  it('shows empty state when no alerts', () => {
    renderQueue({ alerts: [] })
    expect(screen.getByText('No active alerts')).toBeInTheDocument()
  })

  it('filters out non-active alerts', () => {
    const alerts = [
      { ...mockAlerts[0], status: 'dismissed' },
      { ...mockAlerts[1], status: 'active' },
    ]
    renderQueue({ alerts })
    expect(screen.queryByText('Hip Dysplasia Risk')).not.toBeInTheDocument()
    expect(screen.getByText('Rabies Due')).toBeInTheDocument()
  })

  it('renders Health Alerts header', () => {
    renderQueue()
    expect(screen.getByText('Health Alerts')).toBeInTheDocument()
  })
})
