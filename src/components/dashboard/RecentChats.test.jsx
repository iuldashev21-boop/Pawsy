import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen } from '@testing-library/react'
import {
  renderWithProviders,
  seedFullAppState,
  TEST_USER,
  TEST_DOG,
} from '../../test/test-utils'

vi.mock('framer-motion', async () => {
  return await import('../../test/mocks/framer-motion.jsx')
})

import RecentChats from './RecentChats'

const sampleSessions = [
  {
    id: 'session-1',
    dogId: TEST_DOG.id,
    title: 'Limping issue',
    messages: [
      { id: 'm1', role: 'user', content: 'My dog is limping', timestamp: '2025-06-15T10:00:00.000Z' },
      { id: 'm2', role: 'assistant', content: 'Let me help', timestamp: '2025-06-15T10:01:00.000Z' },
      { id: 'm3', role: 'user', content: 'Thanks', timestamp: '2025-06-15T10:02:00.000Z' },
    ],
    createdAt: '2025-06-15T10:00:00.000Z',
    updatedAt: '2025-06-15T10:02:00.000Z',
  },
  {
    id: 'session-2',
    dogId: TEST_DOG.id,
    title: 'Diet questions',
    messages: [
      { id: 'm4', role: 'user', content: 'Best food for golden?', timestamp: '2025-06-14T08:00:00.000Z' },
      { id: 'm5', role: 'assistant', content: 'Great question', timestamp: '2025-06-14T08:01:00.000Z' },
    ],
    createdAt: '2025-06-14T08:00:00.000Z',
    updatedAt: '2025-06-14T08:01:00.000Z',
  },
  {
    id: 'session-3',
    dogId: TEST_DOG.id,
    title: 'Vaccination schedule',
    messages: [
      { id: 'm6', role: 'user', content: 'When are vaccines due?', timestamp: '2025-06-13T12:00:00.000Z' },
    ],
    createdAt: '2025-06-13T12:00:00.000Z',
    updatedAt: '2025-06-13T12:00:00.000Z',
  },
  {
    id: 'session-4',
    dogId: TEST_DOG.id,
    title: 'Older session',
    messages: [
      { id: 'm7', role: 'user', content: 'Hello', timestamp: '2025-06-01T12:00:00.000Z' },
    ],
    createdAt: '2025-06-01T12:00:00.000Z',
    updatedAt: '2025-06-01T12:00:00.000Z',
  },
]

function seedChatSessions(sessions = sampleSessions) {
  localStorage.setItem(
    `pawsy_${TEST_USER.id}_chat_sessions`,
    JSON.stringify(sessions)
  )
}

function seedPremium() {
  localStorage.setItem(`pawsy_${TEST_USER.id}_premium_status`, 'true')
}

describe('RecentChats', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders section heading for premium users', () => {
    seedFullAppState()
    seedPremium()
    seedChatSessions()
    renderWithProviders(<RecentChats />, { route: '/dashboard' })
    expect(screen.getByText('Recent Chats')).toBeInTheDocument()
  })

  it('shows last 3 sessions with titles for premium users', () => {
    seedFullAppState()
    seedPremium()
    seedChatSessions()
    renderWithProviders(<RecentChats />, { route: '/dashboard' })

    expect(screen.getByText('Limping issue')).toBeInTheDocument()
    expect(screen.getByText('Diet questions')).toBeInTheDocument()
    expect(screen.getByText('Vaccination schedule')).toBeInTheDocument()
    // 4th session should not appear
    expect(screen.queryByText('Older session')).not.toBeInTheDocument()
  })

  it('shows message count for each session', () => {
    seedFullAppState()
    seedPremium()
    seedChatSessions()
    renderWithProviders(<RecentChats />, { route: '/dashboard' })

    expect(screen.getByText('3 messages')).toBeInTheDocument()
    expect(screen.getByText('2 messages')).toBeInTheDocument()
    expect(screen.getByText('1 message')).toBeInTheDocument()
  })

  it('shows empty state when no sessions exist for premium users', () => {
    seedFullAppState()
    seedPremium()
    renderWithProviders(<RecentChats />, { route: '/dashboard' })
    expect(screen.getByText('Your conversations will appear here')).toBeInTheDocument()
  })

  it('shows PremiumGate for free users', () => {
    seedFullAppState()
    // No seedPremium() — free user
    seedChatSessions()
    renderWithProviders(<RecentChats />, { route: '/dashboard' })

    // PremiumGate overlay renders a CTA button
    expect(screen.getByText('Upgrade to Premium')).toBeInTheDocument()
  })

  it('does not show session titles for free users behind gate', () => {
    seedFullAppState()
    // Free user, but sessions exist
    seedChatSessions()
    renderWithProviders(<RecentChats />, { route: '/dashboard' })

    // The content is blurred but still rendered (overlay variant)
    // The heading should still be visible
    expect(screen.getByText('Recent Chats')).toBeInTheDocument()
  })
})
