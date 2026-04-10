# SPEC-03 — Banco de Preguntas (Generación por IA)
> Prioridad: 🔴 BLOQUEANTE · Estimación: 3-5h
> **Sin preguntas, el flujo de práctica no sirve de nada.**

---

## Contexto

El schema de Prisma ya tiene los modelos `Pregunta` y `Opcion`. El seed actual (`apps/api/prisma/seed.ts`) solo inserta las 11 `Materia`. No hay ninguna pregunta en la base de datos.

**Objetivo:** Crear un script que use Groq (`openai/gpt-oss-120b`) para generar 20 preguntas por materia (18 TEST + 2 ABIERTA), validarlas y cargarlas en la DB.

Total esperado: 11 materias × 20 preguntas = **220 preguntas mínimas**.

---

## Archivos a Crear / Modificar

| Archivo | Acción |
|---------|--------|
| `apps/api/prisma/generate-questions.ts` | CREAR — script principal de generación |
| `apps/api/prisma/seed.ts` | MODIFICAR — llamar a generación si no hay preguntas |
| `apps/api/package.json` | Añadir script `"generate:questions"` |

---

## Lo que NO tocar

- `schema.prisma` — no cambia
- Servicios existentes — el script es autónomo
- Rutas de la API — no cambia nada en producción

---

## Temario por Materia

El prompt de generación debe incluir el contexto específico de cada materia:

| Materia | Temario clave |
|---------|--------------|
| Lengua Castellana | Sintaxis, morfología, textos literarios, comentario de texto, ortografía |
| Historia de España | Prehistoria, Roma, Al-Ándalus, Reyes Católicos, siglos XIX-XX, Transición, democracia |
| Inglés | Grammar, reading comprehension, vocabulary, writing |
| Matemáticas | Álgebra, geometría, estadística, funciones, cálculo básico |
| Filosofía | Platón, Aristóteles, Descartes, Kant, ética, lógica |
| Geografía | España y Europa: relieve, clima, población, economía, política |
| Física | Cinemática, dinámica, energía, electricidad, óptica |
| Química | Tabla periódica, reacciones, estequiometría, química orgánica básica |
| Biología | Célula, genética, evolución, ecosistemas, cuerpo humano |
| Historia del Arte | Arte griego, romano, románico, gótico, Renacimiento, Barroco, arte moderno español |
| Economía | Microeconomía, macroeconomía, mercados, empresa, economía española y europea |

---

## Implementación

### `apps/api/prisma/generate-questions.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

interface PreguntaGenerada {
  enunciado: string;
  tipo: 'TEST' | 'ABIERTA';
  dificultad: 'BASICO' | 'INTERMEDIO' | 'AVANZADO';
  opciones?: { texto: string; esCorrecta: boolean; orden: number }[];
  respuestaEsperada?: string; // para preguntas abiertas, usada como referencia en corrección
}

const TEMARIOS: Record<string, string> = {
  'Lengua Castellana': 'sintaxis oracional, morfología, análisis de textos literarios, comentario de texto, ortografía y normas de puntuación',
  'Historia de España': 'Prehistoria en la Península, civilizaciones prerromanas, Roma, Visigodos, Al-Ándalus, Reconquista, Reyes Católicos, Imperio español, siglos XVIII-XIX, Restauración, Guerra Civil, Franquismo, Transición democrática',
  'Lengua Extranjera (Inglés)': 'grammar (tenses, conditionals, passive voice), reading comprehension, vocabulary (B1-B2 level), writing skills',
  'Matemáticas': 'números reales, álgebra, ecuaciones, inecuaciones, geometría analítica, funciones, estadística descriptiva, probabilidad',
  'Filosofía': 'filosofía griega (Sócrates, Platón, Aristóteles), filosofía moderna (Descartes, Hume, Kant), ética, política, lógica proposicional',
  'Geografía': 'relieve e hidrografía española, climas y vegetación, demografía española, geografía política de España y la UE, economía española',
  'Física': 'cinemática, dinámica newtoniana, trabajo y energía, termodinámica básica, electrostática, corriente eléctrica, óptica geométrica',
  'Química': 'estructura atómica, tabla periódica, enlace químico, reacciones químicas, estequiometría, ácidos y bases, química orgánica básica',
  'Biología': 'célula eucariota y procariota, mitosis y meiosis, genética mendeliana, ADN y herencia, evolución, ecosistemas, organización del cuerpo humano',
  'Historia del Arte': 'arte griego y romano, arte medieval (románico y gótico), Renacimiento italiano y español, Barroco, Goya, arte del siglo XX en España',
  'Economía': 'oferta y demanda, tipos de mercado, empresa y formas jurídicas, macroeconomía (PIB, inflación, desempleo), economía española y europea',
};

