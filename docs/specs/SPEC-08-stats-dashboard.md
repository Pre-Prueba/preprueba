# SPEC-08 — Stats + Dashboard con Datos Reales
> Prioridad: 🟡 Media · Estimación: 2-3h
> **Depende de SPEC-02 (DB) y SPEC-04 (práctica funcionando). Sin sesiones reales, no hay stats.**

---

## Contexto

El `DashboardPage.tsx` y `StatsPage.tsx` tienen mock data de fallback cuando la API falla o el usuario no tiene sesiones. Con la DB real y sesiones completadas (SPEC-04), estos componentes deben mostrar datos reales.

El backend ya tiene `GET /stats/resumen` que calcula sesiones, aciertos, racha y progreso por materia.

---

## Archivos a Tocar

| Archivo | Acción |
|---------|--------|
| `apps/web/src/pages/Dashboard/DashboardPage.tsx` | Eliminar mock data, usar solo datos reales |
| `apps/web/src/pages/Stats/StatsPage.tsx` | Eliminar mock data, usar solo datos reales |
| `apps/web/src/services/api.ts` | Verificar función `getStats()` |

---

## Lo que NO tocar

- La UI visual de ambas páginas — mantener los mismos componentes
- El backend de stats — ya está correcto
- Otros componentes

---

## Comportamiento Esperado

### Dashboard — Estado vacío (sin sesiones)
Cuando el usuario nunca ha practicado:
- Mostrar mensaje de bienvenida motivador: "¡Empieza tu primera práctica!"
- Botón CTA a cada materia
- Stats: 0 sesiones, 0% precisión — no mostrar como error

### Dashboard — Con datos reales
- Progreso por materia: % de aciertos en las últimas 5 sesiones de esa materia
- Racha: días consecutivos con al menos 1 sesión
- Últimas sesiones completadas (fecha, materia, % acierto)

### Stats — Estado vacío
- "Aún no tienes estadísticas. Completa tu primera práctica."
- No mostrar gráficos vacíos rotos

### Stats — Con datos reales
- `sesionesTotal`: número de sesiones completadas
- `precisionGlobal`: (aciertos totales / respuestas totales) × 100
- `racha`: días consecutivos
- Por materia: mejor racha, % promedio, tendencia (→ calculada backend)

---

## Limpieza de Mock Data

### En DashboardPage.tsx, buscar y eliminar:
```typescript
// Cualquier bloque como:
const mockMaterias = [
  { id: '1', nombre: 'Lengua', progreso: 65, ... },
  ...
];
// O:
const fallbackStats = { sesiones: 12, accuracy: 71, ... };
```

Reemplazar por estado de carga + estado vacío:
```typescript
const [stats, setStats] = useState<StatsResumen | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  getStats()
    .then(setStats)
    .catch(() => setStats(null))
    .finally(() => setLoading(false));
}, []);

if (loading) return <Spinner />;
if (!stats || stats.sesionesTotal === 0) return <EmptyState />;
```

### En StatsPage.tsx, misma lógica.

---

## Componente EmptyState

Crear o adaptar un componente simple para estado vacío:
```tsx
function EmptyStatsDashboard() {
  return (
    <div style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
      <p style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-muted)' }}>
        Aún no has completado ninguna práctica
      </p>
      <p>Elige una materia para empezar</p>
    </div>
  );
}
```

---

## Verificar Endpoint de Stats

```bash
# Con usuario que tiene sesiones:
curl http://localhost:3000/stats/resumen \
  -H "Authorization: Bearer $TOKEN"
```

Debe devolver:
```json
{
  "sesionesTotal": 3,
  "respuestasTotales": 30,
  "aciertos": 21,
  "precisionGlobal": 70,
  "racha": 2,
  "porMateria": [
    {
      "materiaId": "...",
      "nombre": "Historia de España",
      "sesiones": 2,
      "precision": 75,
      "tendencia": "mejorando"
    }
  ]
}
```

Si el endpoint devuelve estructura diferente, ajustar el frontend para mapear correctamente.

---

## Criterio de Aceptación

- [ ] Dashboard no tiene mock data hardcodeado
- [ ] Stats no tiene mock data hardcodeado
- [ ] Usuario sin sesiones ve estado vacío claro (no pantalla rota)
- [ ] Usuario con sesiones ve datos correctos (verificar manualmente)
- [ ] Racha se calcula correctamente (días con sesión)
- [ ] Progreso por materia en dashboard refleja últimas sesiones
- [ ] Loading state visible mientras carga la API

---

## Test Manual

1. Crear usuario nuevo → ir a dashboard → debe verse estado vacío (no datos falsos)
2. Completar 2-3 sesiones de práctica
3. Volver a dashboard → verificar que el progreso ha cambiado
4. Ir a stats → verificar que los números coinciden con las sesiones realizadas
5. Comparar "precisión" en stats con el porcentaje de las sesiones individuales
