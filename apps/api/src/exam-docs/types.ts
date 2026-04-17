import type { DocumentoStatus, TipoDocumento } from '@prisma/client';

export type CollectorKind = 'crawl' | 'ull_drive';

export interface SourceConfig {
  id: string;
  community: string;
  university: string;
  sourceName: string;
  startUrls: string[];
  allowedDomains: string[];
  maxDepth: number;
  maxPages?: number;
  collectorKind?: CollectorKind;
  pageAllowPatterns?: RegExp[];
  pageRejectPatterns?: RegExp[];
  documentAllowPatterns?: RegExp[];
  documentRejectPatterns?: RegExp[];
}

export interface CrawlPage {
  url: string;
  depth: number;
}

export interface CandidateLink {
  url: string;
  text: string;
  sourcePageUrl: string;
}

export interface DiscoveredAsset {
  source: SourceConfig;
  officialUrl: string;
  downloadUrl?: string;
  sourcePageUrl: string;
  anchorText: string;
  pageContext: string;
}

export interface ExtractedPdfAsset {
  source: SourceConfig;
  sourceUrl: string;
  downloadUrl?: string;
  sourcePageUrl: string;
  anchorText: string;
  pageContext: string;
  filename: string;
  pdfBuffer: Buffer;
}

export interface HeuristicMetadata {
  title: string | null;
  subject: string | null;
  year: number | null;
  call: string | null;
  documentType: TipoDocumento | null;
  mentionsM25: boolean;
  mentionsM40: boolean;
  mentionsM45: boolean;
  mentionsEbau: boolean;
  hasOptionAB: boolean;
}

export interface AiMetadataResult {
  title: string | null;
  subject: string | null;
  university: string | null;
  community: string | null;
  year: number | null;
  call: string | null;
  documentType: TipoDocumento | null;
  isMayores25: boolean | null;
  hasOptionAB: boolean | null;
  confidence: number | null;
}

export interface BuiltExamDocument {
  sourceId: string;
  title: string;
  subject: string;
  community: string;
  university: string;
  year: number;
  call: string | null;
  documentType: TipoDocumento;
  sourceUrl: string;
  sourceName: string;
  pdfUrl: string;
  isOfficial: boolean;
  isInteractive: boolean;
  status: DocumentoStatus;
  notes: string | null;
}

export interface IngestRunOptions {
  replaceExisting?: boolean;
  verbose?: boolean;
  sources?: string[];
}

export interface SourceRunSummary {
  sourceId: string;
  sourceName: string;
  discovered: number;
  downloaded: number;
  published: number;
  skipped: number;
}

export interface IngestRunSummary {
  sources: SourceRunSummary[];
  totalDiscovered: number;
  totalPublished: number;
}
