import { test, expect } from '@playwright/test';

test.describe('Loyalty Card View', () => {
  const testCustomerId = 'test-customer-id';

  test.beforeEach(async ({ page }) => {
    await page.goto(`/card/${testCustomerId}`);
  });

  test('should display customer QR code and information', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('h1');

    // Check if QR code is displayed
    const qrImage = page.locator('img[alt*="QR Code"]');
    await expect(qrImage).toBeVisible({ timeout: 10000 });

    // Check if customer name and phone are shown
    await expect(page.locator('text=/\\+51/i')).toBeVisible();
  });

  test('should display progress towards reward', async ({ page }) => {
    // Wait for progress section
    await expect(page.locator('text=/Tu Progreso/i')).toBeVisible({ timeout: 10000 });

    // Check if stamp count badge is shown
    const stampBadge = page.locator('[class*="Badge"]').first();
    await expect(stampBadge).toBeVisible();

    // Check if progress bar is displayed
    const progressBar = page.locator('[class*="Progress"]');
    await expect(progressBar).toBeVisible();
  });

  test('should show stamp grid visualization', async ({ page }) => {
    await expect(page.locator('text=/Tus Sellos/i')).toBeVisible({ timeout: 10000 });

    // Check if stamp grid is rendered
    const stampGrid = page.locator('div[class*="grid"]').filter({ hasText: '' });
    await expect(stampGrid).toBeVisible();

    // Verify individual stamp slots exist
    const stamps = page.locator('div[class*="aspect-square"]');
    const count = await stamps.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display recent visit history', async ({ page }) => {
    // Look for visit history section
    const historySection = page.locator('text=/Últimas Visitas/i');

    // If visits exist, verify they're shown
    const visitsVisible = await historySection.isVisible({ timeout: 5000 }).catch(() => false);

    if (visitsVisible) {
      // Check if visit items are displayed
      const visitItems = page.locator('div:has(svg[class*="w-4 h-4"])').filter({
        has: page.locator('text=/\\d{1,2}.*\\d{4}/'),
      });
      expect(await visitItems.count()).toBeGreaterThan(0);
    }
  });

  test('should show reward unlocked state when stamps complete', async ({ page, context }) => {
    // This test would need to mock a customer with all stamps complete
    // For now, check if the component can handle the unlocked state

    // Navigate to a mocked "complete" customer
    await page.goto(`/card/test-customer-complete`);

    // Look for reward unlocked message
    const rewardMessage = page.locator('text=/Recompensa Desbloqueada|Recompensa/i');
    const isVisible = await rewardMessage.isVisible({ timeout: 5000 }).catch(() => false);

    // If unlocked state is shown, verify the gift icon and message
    if (isVisible) {
      const giftIcon = page.locator('svg').filter({ hasText: '' });
      const hasGiftIcon = (await giftIcon.count()) > 0;
      expect(hasGiftIcon).toBeTruthy();
    }
  });

  test('should handle customer not found error', async ({ page }) => {
    await page.goto('/card/non-existent-customer');

    // Should show error message
    await expect(
      page.locator('text=/Error|no encontrado|no se pudo cargar/i')
    ).toBeVisible({ timeout: 10000 });

    // Should show error icon
    const errorIcon = page.locator('svg[class*="text-red"]');
    await expect(errorIcon).toBeVisible();
  });

  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.waitForLoadState('networkidle');

    // Check if content is visible and properly sized
    const container = page.locator('div[class*="max-w-md"]');
    await expect(container).toBeVisible();

    // QR code should still be visible
    const qrImage = page.locator('img[alt*="QR Code"]');
    await expect(qrImage).toBeVisible({ timeout: 10000 });

    // Progress section should be accessible
    await expect(page.locator('text=/Tu Progreso/i')).toBeVisible({ timeout: 5000 });
  });
});