async function generarPreguntas(materia: { id: string; nombre: string }): Promise<void> {
  const temario = TEMARIOS[materia.nombre] || materia.nombre;

  const prompt = `Eres un experto en pruebas de acceso a la universidad para adultos en España (mayores de 25, 40 y 45 años).
  
Genera exactamente 20 preguntas de la materia "${materia.nombre}" para estas pruebas.

Temario a cubrir: ${temario}

Reglas:
- 18 preguntas tipo TEST (4 opciones, solo 1 correcta)
- 2 preguntas tipo ABIERTA (respuesta corta de 2-5 líneas)
- Distribuir dificultad: 8 BASICO, 8 INTERMEDIO, 4 AVANZADO
- Usar español de España (no latinoamericano)
- Las preguntas TEST deben tener opciones claramente diferenciadas
- Las preguntas ABIERTAS deben incluir una respuesta de referencia en "respuestaEsperada"

Devuelve SOLO un JSON válido con este formato exacto:
{
  "preguntas": [
    {
      "enunciado": "texto de la pregunta",
      "tipo": "TEST",
      "dificultad": "BASICO",
      "opciones": [
        { "texto": "opción A", "esCorrecta": false, "orden": 0 },
        { "texto": "opción B", "esCorrecta": true, "orden": 1 },
        { "texto": "opción C", "esCorrecta": false, "orden": 2 },
        { "texto": "opción D", "esCorrecta": false, "orden": 3 }
      ]
    },
    {
      "enunciado": "pregunta abierta...",
      "tipo": "ABIERTA",
      "dificultad": "INTERMEDIO",
      "respuestaEsperada": "La respuesta esperada es..."
    }
  ]
}`;

  console.log(`  Generando preguntas para: ${materia.nombre}...`);

  const response = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 8000,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error(`Sin respuesta para ${materia.nombre}`);

  const data = JSON.parse(content) as { preguntas: PreguntaGenerada[] };

  if (!data.preguntas || data.preguntas.length === 0) {
    throw new Error(`No se generaron preguntas para ${materia.nombre}`);
  }

  for (const pregunta of data.preguntas) {
    await prisma.pregunta.create({
      data: {
        materiaId: materia.id,
        enunciado: pregunta.enunciado,
        tipo: pregunta.tipo,
        dificultad: pregunta.dificultad,
        fuente: 'GENERADA',
        activa: true,
        opciones: pregunta.tipo === 'TEST' && pregunta.opciones
          ? {
              create: pregunta.opciones.map((op) => ({
                texto: op.texto,
                esCorrecta: op.esCorrecta,
                orden: op.orden,
              })),
            }
          : undefined,
      },
    });
  }

  console.log(`  ✓ ${data.preguntas.length} preguntas creadas para ${materia.nombre}`);
}

async function main() {
  console.log('Iniciando generación de preguntas...\n');

  const materias = await prisma.materia.findMany({ where: { activa: true } });

  for (const materia of materias) {
    const existing = await prisma.pregunta.count({ where: { materiaId: materia.id } });
    if (existing >= 20) {
      console.log(`  Saltando ${materia.nombre} (ya tiene ${existing} preguntas)`);
      continue;
    }
    await generarPreguntas(materia);
    // Pausa entre materias para no saturar la API
    await new Promise((r) => setTimeout(r, 2000));
  }

  const total = await prisma.pregunta.count();
  console.log(`\nGeneración completa. Total de preguntas en DB: ${total}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Script en `package.json`

```json
"scripts": {
  "generate:questions": "ts-node -r tsconfig-paths/register prisma/generate-questions.ts"
}
```

---

## Ejecución

```bash
cd apps/api

# Asegurarse de tener GROQ_API_KEY en .env
# Asegurarse de haber ejecutado SPEC-02 (DB con materias)

npm run generate:questions
```

El script:
1. Lee todas las materias activas
2. Salta las que ya tienen ≥20 preguntas (reanudable si falla)
3. Genera 20 preguntas por materia via Groq
4. Inserta en DB con opciones para las TEST
5. Pausa 2 segundos entre materias

---

## Criterio de Aceptación

- [ ] Script ejecuta sin errores
- [ ] 220+ preguntas en tabla `preguntas`
- [ ] Cada materia tiene exactamente 20 preguntas
- [ ] Las preguntas TEST tienen 4 opciones (1 correcta)
- [ ] Las preguntas están en español de España
- [ ] Script es reanudable (no duplica si ya existen)
- [ ] `GET /materias` devuelve las materias
- [ ] `POST /sesiones/iniciar` devuelve 10 preguntas reales de la DB

---

## Verificación Rápida

```sql
-- En Neon o Prisma Studio:
SELECT m.nombre, COUNT(p.id) as total_preguntas
FROM materias m
LEFT JOIN preguntas p ON p."materiaId" = m.id
GROUP BY m.nombre
ORDER BY m.nombre;
```

Debe mostrar 20 para cada materia.
