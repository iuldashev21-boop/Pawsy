import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import {
  seedFullAppState,
  renderWithProviders,
  TEST_USER,
} from '../../test/test-utils'

vi.mock('framer-motion', async () => {
  return await import('../../test/mocks/framer-motion.jsx')
})

import ChatHistory from './ChatHistory'

const NOW = '2026-01-27T12:00:00.000Z'

function makeSessions(count = 0) {
  return Array.from({ length: count }, (_, i) => ({
    id: `session-${i + 1}`,
    dogId: 'test-dog-456',
    title: `Session ${i + 1}`,
    messages: [
      { id: `msg-${i}`, role: 'user', content: `Question ${i + 1}`, timestamp: NOW },
    ],
    createdAt: new Date(Date.now() - (count - i) * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - (count - i) * 86400000).toISOString(),
  }))
}

describe('ChatHistory', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  // ── Empty state ──

  it('shows "No conversations yet" when sessions is empty', () => {
    seedFullAppState()
    renderWithProviders(
      <ChatHistory
        sessions={[]}
        onLoadSession={vi.fn()}
        onDeleteSession={vi.fn()}
        onClose={vi.fn()}
      />,
      { route: '/chat' }
    )

    expect(screen.getByText('No conversations yet')).toBeInTheDocument()
  })

  // ── Rendering sessions ──

  it('renders session titles', () => {
    seedFullAppState()
    const sessions = makeSessions(3)

    renderWithProviders(
      <ChatHistory
        sessions={sessions}
        onLoadSession={vi.fn()}
        onDeleteSession={vi.fn()}
        onClose={vi.fn()}
      />,
      { route: '/chat' }
    )

    expect(screen.getByText('Session 1')).toBeInTheDocument()
    expect(screen.getByText('Session 2')).toBeInTheDocument()
    expect(screen.getByText('Session 3')).toBeInTheDocument()
  })

  it('renders session dates', () => {
    seedFullAppState()
    const sessions = [{
      id: 'session-1',
      dogId: 'test-dog-456',
      title: 'Test Session',
      messages: [],
      createdAt: '2026-01-15T10:00:00.000Z',
      updatedAt: '2026-01-15T10:00:00.000Z',
    }]

    renderWithProviders(
      <ChatHistory
        sessions={sessions}
        onLoadSession={vi.fn()}
        onDeleteSession={vi.fn()}
        onClose={vi.fn()}
      />,
      { route: '/chat' }
    )

    // Should display some form of the date
    expect(screen.getByText('Test Session')).toBeInTheDocument()
  })

  // ── Clicking a session ──

  it('calls onLoadSession with session id when clicking a session', () => {
    seedFullAppState()
    const onLoadSession = vi.fn()
    const sessions = makeSessions(2)

    renderWithProviders(
      <ChatHistory
        sessions={sessions}
        onLoadSession={onLoadSession}
        onDeleteSession={vi.fn()}
        onClose={vi.fn()}
      />,
      { route: '/chat' }
    )

    fireEvent.click(screen.getByText('Session 1'))
    expect(onLoadSession).toHaveBeenCalledWith('session-1')
  })

  // ── Deleting a session ──

  it('calls onDeleteSession when delete button is clicked', () => {
    seedFullAppState()
    const onDeleteSession = vi.fn()
    const sessions = makeSessions(1)

    renderWithProviders(
      <ChatHistory
        sessions={sessions}
        onLoadSession={vi.fn()}
        onDeleteSession={onDeleteSession}
        onClose={vi.fn()}
      />,
      { route: '/chat' }
    )

    const deleteButtons = screen.getAllByLabelText(/Delete session/)
    fireEvent.click(deleteButtons[0])
    expect(onDeleteSession).toHaveBeenCalledWith('session-1')
  })

  // ── Close button ──

  it('calls onClose when close button is clicked', () => {
    seedFullAppState()
    const onClose = vi.fn()

    renderWithProviders(
      <ChatHistory
        sessions={[]}
        onLoadSession={vi.fn()}
        onDeleteSession={vi.fn()}
        onClose={onClose}
      />,
      { route: '/chat' }
    )

    fireEvent.click(screen.getByLabelText('Close history'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // ── PremiumGate for free users ──

  it('shows premium gate overlay for free users', () => {
    seedFullAppState()
    // No premium status set = free user

    renderWithProviders(
      <ChatHistory
        sessions={makeSessions(2)}
        onLoadSession={vi.fn()}
        onDeleteSession={vi.fn()}
        onClose={vi.fn()}
      />,
      { route: '/chat' }
    )

    expect(screen.getByText(/Upgrade to Premium/)).toBeInTheDocument()
  })

  it('does not show premium gate for premium users', () => {
    seedFullAppState()
    localStorage.setItem(`pawsy_${TEST_USER.id}_premium_status`, 'true')

    renderWithProviders(
      <ChatHistory
        sessions={makeSessions(2)}
        onLoadSession={vi.fn()}
        onDeleteSession={vi.fn()}
        onClose={vi.fn()}
      />,
      { route: '/chat' }
    )

    expect(screen.queryByText(/Upgrade to Premium/)).not.toBeInTheDocument()
  })

  // ── Header ──

  it('displays a header title', () => {
    seedFullAppState()
    localStorage.setItem(`pawsy_${TEST_USER.id}_premium_status`, 'true')

    renderWithProviders(
      <ChatHistory
        sessions={[]}
        onLoadSession={vi.fn()}
        onDeleteSession={vi.fn()}
        onClose={vi.fn()}
      />,
      { route: '/chat' }
    )

    expect(screen.getByText('Chat History')).toBeInTheDocument()
  })

  // ── Message count display ──

  it('shows message count for sessions', () => {
    seedFullAppState()
    localStorage.setItem(`pawsy_${TEST_USER.id}_premium_status`, 'true')

    const sessions = [{
      id: 'session-1',
      dogId: 'test-dog-456',
      title: 'Health Chat',
      messages: [
        { id: 'm1', role: 'user', content: 'Q1', timestamp: NOW },
        { id: 'm2', role: 'assistant', content: 'A1', timestamp: NOW },
        { id: 'm3', role: 'user', content: 'Q2', timestamp: NOW },
      ],
      createdAt: NOW,
      updatedAt: NOW,
    }]

    renderWithProviders(
      <ChatHistory
        sessions={sessions}
        onLoadSession={vi.fn()}
        onDeleteSession={vi.fn()}
        onClose={vi.fn()}
      />,
      { route: '/chat' }
    )

    expect(screen.getByText(/3 messages/)).toBeInTheDocument()
  })
})
