import OpenAI from 'openai';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

interface FeedbackResult {
  correcta: boolean;
  conceptos: string;
  explicacion: string;
  valoracion: string;
}

const SYSTEM_PROMPT = `Eres un corrector experto de las pruebas de acceso a la universidad de España.

Se te proporciona:
- La pregunta
- La respuesta que dio el estudiante
- La respuesta correcta

Tu tarea:
1. Confirmar si la respuesta del estudiante es correcta (true o false).
2. 'conceptos': Identificar en una frase corta los conceptos clave evaluados.
3. 'explicacion': Explicar por qué es correcta o incorrecta de forma clara, nivel bachillerato.
4. 'valoracion': Dar un pequeño feedback motivador o corrección directa.

Responde ÚNICAMENTE con un JSON válido, sin texto adicional, sin markdown, sin backticks:
{"correcta": boolean, "conceptos": "string", "explicacion": "string", "valoracion": "string"}`;

export async function generarFeedback(
  enunciado: string,
  respuestaUsuario: string,
  respuestaCorrecta: string
): Promise<FeedbackResult> {
  const userMessage = `Pregunta: ${enunciado}\nRespuesta del estudiante: ${respuestaUsuario}\nRespuesta correcta: ${respuestaCorrecta}`;

  try {
    const response = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      max_tokens: 300,
      temperature: 0.3,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    });

    const text = response.choices[0]?.message?.content ?? '';
    return JSON.parse(text) as FeedbackResult;
  } catch {
    return {
      correcta: respuestaUsuario === respuestaCorrecta,
      conceptos: 'Evaluación manual requerida.',
      explicacion: 'No se pudo generar una explicación estructurada en este momento.',
      valoracion: 'Ocurrió un error en la conexión con la IA de corrección.',
    };
  }
}

const TIPS_SYSTEM_PROMPT = `Eres un coach de estudios experto. 
Analiza el desempeño del estudiante por materia y da exactamente 3 consejos cortos, directos y motivadores para mejorar.
Enfócate en las materias con menor porcentaje de acierto.

Responde ÚNICAMENTE con un array JSON de strings, sin texto adicional:
["consejo 1", "consejo 2", "consejo 3"]`;

export async function generarTipsEstudo(statsPorMateria: any[]): Promise<string[]> {
  const statsSummary = statsPorMateria
    .map(m => `${m.materiaNombre}: ${m.porcentajeAcierto}% (Tendencia: ${m.tendencia})`)
    .join('\n');

  try {
    const response = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      max_tokens: 200,
      temperature: 0.5,
      messages: [
        { role: 'system', content: TIPS_SYSTEM_PROMPT },
        { role: 'user', content: `Estadísticas del estudiante:\n${statsSummary}` },
      ],
    });

    const text = response.choices[0]?.message?.content ?? '[]';
    return JSON.parse(text) as string[];
  } catch {
    return [
      "Sigue practicando las materias con menor acierto.",
      "Revisa tus errores en el historial para no repetirlos.",
      "Mantén tu racha diaria para consolidar el conocimiento."
    ];
  }
}
