# SPEC-01 — Troca IA: Anthropic → Groq
> Prioridad: 🔴 BLOQUEANTE · Estimación: 1-2h
> **Sin esto, la corrección de respuestas no funciona.**

---

## Contexto

El proyecto usa `@anthropic-ai/sdk` en `apps/api/src/services/claude.ts`. No tenemos API key de Anthropic. Groq es compatible con el SDK de OpenAI (misma interfaz, distinta base URL). El modelo elegido es `openai/gpt-oss-120b`.

La función actual devuelve `{ correcta: boolean, explicacion: string, nivel: string }`. Esa interfaz NO cambia — solo cambia la implementación interna.

---

## Archivos a Tocar

| Archivo | Acción |
|---------|--------|
| `apps/api/src/services/claude.ts` | Reescribir internamente. Mantener exports. |
| `apps/api/package.json` | Eliminar `@anthropic-ai/sdk`, añadir `openai` |
| `apps/api/.env.example` | Cambiar `ANTHROPIC_API_KEY` → `GROQ_API_KEY` |
| `apps/api/src/index.ts` | Verificar que no importa nada de Anthropic directamente |

---

## Lo que NO tocar

- La firma de la función `corregirRespuesta()` — la mantienen igual
- Las rutas (`routes/sesiones.ts`) — no saben nada de la IA
- El schema de Prisma — no cambia nada
- El frontend — no se entera del cambio

---

## Implementación

### 1. Cambiar dependencia

```bash
cd apps/api
npm uninstall @anthropic-ai/sdk
npm install openai
```

### 2. Reescribir `apps/api/src/services/claude.ts`

```typescript
import OpenAI from 'openai';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const SYSTEM_PROMPT = `Eres un corrector experto de pruebas de acceso a la universidad en España 
(pruebas para mayores de 25, 40 y 45 años). Tu tarea es evaluar la respuesta de un alumno y 
devolver un JSON con este formato exacto, sin texto adicional:
{
  "correcta": true | false,
  "explicacion": "Explicación clara y pedagógica en español de España (máximo 3 frases)",
  "nivel": "correcto" | "parcial" | "incorrecto"
}
Sé justo, pedagógico y usa lenguaje accesible para adultos que estudian por su cuenta.`;

interface FeedbackIA {
  correcta: boolean;
  explicacion: string;
  nivel: string;
}

export async function corregirRespuesta(
  enunciado: string,
  respuestaCorrecta: string,
  respuestaUsuario: string,
  tipoPregunta: 'TEST' | 'ABIERTA'
): Promise<FeedbackIA> {
  const userMessage = tipoPregunta === 'TEST'
    ? `Pregunta: ${enunciado}\nRespuesta correcta: ${respuestaCorrecta}\nRespuesta del alumno: ${respuestaUsuario}`
    : `Pregunta de respuesta abierta: ${enunciado}\nRespuesta esperada (referencia): ${respuestaCorrecta}\nRespuesta del alumno: ${respuestaUsuario}`;

  const response = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: 300,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Respuesta vacía del modelo');

  const parsed = JSON.parse(content) as FeedbackIA;
  return parsed;
}
```

### 3. Actualizar `.env.example`

Cambiar:
```
ANTHROPIC_API_KEY="sk-ant-..."
```
Por:
```
GROQ_API_KEY="gsk_..."
```

---

## Criterio de Aceptación

- [ ] `npm install` sin errores en `apps/api`
- [ ] Llamar a `corregirRespuesta()` devuelve `{ correcta, explicacion, nivel }` válido
- [ ] No hay imports de `@anthropic-ai/sdk` en ningún archivo
- [ ] Variable de entorno `GROQ_API_KEY` configurada en `.env`
- [ ] Respuesta en menos de 5 segundos

---

## Test Manual

```bash
# En apps/api, con GROQ_API_KEY configurado:
npx ts-node -e "
const { corregirRespuesta } = require('./src/services/claude');
corregirRespuesta(
  '¿En qué año se aprobó la Constitución española?',
  '1978',
  '1977',
  'TEST'
).then(console.log).catch(console.error);
"
```

Debe devolver algo como:
```json
{
  "correcta": false,
  "explicacion": "La Constitución española fue aprobada en referéndum el 6 de diciembre de 1978, no en 1977. Ese año se celebraron las primeras elecciones democráticas.",
  "nivel": "incorrecto"
}
```
