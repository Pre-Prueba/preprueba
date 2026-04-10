# SPEC-04 — Wiring Página de Práctica
> Prioridad: 🟠 Alta · Estimación: 2-3h
> **Depende de SPEC-01 (IA), SPEC-02 (DB) y SPEC-03 (preguntas).**

---

## Contexto

La página `PracticePage.tsx` tiene toda la UI construida y funciona con **mock data**. Los endpoints de sesiones ya existen en el backend (`POST /sesiones/iniciar`, `POST /sesiones/:id/responder`, `POST /sesiones/:id/finalizar`).

El trabajo consiste en reemplazar los datos falsos por llamadas reales a la API.

---

## Archivos a Tocar

| Archivo | Acción |
|---------|--------|
| `apps/web/src/pages/Practice/PracticePage.tsx` | Reemplazar mock data por llamadas API |
| `apps/web/src/services/api.ts` (o equivalente) | Verificar / añadir funciones de sesiones |

---

## Lo que NO tocar

- La UI de PracticePage — la lógica visual se mantiene igual
- Los estados del componente (loading, question, feedback, result) — permanecen
- El backend — ya está correcto
- Otros componentes

---

## Flujo Actual (Mock) vs Flujo Real

### Flujo actual (mock)
```
Usuario entra → se cargan preguntas hardcoded → responde → feedback hardcoded → resultado
```

### Flujo real a implementar
```
Usuario entra → POST /sesiones/iniciar → recibe { sesionId, preguntas[] }
             → Por cada respuesta: POST /sesiones/:id/responder → recibe { feedbackIA, esCorrecta }
             → Al terminar: POST /sesiones/:id/finalizar → recibe { aciertos, total, porcentaje }
```

---

## Implementación

### 1. Añadir funciones en el servicio API

En `apps/web/src/services/api.ts` (o donde estén las llamadas), añadir:

```typescript
// Iniciar sesión de práctica
export async function iniciarSesion(materiaId: string) {
  const res = await fetch(`${API_URL}/sesiones/iniciar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ materiaId }),
  });
  if (!res.ok) throw new Error('Error al iniciar sesión');
  return res.json(); // { sesionId, preguntas: Pregunta[] }
}

// Responder una pregunta
export async function responderPregunta(sesionId: string, payload: {
  preguntaId: string;
  opcionId?: string;
  respuestaTexto?: string;
  tiempoRespuesta?: number;
}) {
  const res = await fetch(`${API_URL}/sesiones/${sesionId}/responder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al enviar respuesta');
  return res.json(); // { esCorrecta, feedbackIA, nivel }
}

// Finalizar sesión
export async function finalizarSesion(sesionId: string) {
  const res = await fetch(`${API_URL}/sesiones/${sesionId}/finalizar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error('Error al finalizar sesión');
  return res.json(); // { aciertos, totalPreguntas, porcentaje }
}
```

### 2. Modificar `PracticePage.tsx`

**Quitar:**
- Import o definición de mock data (preguntas hardcodeadas)
- Mock de feedback local

**Añadir en `useEffect` de inicio:**
```typescript
useEffect(() => {
  async function cargar() {
    try {
      const { sesionId, preguntas } = await iniciarSesion(materiaId!);
      setSesionId(sesionId);
      setPreguntas(preguntas);
      setEstado('pregunta');
    } catch (error) {
      setError('No se pudo cargar la práctica. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }
  cargar();
}, [materiaId]);
```

**Al responder cada pregunta:**
```typescript
async function handleResponder(opcionId?: string, textoLibre?: string) {
  setEstado('cargando-feedback');
  try {
    const feedback = await responderPregunta(sesionId!, {
      preguntaId: preguntaActual.id,
      opcionId,
      respuestaTexto: textoLibre,
      tiempoRespuesta: calcularTiempoRespuesta(),
    });
    setFeedbackActual(feedback);
    setEstado('feedback');
  } catch {
    setError('Error al corregir la respuesta. Inténtalo de nuevo.');
  }
}
```

**Al terminar todas las preguntas:**
```typescript
async function handleFinalizar() {
  const resultado = await finalizarSesion(sesionId!);
  setResultado(resultado);
  setEstado('resultado');
}
```

---

## Casos a Manejar

| Caso | Comportamiento |
|------|---------------|
| Sin suscripción activa | API devuelve 403 → redirigir a `/checkout` |
| Error de red al responder | Mostrar mensaje de error, permitir reintentar |
| Sesión ya completada | No permitir continuar, ir a resultado |
| Pregunta ABIERTA | Mostrar textarea, enviar `respuestaTexto` |
| Pregunta TEST | Mostrar 4 opciones, enviar `opcionId` |

---

## Criterio de Aceptación

- [ ] Entrar a `/practice/:materiaId` carga preguntas reales desde la DB
- [ ] Responder una pregunta TEST devuelve feedback de Groq
- [ ] Responder una pregunta ABIERTA devuelve feedback de Groq
- [ ] Al terminar las 10 preguntas se muestra resultado real (% de aciertos)
- [ ] La sesión queda guardada en DB (`sesiones.completada = true`)
- [ ] Sin suscripción → redirige a `/checkout`
- [ ] No hay mock data en el componente

---

## Test Manual

1. Crear usuario y suscripción de prueba (o usar Stripe test mode)
2. Ir a dashboard → seleccionar una materia → clic en "Practicar"
3. Verificar que aparecen preguntas reales (no las de demo)
4. Responder todas → verificar feedback de IA
5. Ver resultado final → verificar que coincide con respuestas correctas
6. Ir a stats → verificar que la sesión aparece en el historial
