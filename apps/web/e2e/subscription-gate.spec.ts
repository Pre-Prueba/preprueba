import { expect, test, type Page } from '@playwright/test';

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

async function loginAs(page: Page, email: string, password: string, expectedPath: '/dashboard' | '/checkout') {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(new RegExp(`${expectedPath}$`));
}

test.describe('Subscription gate', () => {
  test('sin suscripcion redirige a checkout', async ({ page }) => {
    await loginAs(page, env('TEST_USER_NO_SUB_EMAIL'), env('TEST_USER_NO_SUB_PASSWORD'), '/checkout');

    await page.goto('/practice/subscription-gate');

    await expect(page).toHaveURL(/\/checkout$/);
  });

  test('con suscripcion accede al dashboard', async ({ page }) => {
    await loginAs(page, env('TEST_USER_EMAIL'), env('TEST_USER_PASSWORD'), '/dashboard');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      /Buenos dias|Buenas tardes|Buenas noches/,
    );
  });
});
