import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../../context/AuthContext'
import { DogProvider } from '../../context/DogContext'
import { UsageProvider } from '../../context/UsageContext'
import { ChatProvider } from '../../context/ChatContext'
import { OnboardingProvider } from '../../context/OnboardingContext'
import { ToastProvider } from '../../context/ToastContext'
import {
  seedFullAppState,
} from '../../test/test-utils'

vi.mock('framer-motion', async () => await import('../../test/mocks/framer-motion.jsx'))

import AppShell from './AppShell'

function renderAppShell(route = '/dashboard') {
  return render(
    <AuthProvider>
      <DogProvider>
        <UsageProvider>
          <ChatProvider>
            <OnboardingProvider>
              <ToastProvider>
                <MemoryRouter initialEntries={[route]}>
                  <Routes>
                    <Route element={<AppShell />}>
                      <Route path="/dashboard" element={<div data-testid="dashboard-content">Dashboard</div>} />
                      <Route path="/chat" element={<div data-testid="chat-content">Chat</div>} />
                    </Route>
                  </Routes>
                </MemoryRouter>
              </ToastProvider>
            </OnboardingProvider>
          </ChatProvider>
        </UsageProvider>
      </DogProvider>
    </AuthProvider>
  )
}

describe('AppShell', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders the header', async () => {
    seedFullAppState()
    renderAppShell('/dashboard')

    await waitFor(() => {
      // Header renders greeting and user name
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })
  })

  it('renders the sidebar navigation', async () => {
    seedFullAppState()
    renderAppShell('/dashboard')

    await waitFor(() => {
      expect(screen.getByLabelText('Sidebar navigation')).toBeInTheDocument()
    })
  })

  it('renders outlet content', async () => {
    seedFullAppState()
    renderAppShell('/dashboard')

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument()
    })
  })

  it('renders BottomNav', async () => {
    seedFullAppState()
    renderAppShell('/dashboard')

    await waitFor(() => {
      // BottomNav has a unique 'Photo' label (sidebar uses 'Photo AI')
      expect(screen.getByLabelText('Photo')).toBeInTheDocument()
      // Home and Chat exist in both sidebar and BottomNav
      expect(screen.getAllByLabelText('Home').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByLabelText('Chat').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('switches outlet content on navigation', async () => {
    seedFullAppState()
    renderAppShell('/chat')

    await waitFor(() => {
      expect(screen.getByTestId('chat-content')).toBeInTheDocument()
    })
  })
})
