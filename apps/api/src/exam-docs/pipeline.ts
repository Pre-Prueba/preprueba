import { DocumentoStatus, PrismaClient, TipoDocumento } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';

import { enrichMetadataWithAI } from './ai';
import { discoverAssetsForSource } from './collectors';
import { extractCompoundSubjectsFromPdfText, extractHeuristicMetadata } from './metadata';
import { SOURCE_CONFIGS } from './sourceConfigs';
import type {
  BuiltExamDocument,
  DiscoveredAsset,
  ExtractedPdfAsset,
  IngestRunOptions,
  IngestRunSummary,
  SourceConfig,
  SourceRunSummary,
} from './types';
import {
  cleanText,
  createPdfAsset,
  ensureDir,
  extractPdfAssetsFromArchive,
  extractPdfText,
  fetchBuffer,
  removeDirIfExists,
  savePdfBuffer,
  storageSourceDir,
} from './utils';

const prisma = new PrismaClient();
const UPLOADS_ROOT = path.resolve(process.cwd(), 'uploads', 'exam-docs');
const MANIFEST_PATH = path.resolve(UPLOADS_ROOT, 'manifest.json');
const MIN_PUBLISHED_YEAR = new Date().getFullYear() - 3;
const NOISY_TITLE_RE = /^(descargar pdf|\.\.\/file-system\/small\/pdf|pdf\b)/i;

function log(verbose: boolean | undefined, message: string): void {
  if (verbose) console.log(message);
}

async function downloadAndExpandAsset(asset: DiscoveredAsset, verbose?: boolean): Promise<ExtractedPdfAsset[]> {
  try {
    const downloadUrl = asset.downloadUrl ?? asset.officialUrl;
    log(verbose, `  ↳ Downloading ${downloadUrl}`);
    const { buffer, contentType } = await fetchBuffer(downloadUrl);
    const lowerUrl = downloadUrl.toLowerCase();

    if (lowerUrl.endsWith('.zip') || contentType?.includes('zip')) {
      return extractPdfAssetsFromArchive(asset, buffer);
    }

    return [createPdfAsset(asset, buffer)];
  } catch (error) {
    log(verbose, `  ↳ Download failed ${asset.officialUrl}: ${(error as Error).message}`);
    return [];
  }
}

function mergeDocumentType(
  heuristicType: TipoDocumento | null,
  aiType: TipoDocumento | null,
): TipoDocumento | null {
  return heuristicType ?? aiType ?? null;
}

function buildHumanTitle(
  source: SourceConfig,
  subject: string,
  year: number,
  documentType: TipoDocumento,
  call: string | null,
): string {
  const labelMap: Record<TipoDocumento, string> = {
    [TipoDocumento.EXAMEN_OFICIAL]: 'Examen oficial',
    [TipoDocumento.MODELO]: 'Modelo',
    [TipoDocumento.CONVOCATORIA_ANTERIOR]: 'Convocatoria anterior',
    [TipoDocumento.ORIENTACIONES]: 'Orientaciones',
    [TipoDocumento.CRITERIOS_CORRECCION]: 'Criterios de corrección',
    [TipoDocumento.SOLUCIONARIO]: 'Solucionario',
  };

  const suffix = call ? ` (${call})` : '';
  return `${labelMap[documentType]} ${subject} ${year}${suffix} — ${source.university}`;
}

function buildNotes(params: {
  sourcePageUrl: string;
  officialFileUrl: string;
  hasOptionAB: boolean;
  aiUsed: boolean;
  compoundPdf: boolean;
}): string {
  return [
    `sourcePageUrl=${params.sourcePageUrl}`,
    `officialFileUrl=${params.officialFileUrl}`,
    `optionAB=${params.hasOptionAB}`,
    `aiEnrichment=${params.aiUsed}`,
    `compoundPdf=${params.compoundPdf}`,
  ].join('; ');
}

function shouldUseFallbackTitle(title: string): boolean {
  return !title || title.length < 8 || NOISY_TITLE_RE.test(title);
}

function shouldExpandCompoundPdf(
  asset: ExtractedPdfAsset,
  compoundSubjects: string[],
  documentType: TipoDocumento,
): boolean {
  return asset.source.id === 'unex' && documentType === TipoDocumento.EXAMEN_OFICIAL && compoundSubjects.length >= 2;
}

function detectCandidateYear(input: string): number | null {
  const matches = input.match(/(?<!\d)(20\d{2}|19\d{2})(?!\d)/g);
  if (!matches?.length) return null;

  const maxAllowedYear = new Date().getFullYear();
  const years = matches
    .map((value) => Number(value))
    .filter((value) => value >= 2000 && value <= maxAllowedYear);

  return years.length ? Math.max(...years) : null;
}

