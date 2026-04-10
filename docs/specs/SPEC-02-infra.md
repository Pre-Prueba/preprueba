# SPEC-02 — Infraestructura Real (DB + Deploy)
> Prioridad: 🔴 BLOQUEANTE · Estimación: 2-4h
> **Sin DB real, nada persiste. Sin deploy, nadie accede.**

---

## Contexto

El proyecto tiene el código completo pero nunca ha corrido contra una base de datos real. Necesitamos:
1. PostgreSQL en Neon (gratis, serverless)
2. Variables de entorno reales
3. `prisma migrate` ejecutado
4. Seed de materias cargado
5. Deploy: Railway (API) + Vercel (web)

---

## Archivos de Referencia

| Archivo | Propósito |
|---------|-----------|
| `apps/api/prisma/schema.prisma` | Schema completo — no modificar |
| `apps/api/prisma/seed.ts` | Seed de 11 materias — ejecutar |
| `apps/api/.env.example` | Template de variables |
| `apps/api/src/index.ts` | Entry point del servidor |
| `apps/web/vite.config.ts` | Config Vite — verificar proxy API |

---

## Lo que NO tocar

- El schema de Prisma — ya está correcto
- El seed de materias — ya está correcto
- Rutas del backend — no cambian
- Código del frontend — no cambia

---

## Pasos de Implementación

### 1. Crear base de datos en Neon

1. Ir a [neon.tech](https://neon.tech) → crear proyecto "preprueba"
2. Copiar `DATABASE_URL` (formato: `postgresql://user:pass@host/preprueba?sslmode=require`)

### 2. Configurar variables de entorno

Crear `apps/api/.env` con:
```env
DATABASE_URL="postgresql://..."       # De Neon
JWT_SECRET="generar-con-openssl-rand-base64-32"
JWT_EXPIRES_IN="7d"
GROQ_API_KEY="gsk_..."               # De console.groq.com
STRIPE_SECRET_KEY="sk_test_..."      # De Stripe dashboard
STRIPE_WEBHOOK_SECRET="whsec_..."    # De Stripe webhooks
STRIPE_PRICE_ID="price_..."          # ID del precio 9,99€/mes
FRONTEND_URL="http://localhost:5173"
API_URL="http://localhost:3000"
PORT=3000
```

Crear `apps/web/.env`:
```env
VITE_API_URL="http://localhost:3000"
```

### 3. Ejecutar migraciones

```bash
cd apps/api
npx prisma migrate deploy
# O si es primera vez:
npx prisma migrate dev --name init
```

### 4. Ejecutar seed de materias

```bash
cd apps/api
npx prisma db seed
```

Verificar: debe insertar 11 materias en la tabla `materias`.

### 5. Verificar que el servidor arranca

```bash
cd apps/api
npm run dev
```

Debe mostrar: `Server running on port 3000` y `Prisma connected`.

### 6. Verificar que el frontend conecta

```bash
cd apps/web
npm run dev
```

Ir a `http://localhost:5173` → registro → login debe funcionar (crear usuario real en DB).

### 7. Deploy Railway (API)

1. Ir a [railway.app](https://railway.app) → nuevo proyecto → conectar repo → seleccionar `apps/api`
2. Configurar variables de entorno (las mismas del `.env`)
3. Build command: `npm run build`
4. Start command: `npm start`
5. Añadir `prisma migrate deploy` como release command (o en el start script)
6. Copiar URL del deploy (ej: `https://preprueba-api.railway.app`)

### 8. Deploy Vercel (Web)

1. Ir a [vercel.com](https://vercel.com) → nuevo proyecto → conectar repo → seleccionar `apps/web`
2. Variable de entorno: `VITE_API_URL=https://preprueba-api.railway.app`
3. Build command: `npm run build`
4. Output dir: `dist`
5. Copiar URL del deploy (ej: `https://preprueba.vercel.app`)

### 9. Actualizar FRONTEND_URL en Railway

Volver a Railway → variables → actualizar `FRONTEND_URL=https://preprueba.vercel.app`

---

## Criterio de Aceptación

- [ ] `prisma migrate` ejecutado sin errores
- [ ] 11 materias visibles en la tabla `materias` (via Prisma Studio o query directa)
- [ ] `POST /auth/register` crea usuario real en DB
- [ ] `POST /auth/login` devuelve JWT válido
- [ ] `GET /materias` devuelve lista (requiere suscripción activa o ajustar para prueba)
- [ ] Frontend deployado en Vercel accesible
- [ ] API deployada en Railway respondiendo en `/health` o `/auth/me`

---

## Checklist de Variables de Entorno

| Variable | Dónde obtener |
|----------|--------------|
| `DATABASE_URL` | Neon dashboard → Connection string |
| `JWT_SECRET` | `openssl rand -base64 32` en terminal |
| `GROQ_API_KEY` | console.groq.com → API Keys |
| `STRIPE_SECRET_KEY` | dashboard.stripe.com → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → endpoint secret |
| `STRIPE_PRICE_ID` | Stripe → Products → crear producto 9,99€/mes → copiar price ID |
