import { expect, test, type Page } from '@playwright/test';

async function registerUser(page: Page, email: string, password: string) {
  await page.goto('/register');
  await page.getByLabel('Nombre (opcional)').fill('Usuario onboarding');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
}

test.describe('Onboarding', () => {
  test('completar onboarding de 3 pasos', async ({ page }) => {
    const email = `onboarding-${Date.now()}@test.com`;

    await registerUser(page, email, 'TestPass123!');

    await page.getByTestId('prueba-mayores-25').click();
    await page.getByRole('button', { name: /Continuar/ }).click();

    await page.getByRole('combobox', { name: 'Comunidad autónoma' }).selectOption('Madrid');
    await page.getByRole('button', { name: /Continuar/ }).click();

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Todo listo');
    await page.getByRole('button', { name: /Ir a practicar/ }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
