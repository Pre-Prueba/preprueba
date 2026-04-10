# SPEC-09 — Tests E2E Críticos (Playwright)
> Prioridad: 🟢 Baja · Estimación: 4-6h
> **Depende de todo lo anterior funcionando. Ejecutar al final.**

---

## Contexto

El proyecto no tiene tests. Playwright ya es la herramienta elegida para E2E (definido en `CLAUDE.md`). Los tests cubren los flujos críticos para detectar regresiones antes de cada deploy.

---

## Archivos a Crear

| Archivo | Qué testea |
|---------|-----------|
| `apps/web/e2e/auth.spec.ts` | Registro, login, logout |
| `apps/web/e2e/onboarding.spec.ts` | Flujo de onboarding completo |
| `apps/web/e2e/practice.spec.ts` | Sesión de práctica completa |
| `apps/web/e2e/subscription-gate.spec.ts` | Bloqueo sin suscripción |
| `apps/web/playwright.config.ts` | Config de Playwright |

---

## Setup Playwright

```bash
cd apps/web
npm install -D @playwright/test
npx playwright install chromium
```

### `apps/web/playwright.config.ts`
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Tests a Implementar

### `auth.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Autenticación', () => {
  test('registro nuevo usuario', async ({ page }) => {
    await page.goto('/register');
    await page.fill('[name="nombre"]', 'Test User');
    await page.fill('[name="email"]', `test${Date.now()}@test.com`);
    await page.fill('[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/onboarding');
  });

  test('login con credenciales válidas', async ({ page }) => {
    // Usar usuario existente en DB de test
    await page.goto('/login');
    await page.fill('[name="email"]', process.env.TEST_USER_EMAIL!);
    await page.fill('[name="password"]', process.env.TEST_USER_PASSWORD!);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('login con credenciales inválidas muestra error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'noexiste@test.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('[role="alert"], .error')).toBeVisible();
  });

  test('logout redirige al landing', async ({ page }) => {
    // Hacer login primero (helper)
    await loginAs(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
    await page.goto('/settings');
    await page.click('button:has-text("Cerrar sesión")');
    await expect(page).toHaveURL('/');
  });
});
```

### `onboarding.spec.ts`
```typescript
test.describe('Onboarding', () => {
  test('completar onboarding de 3 pasos', async ({ page }) => {
    // Registrar usuario nuevo
    const email = `onboarding${Date.now()}@test.com`;
    await registrarUsuario(page, email, 'TestPass123!');
    
    // Paso 1: elegir tipo de prueba
    await page.click('[data-testid="prueba-mayores-25"]');
    await page.click('button:has-text("Continuar")');
    
    // Paso 2: elegir comunidad autónoma
    await page.selectOption('select[name="comunidad"]', 'Madrid');
    await page.click('button:has-text("Continuar")');
    
    // Paso 3: pantalla de bienvenida
    await expect(page.locator('h1')).toContainText('¡Bienvenido');
    await page.click('button:has-text("Empezar")');
    
    await expect(page).toHaveURL('/dashboard');
  });
});
```

### `subscription-gate.spec.ts`
```typescript
test.describe('Subscription gate', () => {
  test('sin suscripción redirige a checkout', async ({ page }) => {
    // Usuario sin suscripción
    await loginAs(page, process.env.TEST_USER_NO_SUB_EMAIL!, process.env.TEST_USER_NO_SUB_PASSWORD!);
    
    // Intentar acceder a práctica directamente
    await page.goto('/practice/some-materia-id');
    
    // Debe redirigir a checkout
    await expect(page).toHaveURL('/checkout');
  });

  test('con suscripción accede al dashboard', async ({ page }) => {
    await loginAs(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText(/Buenos días|Bienvenido/);
  });
});
```

### `practice.spec.ts`
```typescript
test.describe('Sesión de práctica', () => {
  test('completar sesión entera de una materia', async ({ page }) => {
    await loginAs(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
    
    // Ir al dashboard y seleccionar primera materia
    await page.goto('/dashboard');
    await page.click('[data-testid="materia-card"]:first-child button:has-text("Practicar")');
    
    // Esperar que carguen las preguntas
    await page.waitForSelector('[data-testid="pregunta-enunciado"]');
    
    // Responder 10 preguntas
    for (let i = 0; i < 10; i++) {
      const tipo = await page.getAttribute('[data-testid="pregunta-container"]', 'data-tipo');
      
      if (tipo === 'TEST') {
        await page.click('[data-testid="opcion"]:first-child');
        await page.click('button:has-text("Comprobar")');
      } else {
        await page.fill('textarea', 'Esta es mi respuesta de prueba.');
        await page.click('button:has-text("Enviar respuesta")');
      }
      
      // Esperar feedback
      await page.waitForSelector('[data-testid="feedback-ia"]');
      await page.click('button:has-text("Siguiente")');
    }
    
    // Resultado final
    await expect(page.locator('[data-testid="resultado-final"]')).toBeVisible();
    await expect(page.locator('[data-testid="porcentaje-acierto"]')).toBeVisible();
  });
});
```

---

## Variables de Entorno para Tests

Crear `apps/web/.env.test`:
```env
VITE_API_URL=http://localhost:3000
TEST_USER_EMAIL=admin@preprueba.es
TEST_USER_PASSWORD=TestPassword123!
TEST_USER_NO_SUB_EMAIL=noplan@test.com
TEST_USER_NO_SUB_PASSWORD=TestPassword123!
```

Estos usuarios deben existir en la DB de desarrollo. Crear un script para seedings de test:
`apps/api/prisma/seed-test-users.ts`

---

## Scripts en `package.json`

```json
"scripts": {
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:debug": "playwright test --debug"
}
```

---

## Criterio de Aceptación

- [ ] `npm run test:e2e` ejecuta sin fallos
- [ ] Test de registro crea usuario real en DB
- [ ] Test de práctica completa una sesión real con feedback de IA
- [ ] Test de subscription gate verifica el bloqueo correctamente
- [ ] Screenshots de fallos guardados en `test-results/`
- [ ] Tests corren en CI (GitHub Actions si se configura)

---

## Nota sobre data-testid

Si los elementos no tienen `data-testid`, el agente que ejecute esta SPEC debe añadirlos en los componentes necesarios. Usar atributos `data-testid` en: tarjetas de materia, botones de práctica, contenedor de pregunta, opciones, feedback de IA, resultado final.
