// @ts-check
import { test, expect } from '@playwright/test'
import { seedFullState } from './helpers.js'

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await seedFullState(page)
  })

  test('view settings page', async ({ page }) => {
    await page.goto('/settings')

    // Should show Account section (present on both mobile and desktop)
    await expect(page.getByRole('heading', { name: 'Account' })).toBeVisible({ timeout: 10000 })

    // Should show user info (email is unambiguous across viewports)
    await expect(page.getByText('e2e@test.com')).toBeVisible()

    // Should show dog profile section
    await expect(page.getByRole('heading', { name: 'Dog Profiles' })).toBeVisible()
  })

  test('delete dog with confirmation', async ({ page }) => {
    await page.goto('/settings')

    // Wait for the dog profile card with the trash icon to be visible
    await expect(page.locator('.lucide-trash-2').first()).toBeVisible({ timeout: 15000 })

    // Click the delete button
    await page.locator('.lucide-trash-2').first().click()

    // Should show confirmation dialog
    await expect(page.getByRole('heading', { name: /delete.*buddy/i })).toBeVisible({ timeout: 5000 })

    // Confirm deletion
    await page.getByRole('button', { name: /^delete$/i }).click()

    // Dog should be gone (navigates to add-dog since no dogs remain)
    await expect(page.getByText('Buddy')).not.toBeVisible({ timeout: 5000 })
  })

  test('logout redirects to landing', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: 'Account' })).toBeVisible({ timeout: 10000 })

    // Click logout
    await page.getByRole('button', { name: /log out/i }).first().click()

    // Should show confirmation dialog (use heading to avoid matching button text)
    await expect(page.getByRole('heading', { name: /log out/i })).toBeVisible({ timeout: 5000 })

    // Confirm logout
    await page.getByRole('button', { name: /log out/i }).last().click()

    // Should redirect to landing (full URL ends with just /) or login
    await expect(page).toHaveURL(/\/$|\/login/, { timeout: 10000 })
  })
})
