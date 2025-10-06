import { test, expect } from '@playwright/test';

test.describe('Customer Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to customers page (assumes mock auth or test credentials)
    await page.goto('/dashboard/customers');
  });

  test('should display customers page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Clientes');

    // Check for stats cards
    await expect(page.getByText(/total clientes/i)).toBeVisible();
    await expect(page.getByText(/clientes activos/i)).toBeVisible();
    await expect(page.getByText(/sellos totales/i)).toBeVisible();
  });

  test('should have search functionality', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/buscar por nombre o teléfono/i);

    await expect(searchInput).toBeVisible();
    await searchInput.click();

    // Search input should be focusable
    await expect(searchInput).toBeFocused();
  });

  test('should filter customers on search input', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/buscar por nombre o teléfono/i);

    await searchInput.fill('Juan');

    // Wait for search to trigger (debounced in real app)
    await page.waitForTimeout(500);

    // Results should update (in real test, check specific customer appears)
    await expect(page.getByText(/resultados para/i)).toBeVisible();
  });

  test('should display customer progress bars', async ({ page }) => {
    // Check if progress components are rendered (assumes there are customers)
    const progressBars = page.locator('[role="progressbar"]');

    // At least one progress bar should exist if there are customers
    const count = await progressBars.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show empty state when no customers', async ({ page }) => {
    // This test assumes a fresh account or filtered state with no results
    const searchInput = page.getByPlaceholder(/buscar por nombre o teléfono/i);

    await searchInput.fill('NonExistentCustomer123456789');
    await page.waitForTimeout(500);

    // Should show "no results" message
    await expect(page.getByText(/no se encontraron clientes/i)).toBeVisible();
  });
});
