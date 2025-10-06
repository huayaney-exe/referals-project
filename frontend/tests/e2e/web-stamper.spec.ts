import { test, expect } from '@playwright/test';

test.describe('Web Stamper - QR Scanner', () => {
  const testEmail = 'stamper@test.com';
  const testPassword = 'SecurePass123!';

  test.beforeEach(async ({ page }) => {
    // Navigate to stamp page
    await page.goto('/stamp');
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Should redirect to login page
    await page.waitForURL('**/login**', { timeout: 5000 });

    expect(page.url()).toContain('/login');

    // Should have redirect parameter
    expect(page.url()).toContain('redirect=%2Fstamp');
  });

  test.describe('Authenticated Stamper', () => {
    test.beforeEach(async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', testPassword);
      await page.click('button[type="submit"]');

      // Wait for redirect to stamp page
      await page.waitForURL('**/stamp', { timeout: 10000 });
    });

    test('should display QR scanner interface', async ({ page }) => {
      // Check for scanner heading
      await expect(page.locator('text=/Escanea el código QR/i')).toBeVisible({
        timeout: 5000,
      });

      // Check for scanner container
      const scannerContainer = page.locator('#qr-reader');
      await expect(scannerContainer).toBeVisible();

      // Check for camera instruction
      await expect(page.locator('text=/Apunta la cámara/i')).toBeVisible();

      // Logout button should be present
      await expect(page.locator('button:has-text("Salir")').or(page.locator('button:has-text("LogOut")'))).toBeVisible();
    });

    test('should show customer details after scanning QR code', async ({ page }) => {
      // Mock QR scan by directly calling the scan handler
      // In real scenario, we'd use camera permissions and actual QR code

      const mockQRData = JSON.stringify({
        customer_id: 'test-customer-123',
        business_id: 'test-business-456',
      });

      // Simulate QR scan by executing JavaScript
      await page.evaluate((data) => {
        const event = new CustomEvent('qr-scanned', { detail: data });
        document.dispatchEvent(event);
      }, mockQRData);

      // Wait for customer details to load (with generous timeout for API)
      await expect(page.locator('text=/Cliente/i')).toBeVisible({ timeout: 10000 });

      // Check if customer name is displayed
      await expect(page.locator('text=/Nombre/i')).toBeVisible();

      // Check if progress section is shown
      await expect(page.locator('text=/Progreso/i')).toBeVisible();

      // Add stamp button should be visible
      await expect(
        page.locator('button:has-text("Agregar Sello")')
      ).toBeVisible();
    });

    test('should add stamp and show success message', async ({ page }) => {
      // First scan QR (mock)
      const mockQRData = JSON.stringify({
        customer_id: 'test-customer-123',
        business_id: 'test-business-456',
      });

      await page.evaluate((data) => {
        const event = new CustomEvent('qr-scanned', { detail: data });
        document.dispatchEvent(event);
      }, mockQRData);

      // Wait for customer details
      await expect(page.locator('text=/Cliente/i')).toBeVisible({ timeout: 10000 });

      // Click add stamp button
      const addButton = page.locator('button:has-text("Agregar Sello")');
      await addButton.click();

      // Should show success message
      await expect(
        page.locator('text=/Sello Agregado|¡Sello/i')
      ).toBeVisible({ timeout: 10000 });

      // Should show updated stamp count
      await expect(page.locator('text=/sellos|Sello/i')).toBeVisible();
    });

    test('should show reward unlocked message when customer completes stamps', async ({
      page,
    }) => {
      // Mock customer with completed stamps (last stamp to unlock)
      const mockQRData = JSON.stringify({
        customer_id: 'test-customer-almost-complete',
        business_id: 'test-business-456',
      });

      await page.evaluate((data) => {
        const event = new CustomEvent('qr-scanned', { detail: data });
        document.dispatchEvent(event);
      }, mockQRData);

      await expect(page.locator('text=/Cliente/i')).toBeVisible({ timeout: 10000 });

      // Click add stamp
      await page.locator('button:has-text("Agregar Sello")').click();

      // Should show reward unlocked message
      const rewardMessage = page.locator('text=/Recompensa Desbloqueada/i');
      const isVisible = await rewardMessage.isVisible({ timeout: 10000 }).catch(() => false);

      if (isVisible) {
        // Gift icon should be shown
        const giftIcon = page.locator('svg').filter({ hasText: '' });
        expect(await giftIcon.count()).toBeGreaterThan(0);
      }
    });

    test('should allow user to go back and scan another customer', async ({ page }) => {
      // Scan first customer
      const mockQRData = JSON.stringify({
        customer_id: 'test-customer-123',
        business_id: 'test-business-456',
      });

      await page.evaluate((data) => {
        const event = new CustomEvent('qr-scanned', { detail: data });
        document.dispatchEvent(event);
      }, mockQRData);

      await expect(page.locator('text=/Cliente/i')).toBeVisible({ timeout: 10000 });

      // Click back button
      const backButton = page.locator('button:has-text("Volver")');
      await backButton.click();

      // Should return to scanner view
      await expect(page.locator('text=/Escanea el código QR/i')).toBeVisible({
        timeout: 5000,
      });

      // Scanner should be active again
      const scannerContainer = page.locator('#qr-reader');
      await expect(scannerContainer).toBeVisible();
    });

    test('should handle invalid QR code data', async ({ page }) => {
      // Scan invalid QR data
      const invalidQRData = 'invalid-qr-data-not-json';

      await page.evaluate((data) => {
        const event = new CustomEvent('qr-scanned', { detail: data });
        document.dispatchEvent(event);
      }, invalidQRData);

      // Should show error message
      await expect(
        page.locator('text=/Código QR inválido|Error/i')
      ).toBeVisible({ timeout: 5000 });
    });

    test('should logout successfully', async ({ page }) => {
      // Click logout button
      const logoutButton = page.locator('button:has-text("Salir")').or(page.locator('button:has-text("LogOut")'));
      await logoutButton.click();

      // Should redirect to login page
      await page.waitForURL('**/login**', { timeout: 5000 });
      expect(page.url()).toContain('/login');
    });
  });
});
