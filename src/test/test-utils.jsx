import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { DogProvider } from '../context/DogContext'
import { UsageProvider } from '../context/UsageContext'
import { ChatProvider } from '../context/ChatContext'
import { OnboardingProvider } from '../context/OnboardingContext'
import { ToastProvider } from '../context/ToastContext'

// Test constants
export const TEST_USER = {
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date().toISOString(),
}

export const TEST_DOG = {
  id: 'test-dog-456',
  userId: 'test-user-123',
  name: 'Buddy',
  breed: 'Golden Retriever',
  age: '3 years',
  weight: '65',
  weightUnit: 'lbs',
  allergies: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// Seed functions — populate localStorage before providers mount
export function seedAuthState(user = TEST_USER) {
  const users = { [user.email]: user }
  localStorage.setItem('pawsy_users', JSON.stringify(users))
  localStorage.setItem('pawsy_current_user', JSON.stringify(user))
}

export function seedDogState(dog = TEST_DOG, user = TEST_USER) {
  localStorage.setItem(`pawsy_${user.id}_dogs`, JSON.stringify([dog]))
  localStorage.setItem(`pawsy_${user.id}_active_dog`, dog.id)
}

export function seedUsageState(usage = null, user = TEST_USER) {
  const today = new Date().toISOString().split('T')[0]
  const defaultUsage = {
    chatsUsedToday: 0,
    photosUsedToday: 0,
    emergencyChatsUsed: 0,
    emergencyPhotosUsed: 0,
    lastResetDate: today,
    firstDayDate: today,
  }
  localStorage.setItem(
    `pawsy_${user.id}_usage`,
    JSON.stringify(usage || defaultUsage)
  )
}

export function seedOnboardingState(progress = null, user = TEST_USER) {
  const defaultProgress = {
    welcomeSeen: true,
    hasDog: true,
    firstChat: false,
    firstPhoto: false,
    checkedFood: false,
    viewedGuides: false,
  }
  localStorage.setItem(
    `pawsy_${user.id}_onboarding`,
    JSON.stringify(progress || defaultProgress)
  )
}

export function seedFullAppState() {
  seedAuthState()
  seedDogState()
  seedUsageState()
  seedOnboardingState()
}

/**
 * Render with all providers in the correct nesting order.
 * ErrorBoundary intentionally omitted so test errors propagate.
 */
export function renderWithProviders(ui, { route = '/', ...options } = {}) {
  function Wrapper({ children }) {
    return (
      <AuthProvider>
        <DogProvider>
          <UsageProvider>
            <ChatProvider>
              <OnboardingProvider>
                <ToastProvider>
                  <MemoryRouter initialEntries={[route]}>
                    {children}
                  </MemoryRouter>
                </ToastProvider>
              </OnboardingProvider>
            </ChatProvider>
          </UsageProvider>
        </DogProvider>
      </AuthProvider>
    )
  }

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...options }),
  }
}

// Re-export everything from testing library
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react'
export { userEvent }
