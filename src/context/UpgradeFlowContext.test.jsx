import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders, seedFullAppState } from '../test/test-utils'
import { useUpgradeFlow, UpgradeFlowProvider } from './UpgradeFlowContext'

vi.mock('framer-motion', async () => {
  return await import('../test/mocks/framer-motion.jsx')
})

function TestConsumer() {
  const { openUpgradeFlow, isOpen } = useUpgradeFlow()
  return (
    <div>
      <span data-testid="status">{isOpen ? 'open' : 'closed'}</span>
      <button onClick={openUpgradeFlow}>Open</button>
    </div>
  )
}

describe('UpgradeFlowContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders children', () => {
    seedFullAppState()
    renderWithProviders(
      <UpgradeFlowProvider>
        <p>Child content</p>
      </UpgradeFlowProvider>,
      { route: '/dashboard' },
    )
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('openUpgradeFlow opens PremiumUpgradeFlow modal', async () => {
    seedFullAppState()
    renderWithProviders(
      <UpgradeFlowProvider>
        <TestConsumer />
      </UpgradeFlowProvider>,
      { route: '/dashboard' },
    )

    expect(screen.getByTestId('status')).toHaveTextContent('closed')

    fireEvent.click(screen.getByText('Open'))

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('open')
    })
    // Modal dialog should be present
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('listens for pawsy:openUpgrade event and opens flow', async () => {
    seedFullAppState()
    renderWithProviders(
      <UpgradeFlowProvider>
        <TestConsumer />
      </UpgradeFlowProvider>,
      { route: '/dashboard' },
    )

    expect(screen.getByTestId('status')).toHaveTextContent('closed')

    fireEvent(window, new CustomEvent('pawsy:openUpgrade'))

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('open')
    })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes flow when onClose is triggered', async () => {
    seedFullAppState()
    renderWithProviders(
      <UpgradeFlowProvider>
        <TestConsumer />
      </UpgradeFlowProvider>,
      { route: '/dashboard' },
    )

    // Open the flow
    fireEvent.click(screen.getByText('Open'))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Close via the close button in the modal
    fireEvent.click(screen.getByLabelText('Close'))
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('closed')
    })
  })

  it('flow is not rendered when closed', () => {
    seedFullAppState()
    renderWithProviders(
      <UpgradeFlowProvider>
        <TestConsumer />
      </UpgradeFlowProvider>,
      { route: '/dashboard' },
    )

    expect(screen.getByTestId('status')).toHaveTextContent('closed')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
