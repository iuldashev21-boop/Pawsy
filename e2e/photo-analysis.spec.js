// @ts-check
import { test, expect } from '@playwright/test'
import { seedFullState } from './helpers.js'
import path from 'path'

test.describe('Photo Analysis Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await seedFullState(page)
  })

  test('navigate to photo → upload image → select body area → see results', async ({ page }) => {
    await page.goto('/photo')

    // Should see upload interface
    await expect(page.getByRole('heading', { name: /upload a photo/i })).toBeVisible({ timeout: 10000 })

    // Upload a test image
    const fileInput = page.locator('input[type="file"]')
    const testImagePath = path.resolve('e2e/fixtures/test-dog-photo.jpg')
    await fileInput.setInputFiles(testImagePath)

    // Should show body area selection
    await expect(page.getByText(/area/i).or(page.getByText(/where/i))).toBeVisible({ timeout: 10000 })

    // Select a body area (e.g., "Skin")
    await page.getByRole('button', { name: /skin/i }).click()

    // Click analyze button
    await page.getByRole('button', { name: /analyze/i }).click()

    // Should show analysis results (from mock mode - HEALTHY scenario)
    await expect(page.getByText(/good news/i).first()).toBeVisible({ timeout: 15000 })
  })
})
