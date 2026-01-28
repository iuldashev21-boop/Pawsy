// @ts-check
import { test, expect } from '@playwright/test'
import { seedFullState } from './helpers.js'

test.describe('Chat Flow', () => {
  test.beforeEach(async ({ page }) => {
    // addInitScript seeds localStorage before any page JS runs
    await seedFullState(page)
  })

  test('navigate to chat → send message → see response', async ({ page }) => {
    await page.goto('/chat')

    // Should see chat input
    const input = page.getByPlaceholder(/describe/i).or(page.getByPlaceholder(/type/i)).or(page.getByRole('textbox'))
    await expect(input.first()).toBeVisible({ timeout: 10000 })

    // Type and send a message
    await input.first().fill('My dog has been scratching a lot')
    await page.getByRole('button', { name: /send/i }).click()

    // Should see user message
    await expect(page.getByText('My dog has been scratching a lot')).toBeVisible({ timeout: 5000 })

    // Should see AI response (from mock mode)
    await expect(page.getByText(/minor issue|common|fine/i)).toBeVisible({ timeout: 15000 })
  })

  test('send follow-up message in same session', async ({ page }) => {
    await page.goto('/chat')

    const input = page.getByPlaceholder(/describe/i).or(page.getByPlaceholder(/type/i)).or(page.getByRole('textbox'))
    await expect(input.first()).toBeVisible({ timeout: 10000 })

    // First message
    await input.first().fill('My dog has a rash')
    await page.getByRole('button', { name: /send/i }).click()
    await expect(page.getByText('My dog has a rash')).toBeVisible({ timeout: 5000 })

    // Wait for response
    await expect(page.getByText(/minor issue|common|fine/i)).toBeVisible({ timeout: 15000 })

    // Follow-up
    await input.first().fill('It started yesterday')
    await page.getByRole('button', { name: /send/i }).click()
    await expect(page.getByText('It started yesterday')).toBeVisible({ timeout: 5000 })
  })
})
