# SPEC-05 — Stripe End-to-End
> Prioridad: 🟠 Alta · Estimación: 2-4h
> **Depende de SPEC-02 (infra). Sin Stripe funcionando, nadie puede pagar.**

---

## Contexto

El código de Stripe ya existe en el backend (`routes/stripe.ts`, `services/stripe.ts`, middleware `subscription.ts`). El frontend tiene `CheckoutPage.tsx` y `SettingsPage.tsx` con el portal.

El objetivo es verificar que el flujo completo funciona de extremo a extremo: registro → trial → checkout → webhook → acceso liberado.

---

## Archivos de Referencia

| Archivo | Propósito |
|---------|-----------|
| `apps/api/src/routes/stripe.ts` | Endpoints: checkout, portal, webhook |
| `apps/api/src/services/stripe.ts` | Lógica de Stripe |
| `apps/api/src/middleware/subscription.ts` | Bloquea acceso sin suscripción |
| `apps/web/src/pages/Checkout/CheckoutPage.tsx` | Página de pago |
| `apps/web/src/pages/Settings/SettingsPage.tsx` | Portal de gestión |

---

## Lo que NO tocar

- Lógica de negocio del backend — si el código está bien, solo verificar
- UI de checkout y settings — no cambiar
- Schema de Prisma

---

## Configuración Stripe (Prerrequisito)

### 1. Crear producto en Stripe dashboard

- Ir a Stripe → Products → Create product
- Nombre: "Preprueba — Acceso completo"
- Precio: 9,99€ / mes (recurrente)
- Copiar `price_ID` → ponerlo en `STRIPE_PRICE_ID`

### 2. Configurar webhook

- Stripe → Webhooks → Add endpoint
- URL: `https://[tu-railway-url]/stripe/webhook`
- Eventos a escuchar:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- Copiar `Signing secret` → `STRIPE_WEBHOOK_SECRET`

### 3. Stripe CLI para pruebas locales

```bash
stripe listen --forward-to localhost:3000/stripe/webhook
```

---

## Flujo a Verificar

```
1. Usuario se registra → onboarding completado
2. Redirige a /checkout (o puede acceder desde settings)
3. Clic en "Empezar prueba gratuita" → POST /stripe/checkout
4. Backend crea checkout.session → devuelve URL de Stripe
5. Usuario completa pago (con tarjeta de test: 4242 4242 4242 4242)
6. Stripe envía webhook checkout.session.completed
7. Backend crea registro en tabla subscriptions (status: ACTIVE o TRIALING)
8. Usuario es redirigido a /dashboard
9. GET /materias ahora funciona (subscription middleware lo permite)
10. Usuario cancela → portal → subscription.status = CANCELLED
11. Stripe envía webhook → backend actualiza status
12. Acceso bloqueado en siguiente renovación
```

---

## Posibles Problemas y Fixes

### Webhook no llega al backend local
```bash
# Usar Stripe CLI en desarrollo:
stripe listen --forward-to localhost:3000/stripe/webhook
# Copiar el webhook secret que imprime el CLI → STRIPE_WEBHOOK_SECRET temporal
```

### Error "No such price" en checkout
- Verificar que `STRIPE_PRICE_ID` coincide con el environment (test vs live)
- En desarrollo usar precios test (empiezan con `price_test_...` o simplemente `price_...` de test mode)

### Middleware bloquea pero usuario tiene suscripción
- Verificar que webhook llegó y se creó el registro en `subscriptions`
- Query: `SELECT * FROM subscriptions WHERE "userId" = '...'`
- Verificar que `status = 'ACTIVE'` o `status = 'TRIALING'`

### CORS en webhook
- Los webhooks de Stripe no envían CORS — no es problema. El error vendría del `stripe.webhooks.constructEvent` si el secret es incorrecto.

---

## Verificación del Middleware

El middleware `subscription.ts` debe bloquear si:
- No hay token → 401
- Token válido pero sin suscripción → 403 con `{ error: "Suscripción requerida" }`
- Suscripción con status `CANCELLED` o `PAST_DUE` → 403
- Suscripción `ACTIVE` o `TRIALING` → pasa

Verificar que las rutas protegidas son: `GET /materias`, `POST /sesiones/*`, `GET /stats/*`

---

## Criterio de Aceptación

- [ ] `POST /stripe/checkout` devuelve URL de Stripe válida
- [ ] Completar pago con tarjeta test `4242 4242 4242 4242` crea suscripción en DB
- [ ] `GET /materias` devuelve 403 sin suscripción y 200 con suscripción activa
- [ ] `GET /stripe/portal` devuelve URL al portal de Stripe
- [ ] Cancelar suscripción actualiza `subscription.status` en DB
- [ ] `invoice.payment_failed` pone status `PAST_DUE` y bloquea acceso

---

## Tarjetas de Test Stripe

| Tarjeta | Comportamiento |
|---------|---------------|
| `4242 4242 4242 4242` | Pago exitoso |
| `4000 0000 0000 0002` | Pago rechazado |
| `4000 0025 0000 3155` | Requiere autenticación 3D Secure |
| `4000 0000 0000 9995` | Insuficiente saldo |

Usar cualquier fecha futura y cualquier CVC de 3 dígitos.
