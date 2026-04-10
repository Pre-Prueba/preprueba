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
  respuestaEsperada?: string;
}

const TEMARIOS: Record<string, string> = {
  'Lengua Castellana y Literatura': 'sintaxis oracional, morfología, análisis de textos literarios, comentario de texto, ortografía y normas de puntuación',
  'Historia de España': 'Prehistoria en la Península, civilizaciones prerromanas, Roma, Visigodos, Al-Ándalus, Reconquista, Reyes Católicos, Imperio español, siglos XVIII-XIX, Restauración, Guerra Civil, Franquismo, Transición democrática',
  'Inglés': 'grammar (tenses, conditionals, passive voice), reading comprehension, vocabulary (B1-B2 level), writing skills',
  'Matemáticas': 'números reales, álgebra, ecuaciones, inecuaciones, geometría analítica, funciones, estadística descriptiva, probabilidad',
  'Historia de la Filosofía': 'filosofía griega (Sócrates, Platón, Aristóteles), filosofía moderna (Descartes, Hume, Kant), ética, política, lógica proposicional',
  'Geografía': 'relieve e hidrografía española, climas y vegetación, demografía española, geografía política de España y la UE, economía española',
  'Física': 'cinemática, dinámica newtoniana, trabajo y energía, termodinámica básica, electrostática, corriente eléctrica, óptica geométrica',
  'Química': 'estructura atómica, tabla periódica, enlace químico, reacciones químicas, estequiometría, ácidos y bases, química orgánica básica',
  'Biología': 'célula eucariota y procariota, mitosis y meiosis, genética mendeliana, ADN y herencia, evolución, ecosistemas, organización del cuerpo humano',
  'Historia del Arte': 'arte griego y romano, arte medieval (románico y gótico), Renacimiento italiano y español, Barroco, Goya, arte del siglo XX en España',
  'Matemáticas Aplicadas a las CCSS': 'estadística descriptiva, probabilidad, funciones, cálculo financiero básico, matrices, programación lineal',
};

const PAUSA_ENTRE_LOTES_MS = 9000; // Groq free tier: 8.000 TPM — esperar reset
const PAUSA_ENTRE_MATERIAS_MS = 5000;

function buildPrompt(nombreMateria: string, lote: number): string {
  const temario = TEMARIOS[nombreMateria] || nombreMateria;
  return `Eres un experto en pruebas de acceso a la universidad para adultos en España (mayores de 25, 40 y 45 años). Lote ${lote} de 2.

Genera exactamente 10 preguntas de "${nombreMateria}". Temario: ${temario}

Reglas:
- 9 tipo TEST (4 opciones, solo 1 correcta, opciones claramente diferenciadas)
- 1 tipo ABIERTA (respuesta de 2-4 líneas esperada)
- Mezcla de dificultad: BASICO, INTERMEDIO, AVANZADO
- Español de España (no latinoamericano)

Responde SOLO con JSON válido, sin texto antes ni después:
{"preguntas":[{"enunciado":"texto","tipo":"TEST","dificultad":"BASICO","opciones":[{"texto":"A","esCorrecta":false,"orden":0},{"texto":"B","esCorrecta":true,"orden":1},{"texto":"C","esCorrecta":false,"orden":2},{"texto":"D","esCorrecta":false,"orden":3}]},{"enunciado":"texto abierta","tipo":"ABIERTA","dificultad":"INTERMEDIO","respuestaEsperada":"respuesta de referencia"}]}`;
}

async function guardarPreguntas(materiaId: string, preguntas: PreguntaGenerada[]): Promise<void> {
  for (const pregunta of preguntas) {
    await prisma.pregunta.create({
      data: {
        materiaId,
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
}

async function pedirLote(nombreMateria: string, lote: number, intento = 1): Promise<PreguntaGenerada[]> {
  const MAX_INTENTOS = 3;

  const response = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [{ role: 'user', content: buildPrompt(nombreMateria, lote) }],
    temperature: 0.5,
    max_tokens: 3200,
  });

  const content = response.choices[0]?.message?.content ?? '';

  // Extraer el bloque JSON más externo
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) {
    if (intento < MAX_INTENTOS) {
      console.log(`  ⚠ Sin JSON (intento ${intento}), reintentando...`);
      await new Promise((r) => setTimeout(r, 3000));
      return pedirLote(nombreMateria, lote, intento + 1);
    }
    throw new Error(`JSON no encontrado tras ${MAX_INTENTOS} intentos`);
  }

  try {
    const data = JSON.parse(match[0]) as { preguntas: PreguntaGenerada[] };
    if (!data.preguntas?.length) throw new Error('Array vacío');
    return data.preguntas;
  } catch {
    if (intento < MAX_INTENTOS) {
      console.log(`  ⚠ JSON inválido (intento ${intento}), reintentando...`);
      await new Promise((r) => setTimeout(r, 4000));
      return pedirLote(nombreMateria, lote, intento + 1);
    }
    throw new Error(`JSON malformado tras ${MAX_INTENTOS} intentos`);
  }
}

async function generarPreguntas(materia: { id: string; nombre: string }): Promise<void> {
  let total = 0;

  for (let lote = 1; lote <= 2; lote++) {
    console.log(`  Lote ${lote}/2 — ${materia.nombre}...`);

    const preguntas = await pedirLote(materia.nombre, lote);
    await guardarPreguntas(materia.id, preguntas);
    total += preguntas.length;
    console.log(`  ✓ ${preguntas.length} guardadas (lote ${lote})`);

    if (lote < 2) {
      process.stdout.write(`  Esperando ${PAUSA_ENTRE_LOTES_MS / 1000}s (TPM reset)...`);
      await new Promise((r) => setTimeout(r, PAUSA_ENTRE_LOTES_MS));
      process.stdout.write(' OK\n');
    }
  }

  console.log(`  ✓ Total: ${total} preguntas para "${materia.nombre}"\n`);
}

async function main() {
  console.log('Iniciando generación de preguntas...\n');

  const materias = await prisma.materia.findMany({ where: { activa: true } });

  for (const materia of materias) {
    const existing = await prisma.pregunta.count({ where: { materiaId: materia.id } });
    if (existing >= 20) {
      console.log(`  Saltando "${materia.nombre}" (ya tiene ${existing} preguntas)`);
      continue;
    }
    await generarPreguntas(materia);
    await new Promise((r) => setTimeout(r, PAUSA_ENTRE_MATERIAS_MS));
  }

  const total = await prisma.pregunta.count();
  console.log(`\nGeneración completa. Total en DB: ${total} preguntas`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
