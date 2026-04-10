# Preprueba

SaaS para practicar pruebas de acceso a la universidad en España para mayores de 25, 40 y 45 años.

## Stack

- Frontend: React 19 + Vite
- Backend: Node.js + TypeScript + Express + Prisma
- Base de datos: PostgreSQL (Neon)
- IA: Groq API (`openai/gpt-oss-120b`)
- Pagos: Stripe
- Monitoring: Sentry

## Requisitos previos

- Node.js 20+
- npm 10+
- Base de datos PostgreSQL accesible desde Prisma
- API key de Groq
- Cuenta de Stripe en modo test

## Setup local

### 1. Instalar dependencias

```bash
cd apps/api
npm install

cd ../web
npm install
```

### 2. Configurar variables de entorno

Crear `apps/api/.env` a partir de `apps/api/.env.example`:

```bash
cd apps/api
copy .env.example .env
```

Variables mínimas para la API:

```env
DATABASE_URL="postgresql://user:password@host/preprueba?sslmode=require"
JWT_SECRET="cambiar-por-secreto-largo-aleatorio-64-caracteres"
GROQ_API_KEY="gsk_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID="price_..."
FRONTEND_URL="http://localhost:5173"
API_URL="http://localhost:3000"
PORT=3000
SENTRY_DSN="https://...@sentry.io/..."
```

Crear `apps/web/.env.local` para el frontend:

```env
VITE_API_URL=http://localhost:3000
VITE_SENTRY_DSN=https://...@sentry.io/...
```

`SENTRY_DSN` y `VITE_SENTRY_DSN` son opcionales en local, pero recomendables para probar monitoring antes del deploy.

### 3. Base de datos

```bash
cd apps/api
npx prisma migrate deploy
npm run db:seed
npm run generate:questions
```

`npm run generate:questions` rellena el banco con preguntas generadas por IA. En la configuración actual puede tardar varios minutos porque trabaja por lotes para respetar el rate limit de Groq.

### 4. Arrancar el proyecto

```bash
cd apps/api
npm run dev
```

```bash
cd apps/web
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:3000](http://localhost:3000)
- Health check API: [http://localhost:3000/health](http://localhost:3000/health)

## Stripe en local

El handoff deja esto como paso inmediato pendiente fuera del repositorio:

1. Crear el producto "Preprueba — Acceso completo" en Stripe y copiar `price_id` a `STRIPE_PRICE_ID`.
2. Copiar la secret key de test a `STRIPE_SECRET_KEY`.
3. Escuchar webhooks en local:

```bash
stripe listen --forward-to localhost:3000/stripe/webhook
```

4. Copiar el signing secret generado por Stripe CLI a `STRIPE_WEBHOOK_SECRET`.
5. Validar el flujo completo de registro, checkout y activación de suscripción.

## Admin

Para promocionar un usuario a admin:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'tu@email.com';
```

También puedes cargar usuarios de prueba para E2E:

```bash
cd apps/api
npm run db:seed:test-users
```

## Tests y comprobaciones

```bash
cd apps/api
npm run build
```

```bash
cd apps/web
npm run build
```

```bash
cd apps/web
npm run test:e2e
```

## Deploy

### API en Railway

1. Conectar el repositorio.
2. Seleccionar `apps/api` como servicio.
3. Configurar variables de entorno de producción:
   `DATABASE_URL`, `JWT_SECRET`, `GROQ_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`, `FRONTEND_URL`, `PORT`, `NODE_ENV=production`, `SENTRY_DSN`
4. Configurar `Health check path` como `/health`.
5. Ejecutar migraciones en producción con `npx prisma migrate deploy`.

### Frontend en Vercel

1. Conectar el repositorio.
2. Seleccionar `apps/web`.
3. Configurar:
   `VITE_API_URL`, `VITE_SENTRY_DSN`
4. Desplegar y comprobar que el frontend apunta a la API correcta.

## Checklist de deploy final

### Configuración

- [ ] `NODE_ENV=production` en Railway
- [ ] `SENTRY_DSN` configurado en Railway
- [ ] `VITE_SENTRY_DSN` configurado en Vercel
- [ ] `STRIPE_SECRET_KEY` es la clave live
- [ ] `STRIPE_WEBHOOK_SECRET` corresponde al webhook de producción
- [ ] `FRONTEND_URL` apunta al dominio real
- [ ] `JWT_SECRET` tiene 64 o más caracteres aleatorios

### Funcionalidad

- [ ] `GET /health` devuelve `status: "ok"` con la base de datos conectada
- [ ] Registro de usuario funciona en producción
- [ ] Checkout de Stripe funciona con una tarjeta real
- [ ] Sesión de práctica completa funciona
- [ ] El webhook de Stripe llega al endpoint correcto

### Seguridad

- [ ] `.env` no está versionado
- [ ] CORS solo permite el dominio del frontend
- [ ] Rate limiting en endpoints de auth
- [ ] Headers de seguridad básicos con Helmet.js

### Contenido

- [ ] Hay al menos 20 preguntas por materia en producción
- [ ] Política de privacidad y términos están accesibles
- [ ] Todo el copy está revisado en español ibérico
