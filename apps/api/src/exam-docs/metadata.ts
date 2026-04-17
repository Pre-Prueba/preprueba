import { TipoDocumento } from '@prisma/client';

import type { HeuristicMetadata, SourceConfig } from './types';
import { cleanText, filenameFromUrl } from './utils';

const SUBJECT_RULES: Array<{ subject: string; patterns: RegExp[] }> = [
  { subject: 'Comentario de Texto', patterns: [/comentario[\s\-_/]*de[\s\-_/]*texto/i, /comentario texto/i] },
  { subject: 'Lengua Castellana y Literatura', patterns: [/lengua castellana/i, /\bcastellano\b/i, /\blengua española\b/i] },
  { subject: 'Inglés', patterns: [/\bingl[eé]s\b/i] },
  { subject: 'Francés', patterns: [/\bfranc[eé]s\b/i] },
  { subject: 'Italiano', patterns: [/\bitaliano\b/i] },
  { subject: 'Portugués', patterns: [/\bportugu[eé]s\b/i] },
  { subject: 'Valenciano', patterns: [/\bvalenciano\b/i] },
  { subject: 'Alemán', patterns: [/\balem[aá]n\b/i] },
  { subject: 'Historia de la Filosofía', patterns: [/historia de la filosof[ií]a/i, /\bfilosof[ií]a\b/i] },
  { subject: 'Historia del Arte', patterns: [/historia del arte/i] },
  { subject: 'Historia de España', patterns: [/historia de espa[nñ]a/i] },
  { subject: 'Historia de España', patterns: [/\bhistoria\b/i] },
  { subject: 'Geografía', patterns: [/\bgeograf[ií]a\b/i] },
  { subject: 'Geología', patterns: [/\bgeolog[ií]a\b/i] },
  { subject: 'Biología', patterns: [/\bbiolog[ií]a\b/i] },
  { subject: 'Física', patterns: [/\bf[ií]sica\b/i] },
  { subject: 'Química', patterns: [/\bqu[ií]mica\b/i] },
  { subject: 'Matemáticas', patterns: [/\bmatem[aá]ticas\b/i] },
  { subject: 'Matemáticas Aplicadas a las Ciencias Sociales', patterns: [/matem[aá]ticas aplicadas/i, /cc\.?\s*ss/i] },
  { subject: 'Dibujo Técnico', patterns: [/dibujo t[eé]cnico/i] },
  { subject: 'Dibujo Artístico', patterns: [/dibujo art[ií]stico/i] },
  { subject: 'Técnicas de Expresión Plástica', patterns: [/t[eé]cnicas.*expresi[oó]n pl[aá]stica/i] },
  { subject: 'Ciencias de la Tierra y del Medio Ambiente', patterns: [/ciencias? de la tierra/i, /medio ambiente/i, /\bctma\b/i] },
  { subject: 'Introducción al Derecho', patterns: [/introducci[oó]n al derecho/i, /\bderecho\b/i] },
  { subject: 'Tecnología Industrial', patterns: [/tecnolog[ií]a industrial/i] },
  { subject: 'Literatura Universal', patterns: [/literatura universal/i] },
  { subject: 'Tema General de Actualidad', patterns: [/tema general de actualidad/i] },
  { subject: 'Economía de la Empresa', patterns: [/econom[ií]a de la empresa/i, /empresa y dise[nñ]o/i, /empresa\b/i] },
];

const OPTION_A_RE = /opci[oó]n\s*a\b/i;
const OPTION_B_RE = /opci[oó]n\s*b\b/i;
const M25_RE = /(m25|mayores?[\s\-_/]*de?[\s\-_/]*25|mayores?[\s\-_/]*25|pam)/i;
const M40_RE = /(m40|mayores?[\s\-_/]*de?[\s\-_/]*40)/i;
const M45_RE = /(m45|mayores?[\s\-_/]*de?[\s\-_/]*45)/i;
const EBAU_RE = /(\bebau\b|\bevau\b|\bpau\b(?!.*mayores)|\bselectividad\b)/i;
const NOISY_TITLE_RE = /^(descargar pdf|\.\.\/file-system\/small\/pdf|pdf\b)/i;

function detectSubject(input: string): string | null {
  for (const rule of SUBJECT_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(input))) {
      return rule.subject;
    }
  }

  return null;
}

function detectYear(input: string): number | null {
  const matches = input.match(/(?<!\d)(20\d{2}|19\d{2})(?!\d)/g);
  if (!matches?.length) return null;

  const maxAllowedYear = new Date().getFullYear();
  const years = matches
    .map((value) => Number(value))
    .filter((value) => value >= 2000 && value <= maxAllowedYear);
  return years.length ? Math.max(...years) : null;
}

function detectCall(input: string): string | null {
  if (/dana/i.test(input)) return 'dana';
  if (/extraordinaria/i.test(input)) return 'extraordinaria';
  if (/septiembre/i.test(input)) return 'septiembre';
  if (/ordinaria/i.test(input)) return 'ordinaria';
  if (/junio/i.test(input)) return 'junio';
  if (/mayo/i.test(input)) return 'mayo';
  return null;
}

