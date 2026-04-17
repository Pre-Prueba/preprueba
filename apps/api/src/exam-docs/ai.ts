import OpenAI from 'openai';

import type { AiMetadataResult } from './types';

const SYSTEM_PROMPT = `Eres un catalogador documental. Analiza SOLO el contenido oficial proporcionado y devuelve JSON válido.

Objetivo: catalogar documentos oficiales de acceso para mayores de 25 años en España.

Reglas:
- No inventes nada.
- Si un dato no aparece o no es suficientemente claro, usa null.
- documentType debe ser uno de:
  EXAMEN_OFICIAL, MODELO, CONVOCATORIA_ANTERIOR, ORIENTACIONES, CRITERIOS_CORRECCION, SOLUCIONARIO
- isMayores25 debe ser true solo si el documento corresponde a mayores de 25.
- Si detectas material de mayores de 40, mayores de 45, EBAU, EvAU o selectividad general, marca isMayores25 como false si el documento NO es realmente M25.
- Devuelve exactamente este JSON:
{"title":string|null,"subject":string|null,"university":string|null,"community":string|null,"year":number|null,"call":string|null,"documentType":string|null,"isMayores25":boolean|null,"hasOptionAB":boolean|null,"confidence":number|null}`;

function getClient(): { client: OpenAI; model: string } | null {
  if (process.env.GROQ_API_KEY) {
    return {
      client: new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
      }),
      model: process.env.EXAM_DOCS_AI_MODEL ?? 'openai/gpt-oss-120b',
    };
  }

  if (process.env.OPENAI_API_KEY) {
    return {
      client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
      model: process.env.EXAM_DOCS_AI_MODEL ?? 'gpt-4o-mini',
    };
  }

  return null;
}

function safeParse(content: string): AiMetadataResult | null {
  try {
    return JSON.parse(content) as AiMetadataResult;
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]) as AiMetadataResult;
    } catch {
      return null;
    }
  }
}

export async function enrichMetadataWithAI(input: {
  sourceName: string;
  sourceUrl: string;
  sourcePageUrl: string;
  anchorText: string;
  filename: string;
  pdfText: string;
}): Promise<AiMetadataResult | null> {
  const runtime = getClient();
  if (!runtime) return null;

  try {
    const response = await runtime.client.chat.completions.create({
      model: runtime.model,
      temperature: 0.1,
      max_tokens: 400,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            `sourceName: ${input.sourceName}`,
            `sourceUrl: ${input.sourceUrl}`,
            `sourcePageUrl: ${input.sourcePageUrl}`,
            `anchorText: ${input.anchorText || '(sin texto)'}`,
            `filename: ${input.filename}`,
            `pdfText:`,
            input.pdfText.slice(0, 6000),
          ].join('\n'),
        },
      ],
    });

    const content = response.choices[0]?.message?.content ?? '';
    return safeParse(content);
  } catch {
    return null;
  }
}
