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

test.describe('Autenticacion', () => {
  test('registro nuevo usuario', async ({ page }) => {
    const email = `registro-${Date.now()}@test.com`;

    await page.goto('/register');
    await page.getByLabel('Nombre (opcional)').fill('Test User');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Contraseña').fill('Password123!');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Crear cuenta' }).click();

    await expect(page).toHaveURL(/\/onboarding$/);
  });

  test('login con credenciales validas', async ({ page }) => {
    await loginAs(page, env('TEST_USER_EMAIL'), env('TEST_USER_PASSWORD'), '/dashboard');
  });

  test('login con credenciales invalidas muestra error', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('noexiste@test.com');
    await page.getByLabel('Contraseña').fill('wrongpassword');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page.getByRole('alert')).toContainText('incorrectos');
  });

  test('logout redirige al landing', async ({ page }) => {
    await loginAs(page, env('TEST_USER_EMAIL'), env('TEST_USER_PASSWORD'), '/dashboard');
    await page.goto('/settings');
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();

    await expect(page).toHaveURL(/\/$/);
  });
});