function keepLatestThreeDiscoveredYears(assets: DiscoveredAsset[]): DiscoveredAsset[] {
  const years = assets
    .map((asset) =>
      detectCandidateYear(
        [asset.officialUrl, asset.anchorText, asset.pageContext, asset.sourcePageUrl].join(' '),
      ),
    )
    .filter((year): year is number => year !== null);

  if (!years.length) return assets;

  const allowedYears = new Set(Array.from(new Set(years)).sort((a, b) => b - a).slice(0, 3));

  return assets.filter((asset) => {
    const candidateYear = detectCandidateYear(
      [asset.officialUrl, asset.anchorText, asset.pageContext, asset.sourcePageUrl].join(' '),
    );

    return candidateYear === null || allowedYears.has(candidateYear);
  });
}

async function normalizePdfAsset(
  asset: ExtractedPdfAsset,
  verbose?: boolean,
): Promise<BuiltExamDocument[]> {
  let pdfText = '';

  try {
    pdfText = await extractPdfText(asset.pdfBuffer);
  } catch (error) {
    log(verbose, `  ↳ PDF text extraction failed ${asset.filename}: ${(error as Error).message}`);
  }

  const heuristic = extractHeuristicMetadata({
    source: asset.source,
    sourceUrl: asset.sourceUrl,
    sourcePageUrl: asset.sourcePageUrl,
    anchorText: asset.anchorText,
    filename: asset.filename,
    pageContext: asset.pageContext,
    pdfText,
  });

  const aiResult =
    (!heuristic.subject ||
      !heuristic.year ||
      !heuristic.documentType ||
      heuristic.mentionsM40 ||
      heuristic.mentionsEbau ||
      (heuristic.mentionsM45 && !heuristic.mentionsM25)) &&
    pdfText
      ? await enrichMetadataWithAI({
          sourceName: asset.source.sourceName,
          sourceUrl: asset.sourceUrl,
          sourcePageUrl: asset.sourcePageUrl,
          anchorText: asset.anchorText,
          filename: asset.filename,
          pdfText,
        })
      : null;

  const isM25 = aiResult?.isMayores25 ?? heuristic.mentionsM25;
  if (!isM25) return [];
  if (heuristic.mentionsM40 || heuristic.mentionsEbau) return [];
  if (heuristic.mentionsM45 && !heuristic.mentionsM25 && aiResult?.isMayores25 !== true) return [];

  const year = heuristic.year ?? aiResult?.year ?? null;
  const documentType = mergeDocumentType(heuristic.documentType, aiResult?.documentType ?? null);
  const compoundSubjects = extractCompoundSubjectsFromPdfText(pdfText);
  const shouldExplode = documentType
    ? shouldExpandCompoundPdf(asset, compoundSubjects, documentType)
    : false;
  const subject = heuristic.subject ?? aiResult?.subject ?? compoundSubjects[0] ?? null;

  if (!subject || !year || !documentType) {
    return [];
  }

  const { publicUrl } = await savePdfBuffer(
    UPLOADS_ROOT,
    asset.source,
    year,
    documentType,
    subject,
    asset.filename,
    asset.pdfBuffer,
  );

  const call = heuristic.call ?? aiResult?.call ?? null;
  const baseTitle = cleanText(heuristic.title ?? aiResult?.title ?? '');
  const buildDocument = (subjectName: string, compoundPdf: boolean): BuiltExamDocument => ({
    sourceId: asset.source.id,
    title: shouldUseFallbackTitle(baseTitle) || compoundPdf
      ? buildHumanTitle(asset.source, subjectName, year, documentType, call)
      : baseTitle,
    subject: subjectName,
    community: aiResult?.community ?? asset.source.community,
    university: aiResult?.university ?? asset.source.university,
    year,
    call,
    documentType,
    sourceUrl: asset.sourceUrl,
    sourceName: asset.source.sourceName,
    pdfUrl: publicUrl,
    isOfficial: true,
    isInteractive: false,
    status: DocumentoStatus.PUBLISHED,
    notes: buildNotes({
      sourcePageUrl: asset.sourcePageUrl,
      officialFileUrl: asset.sourceUrl,
      hasOptionAB: aiResult?.hasOptionAB ?? heuristic.hasOptionAB,
      aiUsed: Boolean(aiResult),
      compoundPdf,
    }),
  });

  if (shouldExplode) {
    return compoundSubjects.map((subjectName) => buildDocument(subjectName, true));
  }

  return [buildDocument(subject, false)];
}

function keepLatestThreeYearsPerSource(documents: BuiltExamDocument[]): BuiltExamDocument[] {
  const yearsBySource = new Map<string, number[]>();

  for (const document of documents) {
    const years = yearsBySource.get(document.sourceId) ?? [];
    years.push(document.year);
    yearsBySource.set(document.sourceId, years);
  }

  const allowedYears = new Map<string, Set<number>>();
  for (const [sourceId, years] of Array.from(yearsBySource.entries())) {
    const topYears = Array.from(new Set(years)).sort((a, b) => b - a).slice(0, 3);
    allowedYears.set(sourceId, new Set(topYears));
  }

  return documents.filter((document) => allowedYears.get(document.sourceId)?.has(document.year) ?? false);
}

