import { test, expect } from '@playwright/test';

test.describe('Customer Enrollment Flow', () => {
  const testBusinessId = 'test-business-id';
  const testPhone = '+51 912 345 678';
  const testName = 'Juan Pérez';

  test.beforeEach(async ({ page }) => {
    // Navigate to enrollment page
    await page.goto(`/enroll/${testBusinessId}`);
  });

  test('should display business information on enrollment page', async ({ page }) => {
    // Wait for business data to load
    await page.waitForSelector('h1');

    // Check if business name is displayed (will be mock data in tests)
    const businessName = await page.textContent('h1');
    expect(businessName).toBeTruthy();

    // Check if reward structure is shown
    const rewardSection = page.locator('text=Recompensa');
    await expect(rewardSection).toBeVisible();
  });

  test('should validate phone format', async ({ page }) => {
    await page.fill('input[placeholder*="Nombre"]', testName);
    await page.fill('input[placeholder*="Teléfono"]', 'invalid phone');
    await page.click('button[type="submit"]');

    // Should show error for invalid format
    await expect(page.locator('text=/formato.*inválido/i')).toBeVisible({ timeout: 5000 });
  });

  test('should successfully enroll new customer and generate QR code', async ({ page }) => {
    // Fill enrollment form
    await page.fill('input[placeholder*="Nombre"]', testName);
    await page.fill('input[placeholder*="Teléfono"]', testPhone);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success state
    await expect(page.locator('text=/Bienvenido/i')).toBeVisible({ timeout: 10000 });

    // Verify QR code is displayed
    const qrImage = page.locator('img[alt*="QR Code"]');
    await expect(qrImage).toBeVisible();

    // Verify download button is present
    const downloadButton = page.locator('button:has-text("Descargar")');
    await expect(downloadButton).toBeVisible();

    // Verify instructions are shown
    await expect(page.locator('text=/Cómo usar tu tarjeta/i')).toBeVisible();
  });

  test('should show re-download option for existing customer', async ({ page }) => {
    // First enrollment
    await page.fill('input[placeholder*="Nombre"]', testName);
    await page.fill('input[placeholder*="Teléfono"]', testPhone);
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/Bienvenido/i')).toBeVisible({ timeout: 10000 });

    // Navigate back to enrollment
    await page.goto(`/enroll/${testBusinessId}`);

    // Fill same phone number
    await page.fill('input[placeholder*="Teléfono"]', testPhone);
    await page.dispatchEvent('input[placeholder*="Teléfono"]', 'blur');

    // Should show existing customer message
    await expect(page.locator('text=/Ya estás registrado/i')).toBeVisible({ timeout: 5000 });

    // Should show re-download button
    const redownloadButton = page.locator('button:has-text("Volver a Descargar")');
    await expect(redownloadButton).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page, context }) => {
    // Simulate offline
    await context.setOffline(true);

    await page.fill('input[placeholder*="Nombre"]', testName);
    await page.fill('input[placeholder*="Teléfono"]', testPhone);
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(
      page.locator('text=/Error|conexión/i')
    ).toBeVisible({ timeout: 5000 });

    // Restore connection
    await context.setOffline(false);
  });
});
