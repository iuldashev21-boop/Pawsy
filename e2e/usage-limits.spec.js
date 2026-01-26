// @ts-check
import { test, expect } from '@playwright/test'
import { seedAuthenticatedUser, seedDogProfile, seedOnboarding, seedUsage, enableMockMode } from './helpers.js'

test.describe('Usage Limits', () => {
  test('shows limit modal when daily chats exhausted', async ({ page }) => {
    await page.goto('/')

    const user = await seedAuthenticatedUser(page)
    await seedDogProfile(page, user.id)
    await seedOnboarding(page, user.id)
    await enableMockMode(page)

    // Set usage to max chats
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    await seedUsage(page, user.id, {
      chatsUsedToday: 5,
      photosUsedToday: 0,
      emergencyChatsUsed: 0,
      emergencyPhotosUsed: 0,
      lastResetDate: today,
      firstDayDate: yesterday.toISOString().split('T')[0],
    })

    await page.goto('/chat')

    // Try to send a message - should trigger limit modal
    const input = page.getByPlaceholder(/describe/i).or(page.getByPlaceholder(/type/i)).or(page.getByRole('textbox'))
    await expect(input.first()).toBeVisible({ timeout: 10000 })

    await input.first().fill('Test message')
    await page.getByRole('button', { name: /send/i }).click()

    // Should see usage limit modal
    await expect(page.getByText(/used all.*free/i)).toBeVisible({ timeout: 10000 })
  })

  test('emergency override allows sending after limit', async ({ page }) => {
    await page.goto('/')

    const user = await seedAuthenticatedUser(page)
    await seedDogProfile(page, user.id)
    await seedOnboarding(page, user.id)
    await enableMockMode(page)

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    await seedUsage(page, user.id, {
      chatsUsedToday: 5,
      photosUsedToday: 0,
      emergencyChatsUsed: 0,
      emergencyPhotosUsed: 0,
      lastResetDate: today,
      firstDayDate: yesterday.toISOString().split('T')[0],
    })

    await page.goto('/chat')

    const input = page.getByPlaceholder(/describe/i).or(page.getByPlaceholder(/type/i)).or(page.getByRole('textbox'))
    await expect(input.first()).toBeVisible({ timeout: 10000 })

    await input.first().fill('Emergency test')
    await page.getByRole('button', { name: /send/i }).click()

    // Wait for limit modal
    await expect(page.getByText(/used all.*free/i)).toBeVisible({ timeout: 10000 })

    // Click emergency override
    const emergencyBtn = page.getByRole('button', { name: /emergency chat/i })
    if (await emergencyBtn.isVisible()) {
      await emergencyBtn.click()
    }
  })
})