function dedupeDocuments(documents: BuiltExamDocument[]): BuiltExamDocument[] {
  const seen = new Set<string>();
  const result: BuiltExamDocument[] = [];

  for (const document of documents) {
    const key = [
      document.sourceId,
      document.subject,
      document.year,
      document.documentType,
      document.pdfUrl,
    ].join('|');

    if (seen.has(key)) continue;
    seen.add(key);
    result.push(document);
  }

  return result;
}

async function persistDocuments(
  documents: BuiltExamDocument[],
  selectedSources: SourceConfig[],
  options: IngestRunOptions,
): Promise<void> {
  if (!documents.length) return;

  if (options.replaceExisting !== false) {
    if (options.sources?.length) {
      await prisma.examDocument.deleteMany({
        where: {
          sourceName: {
            in: selectedSources.map((source) => source.sourceName),
          },
        },
      });
    } else {
      await prisma.examDocument.deleteMany({});
    }
  }

  await prisma.examDocument.createMany({
    data: documents.map(({ sourceId: _sourceId, ...document }) => document),
  });
}

async function writeManifest(summary: IngestRunSummary, documents: BuiltExamDocument[]): Promise<void> {
  await ensureDir(UPLOADS_ROOT);
  await fs.writeFile(
    MANIFEST_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        summary,
        documents: documents.map(({ sourceId, ...document }) => ({ sourceId, ...document })),
      },
      null,
      2,
    ),
    'utf8',
  );
}

async function pruneStoredPdfs(
  documents: BuiltExamDocument[],
  selectedSources: SourceConfig[],
  partialRun: boolean,
): Promise<void> {
  const keep = new Set(
    documents
      .map((document) => document.pdfUrl)
      .filter(Boolean)
      .map((pdfUrl) => path.resolve(process.cwd(), pdfUrl.replace(/^\/uploads\//, 'uploads/'))),
  );

  async function visit(dirPath: string): Promise<void> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true }).catch(() => []);

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        await visit(fullPath);
        const remaining = await fs.readdir(fullPath).catch(() => []);
        if (!remaining.length) {
          await fs.rmdir(fullPath).catch(() => undefined);
        }
        continue;
      }

      if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf') && !keep.has(fullPath)) {
        await fs.unlink(fullPath).catch(() => undefined);
      }
    }
  }

  if (partialRun) {
    for (const source of selectedSources) {
      await visit(storageSourceDir(UPLOADS_ROOT, source));
    }
    return;
  }

  await visit(UPLOADS_ROOT);
}

export async function ingestOfficialExamDocuments(options: IngestRunOptions = {}): Promise<IngestRunSummary> {
  const selectedSources = options.sources?.length
    ? SOURCE_CONFIGS.filter((source) => options.sources?.includes(source.id))
    : SOURCE_CONFIGS;

  if (!selectedSources.length) {
    throw new Error('No se encontraron fuentes válidas para la ingestión.');
  }

  if (options.replaceExisting !== false) {
    if (options.sources?.length) {
      await Promise.all(selectedSources.map((source) => removeDirIfExists(storageSourceDir(UPLOADS_ROOT, source))));
    } else {
      await removeDirIfExists(UPLOADS_ROOT);
    }
  }

  await ensureDir(UPLOADS_ROOT);

  const allDocuments: BuiltExamDocument[] = [];
  const sourceSummaries: SourceRunSummary[] = [];

  for (const source of selectedSources) {
    log(options.verbose, `\n[${source.id}] ${source.sourceName}`);
    const discovered = keepLatestThreeDiscoveredYears(
      await discoverAssetsForSource(source, options.verbose),
    );
    let downloaded = 0;
    let published = 0;
    let skipped = 0;

    for (const asset of discovered) {
      const pdfAssets = await downloadAndExpandAsset(asset, options.verbose);
      downloaded += pdfAssets.length;

      for (const pdfAsset of pdfAssets) {
        const documents = await normalizePdfAsset(pdfAsset, options.verbose);
        if (!documents.length) {
          skipped++;
          continue;
        }

        allDocuments.push(...documents);
        published += documents.length;
      }
    }

    sourceSummaries.push({
      sourceId: source.id,
      sourceName: source.sourceName,
      discovered: discovered.length,
      downloaded,
      published,
      skipped,
    });
  }

  const finalDocuments = dedupeDocuments(keepLatestThreeYearsPerSource(allDocuments)).filter(
    (document) => document.year >= MIN_PUBLISHED_YEAR,
  );
  await persistDocuments(finalDocuments, selectedSources, options);
  await pruneStoredPdfs(finalDocuments, selectedSources, Boolean(options.sources?.length));

  const summary: IngestRunSummary = {
    sources: sourceSummaries,
    totalDiscovered: sourceSummaries.reduce((acc, item) => acc + item.discovered, 0),
    totalPublished: finalDocuments.length,
  };

  await writeManifest(summary, finalDocuments);

  return summary;
}
