// @ts-check

/**
 * Seed an authenticated user in localStorage via page.evaluate
 */
export async function seedAuthenticatedUser(page, user = null) {
  const testUser = user || {
    id: 'e2e-user-123',
    email: 'e2e@test.com',
    name: 'E2E Tester',
    createdAt: new Date().toISOString(),
  }

  await page.evaluate((u) => {
    const users = { [u.email]: u }
    localStorage.setItem('pawsy_users', JSON.stringify(users))
    localStorage.setItem('pawsy_current_user', JSON.stringify(u))
  }, testUser)

  return testUser
}

/**
 * Seed a dog profile for the authenticated user
 */
export async function seedDogProfile(page, userId = 'e2e-user-123', dog = null) {
  const testDog = dog || {
    id: 'e2e-dog-456',
    userId,
    name: 'Buddy',
    breed: 'Golden Retriever',
    age: '3 years',
    weight: '65',
    weightUnit: 'lbs',
    allergies: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await page.evaluate(({ uid, d }) => {
    localStorage.setItem(`pawsy_${uid}_dogs`, JSON.stringify([d]))
    localStorage.setItem(`pawsy_${uid}_active_dog`, d.id)
  }, { uid: userId, d: testDog })

  return testDog
}

/**
 * Seed onboarding state
 */
export async function seedOnboarding(page, userId = 'e2e-user-123', progress = null) {
  const defaultProgress = {
    welcomeSeen: true,
    hasDog: true,
    firstChat: false,
    firstPhoto: false,
    checkedFood: false,
    viewedGuides: false,
  }

  await page.evaluate(({ uid, p }) => {
    localStorage.setItem(`pawsy_${uid}_onboarding`, JSON.stringify(p))
  }, { uid: userId, p: progress || defaultProgress })
}

/**
 * Seed usage state
 */
export async function seedUsage(page, userId = 'e2e-user-123', usage = null) {
  const today = new Date().toISOString().split('T')[0]
  const defaultUsage = {
    chatsUsedToday: 0,
    photosUsedToday: 0,
    emergencyChatsUsed: 0,
    emergencyPhotosUsed: 0,
    lastResetDate: today,
    firstDayDate: today,
  }

  await page.evaluate(({ uid, u }) => {
    localStorage.setItem(`pawsy_${uid}_usage`, JSON.stringify(u))
  }, { uid: userId, u: usage || defaultUsage })
}

/**
 * Enable mock mode for deterministic API responses
 */
export async function enableMockMode(page, scenario = 'happy_path', delay = 100) {
  await page.evaluate(({ s, d }) => {
    localStorage.setItem('pawsy_dev_mock_mode', 'true')
    localStorage.setItem('pawsy_dev_mock_scenario', s)
    localStorage.setItem('pawsy_dev_mock_delay', String(d))
  }, { s: scenario, d: delay })
}

/**
 * Full seeded state: user + dog + onboarding + usage + mock mode
 * Uses addInitScript to seed BEFORE the React app bootstraps,
 * ensuring contexts see the data on their very first render.
 */
export async function seedFullState(page) {
  const testUser = {
    id: 'e2e-user-123',
    email: 'e2e@test.com',
    name: 'E2E Tester',
    createdAt: new Date().toISOString(),
  }

  const testDog = {
    id: 'e2e-dog-456',
    userId: testUser.id,
    name: 'Buddy',
    breed: 'Golden Retriever',
    age: '3 years',
    weight: '65',
    weightUnit: 'lbs',
    allergies: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const today = new Date().toISOString().split('T')[0]
  const onboarding = {
    welcomeSeen: true,
    hasDog: true,
    firstChat: false,
    firstPhoto: false,
    checkedFood: false,
    viewedGuides: false,
  }
  const usage = {
    chatsUsedToday: 0,
    photosUsedToday: 0,
    emergencyChatsUsed: 0,
    emergencyPhotosUsed: 0,
    lastResetDate: today,
    firstDayDate: today,
  }

  // addInitScript runs before any page JS on every navigation
  await page.addInitScript(({ user, dog, onboarding, usage }) => {
    const uid = user.id
    localStorage.setItem('pawsy_users', JSON.stringify({ [user.email]: user }))
    localStorage.setItem('pawsy_current_user', JSON.stringify(user))
    localStorage.setItem(`pawsy_${uid}_dogs`, JSON.stringify([dog]))
    localStorage.setItem(`pawsy_${uid}_active_dog`, dog.id)
    localStorage.setItem(`pawsy_${uid}_onboarding`, JSON.stringify(onboarding))
    localStorage.setItem(`pawsy_${uid}_usage`, JSON.stringify(usage))
    localStorage.setItem('pawsy_dev_mock_mode', 'true')
    localStorage.setItem('pawsy_dev_mock_scenario', 'happy_path')
    localStorage.setItem('pawsy_dev_mock_delay', '100')
  }, { user: testUser, dog: testDog, onboarding, usage })

  return testUser
}
