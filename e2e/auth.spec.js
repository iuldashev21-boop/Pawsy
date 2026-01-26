// @ts-check
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('signup → redirected to /add-dog → fill profile → arrive at dashboard', async ({ page }) => {
    await page.goto('/signup')

    // Fill signup form
    await page.getByLabel('Your name').fill('Test Dog Owner')
    await page.getByLabel('Email address').fill('newuser@test.com')
    await page.getByLabel('Password').fill('password123')

    // Submit
    await page.getByRole('button', { name: 'Create Account' }).click()

    // Should navigate to add-dog
    await expect(page).toHaveURL(/\/add-dog/, { timeout: 10000 })

    // Fill dog name (step 1)
    await page.getByPlaceholder(/enter name/i).fill('Rex')
    await page.getByRole('button', { name: /continue/i }).click()

    // Step 2: Breed & gender - select a breed
    await page.getByRole('button', { name: /select breed/i }).click()
    await page.getByRole('option', { name: 'Labrador Retriever' }).click()
    // Select gender
    await page.getByRole('button', { name: '♂ Male' }).click()
    await page.getByRole('button', { name: /continue/i }).click()

    // Step 3: Weight
    await page.getByPlaceholder(/weight/i).fill('70')
    await page.getByRole('button', { name: /continue/i }).click()

    // Step 4: Allergies - skip
    await page.getByRole('button', { name: /complete/i }).click()

    // Should show completion screen
    await expect(page.getByText(/Nice to meet you/i)).toBeVisible({ timeout: 5000 })

    // Navigate to dashboard
    await page.getByRole('button', { name: /go to dashboard/i }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('login → dashboard with dog data', async ({ page }) => {
    // Pre-seed user via signup flow
    await page.goto('/signup')
    await page.getByLabel('Your name').fill('Login Tester')
    await page.getByLabel('Email address').fill('login@test.com')
    await page.getByLabel('Password').fill('pass123')
    await page.getByRole('button', { name: 'Create Account' }).click()
    await expect(page).toHaveURL(/\/add-dog/, { timeout: 10000 })

    // Now log out and log back in
    await page.goto('/login')
    await page.getByLabel('Email address').fill('login@test.com')
    await page.getByRole('button', { name: 'Sign In' }).click()

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
    // User name appears in the header (mobile h1 is hidden on desktop, so check the header container)
    await expect(page.locator('header')).toContainText('Login Tester')
  })

  test('shows error for non-existent user login', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email address').fill('nobody@test.com')
    await page.getByRole('button', { name: 'Sign In' }).click()

    await expect(page.getByText(/No account found/)).toBeVisible({ timeout: 10000 })
  })
})
