import { load as loadHtml } from 'cheerio';
import AdmZip from 'adm-zip';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';

import type { CandidateLink, CrawlPage, DiscoveredAsset, ExtractedPdfAsset, SourceConfig } from './types';

const USER_AGENT = 'PrepruebaExamBot/1.0 (+https://preprueba.local)';
const REQUEST_TIMEOUT_MS = 30_000;

const DOCUMENT_URL_RE = /(\.pdf(?:$|[?#\s])|\.zip(?:$|[?#\s])|\.ashx(?:$|[?#\s])|\/documents\/|\/file\/|download(?:$|[?/"'\s]))/i;
const FOLLOW_KEYWORDS_RE = /(m25|mayores?[\s\-_/]*de?[\s\-_/]*25|mayores?[\s\-_/]*25|pam|examen|modelo|criter|correcci[oó]n|orient|programa|temario|convocator|ejercici|documentos|folder|2025|2024|2023|2022)/i;
const EXCLUDE_PAGE_RE = /(matr[ií]cula|inscripci[oó]n|beca|calendario|faq|preguntas frecuentes|universidad de mayores|curso preparatorio|noticia|blog|ranking|doctorado|master|m[aá]ster|grados?|aviso legal|cookies)/i;
const ADMIN_DOCUMENT_RE = /(horario|distribuci[oó]n|aulas?\b|consulta las aulas|adaptaci[oó]n(?:es)?|solicitud de adaptaci[oó]n|instrucciones?_?m25|instrucciones? para realizar el ex[aá]men)/i;
const M25_RE = /(m25|mayores?[\s\-_/]*de?[\s\-_/]*25|mayores?[\s\-_/]*25|pam)/i;
const M45_RE = /(m45|mayores?[\s\-_/]*de?[\s\-_/]*45)/i;
const M40_RE = /(m40|mayores?[\s\-_/]*de?[\s\-_/]*40)/i;
const EBAU_RE = /(\bebau\b|\bevau\b|\bpau\b(?!.*mayores)|\bselectividad\b)/i;

function getTimeoutSignal(ms: number): AbortSignal {
  return AbortSignal.timeout(ms);
}

export async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { 'user-agent': USER_AGENT },
    redirect: 'follow',
    signal: getTimeoutSignal(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`GET ${url} -> ${response.status}`);
  }

  return response.text();
}

export async function fetchBuffer(url: string): Promise<{ buffer: Buffer; contentType: string | null }> {
  const response = await fetch(url, {
    headers: { 'user-agent': USER_AGENT },
    redirect: 'follow',
    signal: getTimeoutSignal(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`GET ${url} -> ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    contentType: response.headers.get('content-type'),
  };
}

export function uniqueByUrl<T extends { url: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const item of items) {
    const key = normalizeUrl(item.url);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}

export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return url;
  }
}

export function buildCrawlQueue(config: SourceConfig): CrawlPage[] {
  return config.startUrls.map((url) => ({ url, depth: 0 }));
}

export function extractLinksFromHtml(html: string, baseUrl: string): CandidateLink[] {
  const $ = loadHtml(html);
  const links: CandidateLink[] = [];

  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (!href) return;

    const text = $(element).text().replace(/\s+/g, ' ').trim();
    const resolved = resolveUrl(baseUrl, href);
    if (!resolved) return;

    links.push({
      url: resolved,
      text,
      sourcePageUrl: baseUrl,
    });
  });

  return uniqueByUrl(links);
}

export function isAllowedDomain(url: string, config: SourceConfig): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return config.allowedDomains.some((domain) => host === domain || host.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

export function isDocumentLink(link: CandidateLink): boolean {
  return DOCUMENT_URL_RE.test(link.url) || DOCUMENT_URL_RE.test(link.text);
}

export function matchesPatternList(input: string, patterns?: RegExp[]): boolean {
  if (!patterns?.length) return true;
  return patterns.some((pattern) => pattern.test(input));
}

export function shouldAcceptDocumentCandidate(input: string, config: SourceConfig): boolean {
  if (!matchesPatternList(input, config.documentAllowPatterns)) return false;
  if (config.documentRejectPatterns?.some((pattern) => pattern.test(input))) return false;
  if (ADMIN_DOCUMENT_RE.test(input)) return false;
  return looksRelevantToM25(input);
}

export function shouldFollowLink(link: CandidateLink, config: SourceConfig): boolean {
  if (!isAllowedDomain(link.url, config)) return false;
  if (DOCUMENT_URL_RE.test(link.url)) return false;

  const haystack = `${link.url} ${link.text}`.toLowerCase();
  if (!matchesPatternList(haystack, config.pageAllowPatterns)) return false;
  if (config.pageRejectPatterns?.some((pattern) => pattern.test(haystack))) return false;
  if (!FOLLOW_KEYWORDS_RE.test(haystack)) return false;
  if (EXCLUDE_PAGE_RE.test(haystack)) return false;

  return true;
}

export function looksRelevantToM25(input: string): boolean {
  const normalized = input.toLowerCase();
  const mentionsM25 = M25_RE.test(normalized);
  if (M40_RE.test(normalized) || EBAU_RE.test(normalized)) {
    return false;
  }
  if (M45_RE.test(normalized) && !mentionsM25) return false;

  return mentionsM25 || /(examen|modelo|criter|orient|programa|temario|convocatoria|ejercicio)/i.test(normalized);
}

export function resolveUrl(baseUrl: string, maybeRelative: string): string | null {
  try {
    return new URL(maybeRelative, baseUrl).toString();
  } catch {
    return null;
  }
}

export function filenameFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const last = parsed.pathname.split('/').filter(Boolean).pop() ?? 'documento';
    return decodeURIComponent(last.replace(/\+/g, ' '));
  } catch {
    return 'documento';
  }
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 120);
}

export function storageSourceDir(uploadsRoot: string, source: SourceConfig): string {
  return path.join(uploadsRoot, slugify(source.community), slugify(source.university));
}

export function hashBuffer(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex').slice(0, 12);
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function removeDirIfExists(dirPath: string): Promise<void> {
  await fs.rm(dirPath, { recursive: true, force: true });
}

export async function savePdfBuffer(
  uploadsRoot: string,
  source: SourceConfig,
  year: number,
  documentType: string,
  subject: string,
  filenameSeed: string,
  buffer: Buffer,
): Promise<{ absolutePath: string; publicUrl: string }> {
  const fileName = `${slugify(documentType)}-${slugify(subject || filenameSeed)}-${hashBuffer(buffer)}.pdf`;
  const targetDir = path.join(
    uploadsRoot,
    slugify(source.community),
    slugify(source.university),
    String(year),
  );

  await ensureDir(targetDir);

  const absolutePath = path.join(targetDir, fileName);
  await fs.writeFile(absolutePath, buffer);

  const publicPath = path
    .relative(path.resolve(process.cwd(), 'uploads'), absolutePath)
    .split(path.sep)
    .join('/');

  return {
    absolutePath,
    publicUrl: `/uploads/${publicPath}`,
  };
}

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });

  try {
    const result = await parser.getText();
    return result.text.replace(/\s+/g, ' ').trim();
  } finally {
    await parser.destroy();
  }
}

export function extractPdfAssetsFromArchive(asset: DiscoveredAsset, buffer: Buffer): ExtractedPdfAsset[] {
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();

  return entries
    .filter((entry) => !entry.isDirectory && entry.entryName.toLowerCase().endsWith('.pdf'))
    .map((entry) => ({
      source: asset.source,
      sourceUrl: asset.officialUrl,
      downloadUrl: asset.downloadUrl,
      sourcePageUrl: asset.sourcePageUrl,
      anchorText: asset.anchorText,
      pageContext: asset.pageContext,
      filename: path.basename(entry.entryName),
      pdfBuffer: entry.getData(),
    }));
}

export function createPdfAsset(asset: DiscoveredAsset, buffer: Buffer): ExtractedPdfAsset {
  return {
    source: asset.source,
    sourceUrl: asset.officialUrl,
    downloadUrl: asset.downloadUrl,
    sourcePageUrl: asset.sourcePageUrl,
    anchorText: asset.anchorText,
    pageContext: asset.pageContext,
    filename: filenameFromUrl(asset.downloadUrl ?? asset.officialUrl),
    pdfBuffer: buffer,
  };
}

export function cleanText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function extractPageContext(html: string): string {
  const $ = loadHtml(html);
  const fragments = [
    $('title').first().text(),
    $('h1').first().text(),
    ...$('h2')
      .slice(0, 4)
      .map((_, element) => $(element).text())
      .get(),
  ];

  return cleanText(fragments.filter(Boolean).join(' '));
}
