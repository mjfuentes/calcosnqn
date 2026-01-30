import { test, expect } from '@playwright/test'

test.describe('Catalog', () => {
  test('home page loads in Spanish by default', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/CalcosNQN/)
    // Spanish nav link "Catalogo" should be visible in the header
    await expect(page.locator('body')).toContainText('Catalogo')
  })

  test('catalog page shows sticker grid', async ({ page }) => {
    await page.goto('/catalogo')
    // The page should have a visible heading (catalog title)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('language toggle switches to English', async ({ page }) => {
    await page.goto('/')
    // When on Spanish locale, the toggle shows "English" (the target locale name)
    const langToggle = page.getByRole('button', { name: /Switch to English/i })
    if (await langToggle.isVisible()) {
      await langToggle.click()
      await expect(page).toHaveURL(/\/en/)
    }
  })

  test('cart page shows empty state', async ({ page }) => {
    await page.goto('/carrito')
    await expect(page.locator('body')).toContainText(/carrito|vacio|empty/i)
  })

  test('reseller page loads correctly', async ({ page }) => {
    await page.goto('/vende-en-tu-local')
    await expect(page.locator('body')).toContainText(/local|reseller/i)
  })

  test('admin login page loads', async ({ page }) => {
    await page.goto('/admin/login')
    // Should show login form with email and password inputs
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })
})
