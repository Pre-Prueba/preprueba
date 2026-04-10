# SPEC-10 — Monitoring + Deploy Final
> Prioridad: 🟢 Baja · Estimación: 3-5h
> **Última SPEC. El proyecto debe estar 100% funcional antes de esta.**

---

## Contexto

Antes del lanzamiento de septiembre 2026 necesitamos:
1. Error tracking para saber cuando algo falla en producción
2. Health check para monitorizar que la API está viva
3. README actualizado para que cualquier dev pueda arrancar el proyecto
4. Checklist de deploy final

---

## Archivos a Crear / Modificar

| Archivo | Acción |
|---------|--------|
| `apps/api/src/index.ts` | Añadir endpoint `/health` |
| `apps/api/src/index.ts` | Inicializar Sentry (si se usa) |
| `apps/web/src/main.tsx` | Inicializar Sentry frontend (si se usa) |
| `README.md` | Actualizar con setup completo |

---

## 1. Health Check Endpoint

```typescript
// En apps/api/src/index.ts
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      db: 'connected',
    });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});
```

Railway usa este endpoint para restart automático si cae.
Configurar en Railway: `Health check path: /health`

---

## 2. Sentry (Error Tracking)

### Crear cuenta en sentry.io
- Proyecto tipo Node.js (para la API)
- Proyecto tipo React (para el frontend)
- Plan gratuito tiene 5.000 errors/mes — suficiente para MVP

### Backend (`apps/api`)
```bash
npm install @sentry/node
```

```typescript
// apps/api/src/index.ts — al inicio, antes de rutas
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 0.1, // 10% de requests
});
```

Variable en Railway: `SENTRY_DSN=https://...@sentry.io/...`

### Frontend (`apps/web`)
```bash
npm install @sentry/react
```

```typescript
// apps/web/src/main.tsx — antes de ReactDOM.createRoot
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

Variable en Vercel: `VITE_SENTRY_DSN=https://...@sentry.io/...`

---

## 3. README.md Actualizado

El README debe permitir a cualquier dev arrancar el proyecto desde cero:

```markdown
# Preprueba

SaaS para practicar pruebas de acceso a la universidad en España (mayores de 25/40/45 años).

## Stack
- Frontend: React 19 + Vite
- Backend: Node.js + TypeScript + Express + Prisma
- DB: PostgreSQL (Neon)
- IA: Groq API (modelo: openai/gpt-oss-120b)
- Pagos: Stripe

## Setup Local

### Prerrequisitos
- Node.js 20+
- Cuenta en Neon (DB gratuita)
- API key de Groq (groq.com)
- Cuenta de Stripe (modo test)

### 1. Clonar e instalar
\`\`\`bash
git clone [repo]
cd preprueba
cd apps/api && npm install
cd ../web && npm install
\`\`\`

### 2. Variables de entorno
\`\`\`bash
cp apps/api/.env.example apps/api/.env
# Editar con tus valores reales
\`\`\`

### 3. Base de datos
\`\`\`bash
cd apps/api
npx prisma migrate deploy
npx prisma db seed
npm run generate:questions  # Genera preguntas con IA (~5 min)
\`\`\`

### 4. Arrancar
\`\`\`bash
# Terminal 1 (API)
cd apps/api && npm run dev

# Terminal 2 (Web)
cd apps/web && npm run dev
\`\`\`

App en: http://localhost:5173
API en: http://localhost:3000

## Deploy

- **API:** Railway — conectar repo, seleccionar apps/api, configurar variables
- **Frontend:** Vercel — conectar repo, seleccionar apps/web, configurar VITE_API_URL

## Admin

Para crear un admin, ejecutar en la DB:
\`\`\`sql
UPDATE users SET role = 'ADMIN' WHERE email = 'tu@email.com';
\`\`\`
```

---

## 4. Checklist de Deploy Final

Antes de anunciar el lanzamiento, verificar todo esto:

### Configuración
- [ ] `NODE_ENV=production` en Railway
- [ ] `SENTRY_DSN` configurado en Railway y Vercel
- [ ] `STRIPE_SECRET_KEY` es la clave **live** (no test)
- [ ] `STRIPE_WEBHOOK_SECRET` corresponde al webhook de producción
- [ ] `FRONTEND_URL` apunta al dominio real (no localhost)
- [ ] `JWT_SECRET` es una cadena aleatoria de 64+ caracteres

### Funcionalidad
- [ ] `GET /health` devuelve `{ status: "ok" }`
- [ ] Registro de usuario funciona en producción
- [ ] Pago con tarjeta real funciona (test con cantidad pequeña)
- [ ] Sesión de práctica completa funciona
- [ ] Webhook de Stripe llega al endpoint correcto

### Seguridad
- [ ] `.env` no está en el repositorio
- [ ] CORS solo permite el dominio del frontend
- [ ] Rate limiting en endpoints de auth (prevenir brute force)
- [ ] Headers de seguridad básicos (Helmet.js)

### Contenido
- [ ] Al menos 20 preguntas por materia en producción
- [ ] Política de privacidad y términos accesibles
- [ ] Copy revisado en español ibérico

---

## Criterio de Aceptación

- [ ] `GET /health` responde `200 ok` con DB conectada
- [ ] Sentry captura errores de prueba (lanzar error manual)
- [ ] README permite setup desde cero en menos de 30 minutos
- [ ] Checklist de deploy completado al 100%
- [ ] Dominio real configurado (si se tiene: preprueba.es)
