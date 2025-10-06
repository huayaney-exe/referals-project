import { test, expect } from '@playwright/test';

// Test helper to create a mock authenticated session
// In production, use Supabase test utilities
test.describe('Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication (in real tests, use proper Supabase test auth)
    await page.goto('/login');
    // Note: These tests assume you have test credentials or mock auth
    // For now, we'll test the UI structure without actual auth
  });

  test('should display dashboard sidebar', async ({ page }) => {
    await page.goto('/dashboard');

    // Check if sidebar navigation exists
    await expect(page.getByRole('navigation')).toBeVisible();

    // Check navigation links
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /clientes/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /campañas/i })).toBeVisible();
  });

  test('should navigate to customers page', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('link', { name: /clientes/i }).click();
    await expect(page).toHaveURL('/dashboard/customers');
    await expect(page.locator('h1')).toContainText('Clientes');
  });

  test('should navigate to campaigns page', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('link', { name: /campañas/i }).click();
    await expect(page).toHaveURL('/dashboard/campaigns');
    await expect(page.locator('h1')).toContainText('Campañas');
  });

  test('should navigate to analytics page', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('link', { name: /analytics/i }).click();
    await expect(page).toHaveURL('/dashboard/analytics');
    await expect(page.locator('h1')).toContainText('Analytics');
  });

  test('should show active state on current page', async ({ page }) => {
    await page.goto('/dashboard/customers');

    const customersLink = page.getByRole('link', { name: /clientes/i });

    // Active link should have specific styling (adjust selector based on implementation)
    const classList = await customersLink.getAttribute('class');
    expect(classList).toContain('bg-brand-whisper'); // Active state class
  });
});