function detectDocumentType(input: string): TipoDocumento | null {
  if (/soluci[oó]n|solucionario|respuestas/i.test(input)) return TipoDocumento.SOLUCIONARIO;
  if (/criteri|correcci[oó]n/i.test(input)) return TipoDocumento.CRITERIOS_CORRECCION;
  if (/orientaci[oó]n|temario|programa/i.test(input)) return TipoDocumento.ORIENTACIONES;
  if (/modelo/i.test(input)) return TipoDocumento.MODELO;
  if (/convocatoria anterior|convocatorias anteriores/i.test(input)) return TipoDocumento.CONVOCATORIA_ANTERIOR;
  if (/examen|ejercicio|prueba/i.test(input)) return TipoDocumento.EXAMEN_OFICIAL;
  return null;
}

function detectTitle(input: string): string | null {
  const firstSentence = cleanText(input.split(/[.|\n]/)[0] ?? '');
  if (!firstSentence || firstSentence.length < 8) return null;
  if (firstSentence.length > 180) return null;
  return firstSentence;
}

function decodePdfSegmentFromUrl(url: string): string | null {
  try {
    const decoded = decodeURIComponent(url.replace(/\+/g, ' '));
    const match = decoded.match(/([^/]+\.pdf)(?:\/|$)/i);
    if (!match?.[1]) return null;
    return match[1];
  } catch {
    return null;
  }
}

function normalizeFileLabel(input: string | null): string | null {
  if (!input) return null;

  const normalized = cleanText(
    input
      .replace(/\.(pdf|zip|ashx)(?:\?.*)?$/i, '')
      .replace(/[-_/]+/g, ' ')
      .replace(/\s+/g, ' '),
  );

  if (!normalized || normalized.length < 6) return null;
  return normalized;
}

function isNoisyTitle(value: string): boolean {
  return NOISY_TITLE_RE.test(value) || value.length < 8;
}

function detectPreferredTitle(params: {
  anchorText: string;
  sourceUrl: string;
  filename: string;
  pdfText: string;
}): string | null {
  const anchorTitle = cleanText(params.anchorText);
  if (anchorTitle && !isNoisyTitle(anchorTitle)) {
    return anchorTitle;
  }

  const urlTitle = normalizeFileLabel(decodePdfSegmentFromUrl(params.sourceUrl));
  if (urlTitle) {
    return urlTitle;
  }

  const filenameTitle = normalizeFileLabel(params.filename);
  if (filenameTitle) {
    return filenameTitle;
  }

  const pdfTitle = detectTitle(params.pdfText);
  if (pdfTitle && !isNoisyTitle(pdfTitle)) {
    return pdfTitle;
  }

  return null;
}

export function extractCompoundSubjectsFromPdfText(pdfText: string): string[] {
  const matches = new Set<string>();
  const patterns = [
    /Asignatura:\s*([^:]+?)\s+Tiempo m[aá]ximo/gi,
    /Ejercicio de\s+(.+?)\s+Tiempo m[aá]ximo/gi,
  ];

  for (const pattern of patterns) {
    for (const match of pdfText.matchAll(pattern)) {
      const subject = detectSubject(cleanText(match[1] ?? ''));
      if (subject) {
        matches.add(subject);
      }
    }
  }

  return Array.from(matches);
}

export function extractHeuristicMetadata(params: {
  source: SourceConfig;
  sourceUrl: string;
  sourcePageUrl: string;
  anchorText: string;
  filename: string;
  pageContext: string;
  pdfText: string;
}): HeuristicMetadata {
  const filename = filenameFromUrl(params.sourceUrl);
  const fileHaystack = cleanText(
    [
      params.anchorText,
      params.filename,
      filename,
      params.sourceUrl,
    ].join(' '),
  );
  const pageHaystack = cleanText(
    [
      params.pageContext,
      params.sourcePageUrl,
    ].join(' '),
  );
  const pdfHaystack = cleanText(params.pdfText.slice(0, 4000));
  const fullHaystack = cleanText([fileHaystack, pageHaystack, pdfHaystack].join(' '));

  const title =
    detectPreferredTitle({
      anchorText: params.anchorText,
      sourceUrl: params.sourceUrl,
      filename: params.filename || filename,
      pdfText: params.pdfText,
    }) ?? cleanText(params.anchorText || filename);

  return {
    title,
    subject: detectSubject(fileHaystack) ?? detectSubject(pageHaystack) ?? detectSubject(pdfHaystack),
    year: detectYear(fileHaystack) ?? detectYear(pageHaystack) ?? detectYear(pdfHaystack),
    call: detectCall(fileHaystack) ?? detectCall(pageHaystack) ?? detectCall(pdfHaystack),
    documentType: detectDocumentType(fileHaystack) ?? detectDocumentType(pdfHaystack) ?? detectDocumentType(pageHaystack),
    mentionsM25: M25_RE.test(fullHaystack),
    mentionsM40: M40_RE.test(fullHaystack),
    mentionsM45: M45_RE.test(fullHaystack),
    mentionsEbau: EBAU_RE.test(fullHaystack),
    hasOptionAB: OPTION_A_RE.test(fullHaystack) && OPTION_B_RE.test(fullHaystack),
  };
}
