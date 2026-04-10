import { expect, test, type Page } from '@playwright/test';

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe('Sesion de practica', () => {
  test('completar sesion entera de una materia', async ({ page }) => {
    test.setTimeout(180_000);

    await loginAs(page, env('TEST_USER_EMAIL'), env('TEST_USER_PASSWORD'));

    const firstCard = page.getByTestId('materia-card').first();
    await expect(firstCard).toBeVisible();
    await firstCard.getByTestId('practice-button').click();

    const questionContainer = page.getByTestId('pregunta-container');
    await expect(questionContainer).toBeVisible();

    const counterText = await page.getByText(/Pregunta 1 de \d+/).textContent();
    const totalQuestions = Number(counterText?.match(/de (\d+)/)?.[1] ?? '0');

    expect(totalQuestions).toBeGreaterThan(0);

    for (let index = 0; index < totalQuestions; index += 1) {
      await expect(questionContainer).toBeVisible();
      const tipo = await questionContainer.getAttribute('data-tipo');

      if (tipo === 'TEST') {
        await page.getByTestId('opcion').first().click();
      } else {
        await page.getByRole('textbox').fill('Esta es mi respuesta de prueba.');
      }

      await page.getByRole('button', { name: /Comprobar respuesta/ }).click();
      await expect(page.getByTestId('feedback-ia')).toBeVisible({ timeout: 30_000 });

      const nextButtonName = index === totalQuestions - 1 ? /Ver resultados/ : /Siguiente/;
      await page.getByRole('button', { name: nextButtonName }).click();
    }

    await expect(page.getByTestId('resultado-final')).toBeVisible();
    await expect(page.getByTestId('porcentaje-acierto')).toBeVisible();
  });
});
