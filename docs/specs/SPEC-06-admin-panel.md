# SPEC-06 — Admin Panel Web
> Prioridad: 🟡 Media · Estimación: 6-10h
> **Depende de SPEC-02 (infra). Permite curar y ampliar el banco de preguntas.**

---

## Contexto

El banco de preguntas inicial es generado por IA (SPEC-03). Para añadir preguntas reales (de exámenes oficiales) y moderar la calidad, necesitamos un panel de administración web con interfaz simple.

Este panel es solo para administradores — usuarios normales nunca lo ven.

---

## Cambios de Schema

Añadir campo `role` al modelo `User`:

```prisma
enum UserRole {
  USER
  ADMIN
}

model User {
  // ... campos existentes ...
  role  UserRole @default(USER)
}
```

**Requiere migration:** `npx prisma migrate dev --name add-user-role`

---

## Archivos a Crear / Modificar

### Backend

| Archivo | Acción |
|---------|--------|
| `apps/api/prisma/schema.prisma` | Añadir enum `UserRole` y campo `role` a User |
| `apps/api/src/middleware/admin.ts` | CREAR — middleware requireAdmin |
| `apps/api/src/routes/admin.ts` | CREAR — rutas CRUD de preguntas + import CSV |
| `apps/api/src/index.ts` | Registrar ruta `/admin` |

### Frontend

| Archivo | Acción |
|---------|--------|
| `apps/web/src/pages/Admin/AdminPage.tsx` | CREAR — lista de preguntas |
| `apps/web/src/pages/Admin/PreguntaForm.tsx` | CREAR — formulario crear/editar |
| `apps/web/src/pages/Admin/ImportCSV.tsx` | CREAR — importar desde CSV |
| `apps/web/src/App.tsx` | Añadir ruta `/admin` con guard de rol |

---

## Lo que NO tocar

- Rutas existentes del backend — solo añadir `/admin`
- Páginas de usuario normal — no se tocan
- Design system — usar los mismos tokens CSS

---

## Backend — Middleware Admin

### `apps/api/src/middleware/admin.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // requireAuth ya habrá puesto req.userId
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  next();
}
```

## Backend — Rutas Admin

### `apps/api/src/routes/admin.ts`

Endpoints:

```
GET    /admin/preguntas          → lista paginada (page, limit, materiaId, tipo, activa)
GET    /admin/preguntas/:id      → detalle con opciones
POST   /admin/preguntas          → crear pregunta con opciones
PUT    /admin/preguntas/:id      → editar pregunta
PATCH  /admin/preguntas/:id/toggle → activar/desactivar
DELETE /admin/preguntas/:id      → eliminar (soft: activa=false)
POST   /admin/preguntas/import   → importar CSV (multipart/form-data)
GET    /admin/stats              → totales por materia
```

Todos requieren `requireAuth` + `requireAdmin`.

### Formato CSV para import

```csv
materia,enunciado,tipo,dificultad,opcionA,opcionB,opcionC,opcionD,correcta,respuestaEsperada
Lengua Castellana,"¿Cuál es el sujeto de la oración?",TEST,BASICO,"El niño","La niña","Nosotros","Ellos",A,
Historia de España,"Explica la Reconquista brevemente",ABIERTA,INTERMEDIO,,,,,,"La Reconquista fue el proceso..."
```

---

## Frontend — Páginas Admin

### AdminPage.tsx (lista)
- Tabla con: materia, enunciado (truncado), tipo, dificultad, fuente, activa, acciones
- Filtros: por materia, por tipo (TEST/ABIERTA), por activa/inactiva
- Paginación (25 por página)
- Botones: "Nueva pregunta", "Importar CSV"
- Por fila: editar, activar/desactivar

### PreguntaForm.tsx (crear/editar)
- Select de materia
- Textarea para enunciado
- Select tipo (TEST/ABIERTA)
- Select dificultad
- Si TEST: 4 inputs de opciones + radio para marcar cuál es la correcta
- Si ABIERTA: textarea para respuesta esperada (referencia)
- Botón guardar

### ImportCSV.tsx
- Input file (`.csv`)
- Preview de las primeras 5 filas parseadas
- Botón confirmar → llama a `POST /admin/preguntas/import`
- Resultado: N insertadas, M con error (con detalle)

### Ruta protegida en App.tsx
```tsx
<Route path="/admin" element={
  <AdminGuard>  {/* redirige si user.role !== 'ADMIN' */}
    <AdminPage />
  </AdminGuard>
} />
```

---

## Cómo Crear el Primer Admin

```sql
-- En Neon o Prisma Studio, tras registrar tu cuenta:
UPDATE users SET role = 'ADMIN' WHERE email = 'tu@email.com';
```

No hay UI para esto — se hace directamente en DB por seguridad.

---

## Criterio de Aceptación

- [ ] Migration `add-user-role` ejecutada sin errores
- [ ] Usuario con `role = ADMIN` accede a `/admin`
- [ ] Usuario con `role = USER` recibe 403 al intentar `/admin/preguntas`
- [ ] CRUD de preguntas funciona (crear, editar, desactivar)
- [ ] Import CSV inserta preguntas correctamente
- [ ] CSV con errores muestra fila por fila qué falló sin abortar todo
- [ ] Las preguntas `activa = false` no aparecen en sesiones de práctica

---

## Verificación

```bash
# Crear pregunta via API
curl -X POST http://localhost:3000/admin/preguntas \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "materiaId": "...",
    "enunciado": "¿En qué año...",
    "tipo": "TEST",
    "dificultad": "BASICO",
    "opciones": [
      {"texto": "1975", "esCorrecta": false, "orden": 0},
      {"texto": "1978", "esCorrecta": true, "orden": 1},
      {"texto": "1980", "esCorrecta": false, "orden": 2},
      {"texto": "1982", "esCorrecta": false, "orden": 3}
    ]
  }'
```
