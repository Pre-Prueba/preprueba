import OpenAI from 'openai';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

interface FeedbackResult {
  correcta: boolean;
  explicacion: string;
  nivel: 'básico' | 'intermedio' | 'avanzado';
}

const SYSTEM_PROMPT = `Eres un corrector experto de las pruebas de acceso a la universidad de España para mayores de 25, 40 y 45 años.

Se te proporciona:
- La pregunta
- La respuesta que dio el estudiante
- La respuesta correcta

Tu tarea:
1. Confirmar si la respuesta del estudiante es correcta
2. Explicar el concepto de forma clara, en máximo 3 frases, nivel bachillerato
3. Indicar el nivel de dificultad de la pregunta

Responde ÚNICAMENTE con un JSON válido, sin texto adicional, sin markdown, sin backticks:
{"correcta": boolean, "explicacion": "string", "nivel": "básico|intermedio|avanzado"}`;

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
      explicacion: 'No se pudo generar una explicación en este momento.',
      nivel: 'intermedio',
    };
  }
}
