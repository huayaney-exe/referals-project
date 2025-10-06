import { test, expect } from '@playwright/test';

test.describe('Campaign Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/campaigns');
  });

  test('should display campaigns page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Campañas');

    // Check for stats cards
    await expect(page.getByText(/campañas activas/i)).toBeVisible();
    await expect(page.getByText(/borradores/i)).toBeVisible();
  });

  test('should navigate to create campaign page', async ({ page }) => {
    const createButton = page.getByRole('link', { name: /crear campaña/i });

    await createButton.click();
    await expect(page).toHaveURL('/dashboard/campaigns/new');
    await expect(page.locator('h1')).toContainText('Nueva Campaña');
  });

  test('should display campaign creation form', async ({ page }) => {
    await page.goto('/dashboard/campaigns/new');

    await expect(page.getByLabel(/nombre de la campaña/i)).toBeVisible();
    await expect(page.getByPlaceholder(/mensaje/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /guardar borrador/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /activar campaña/i })).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/dashboard/campaigns/new');

    const activateButton = page.getByRole('button', { name: /activar campaña/i });
    await activateButton.click();

    // Should show validation error
    await expect(page.getByText(/completa todos los campos/i)).toBeVisible();
  });

  test('should show character count for message', async ({ page }) => {
    await page.goto('/dashboard/campaigns/new');

    const messageInput = page.getByPlaceholder(/mensaje/i).first();
    await messageInput.fill('Test message');

    // Character counter should update
    await expect(page.getByText(/\/1600 caracteres/i)).toBeVisible();
  });

  test('should display message preview', async ({ page }) => {
    await page.goto('/dashboard/campaigns/new');

    const messageInput = page.getByPlaceholder(/mensaje/i).first();
    await messageInput.fill('¡Hola {nombre}! Tienes {sellos} sellos.');

    // Preview should show with replaced variables
    await expect(page.getByText(/vista previa/i)).toBeVisible();
    await expect(page.getByText(/juan/i)).toBeVisible();
  });

  test('should display tips section', async ({ page }) => {
    await page.goto('/dashboard/campaigns/new');

    await expect(page.getByText(/consejos/i)).toBeVisible();
    await expect(page.getByText(/personalizar/i)).toBeVisible();
  });

  test('should show available variables', async ({ page }) => {
    await page.goto('/dashboard/campaigns/new');

    await expect(page.getByText(/variables disponibles/i)).toBeVisible();
    await expect(page.getByText(/{nombre}/i)).toBeVisible();
    await expect(page.getByText(/{sellos}/i)).toBeVisible();
  });
});
