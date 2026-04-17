import { load as loadHtml } from 'cheerio';

import type { DiscoveredAsset, SourceConfig } from './types';
import {
  buildCrawlQueue,
  cleanText,
  extractLinksFromHtml,
  extractPageContext,
  fetchText,
  isAllowedDomain,
  isDocumentLink,
  shouldAcceptDocumentCandidate,
  shouldFollowLink,
  uniqueByUrl,
} from './utils';

interface DriveFolderEntry {
  id: string;
  name: string;
  tooltip: string;
  kind: 'folder' | 'file';
}

const DRIVE_FOLDER_RE = /https?:\/\/drive\.google\.com\/drive\/folders\/([a-zA-Z0-9_-]+)/i;

function log(verbose: boolean | undefined, message: string): void {
  if (verbose) console.log(message);
}

async function discoverViaCrawl(config: SourceConfig, verbose?: boolean): Promise<DiscoveredAsset[]> {
  const queue = buildCrawlQueue(config);
  const visitedPages = new Set<string>();
  const assets: DiscoveredAsset[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visitedPages.has(current.url)) continue;
    if (config.maxPages && visitedPages.size >= config.maxPages) break;
    visitedPages.add(current.url);

    try {
      log(verbose, `  ↳ Crawling ${current.url}`);
      const html = await fetchText(current.url);
      const pageContext = extractPageContext(html);
      const links = extractLinksFromHtml(html, current.url);

      for (const link of links) {
        if (!isAllowedDomain(link.url, config)) continue;

        if (isDocumentLink(link)) {
          const relevanceText = `${link.url} ${link.text} ${current.url} ${pageContext}`;
          if (!shouldAcceptDocumentCandidate(relevanceText, config)) continue;

          assets.push({
            source: config,
            officialUrl: link.url,
            sourcePageUrl: current.url,
            anchorText: link.text,
            pageContext,
          });
          continue;
        }

        if (current.depth >= config.maxDepth) continue;
        if (!shouldFollowLink(link, config)) continue;

        queue.push({
          url: link.url,
          depth: current.depth + 1,
        });
      }
    } catch (error) {
      log(verbose, `  ↳ Skip ${current.url}: ${(error as Error).message}`);
    }
  }

  return uniqueByUrl(
    assets.map((asset) => ({
      ...asset,
      url: asset.officialUrl,
    })),
  ).map(({ url: _url, ...asset }) => asset);
}

async function fetchDriveFolderHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0 Safari/537.36',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`GET ${url} -> ${response.status}`);
  }

  return response.text();
}

function parseDriveFolderEntries(html: string): DriveFolderEntry[] {
  const $ = loadHtml(html);
  const entries: DriveFolderEntry[] = [];

  $('strong.DNoYtb').each((_, element) => {
    const holder = $(element).closest('[data-id]');
    const id = holder.attr('data-id');
    const name = $(element).text().trim();
    const tooltip = holder.attr('data-tooltip') ?? '';

    if (!id || !name) return;

    const normalizedTooltip = tooltip.toLowerCase();
    const kind: DriveFolderEntry['kind'] =
      normalizedTooltip.includes('shared folder') || normalizedTooltip.endsWith('folder')
        ? 'folder'
        : 'file';

    entries.push({
      id,
      name,
      tooltip,
      kind,
    });
  });

  return uniqueByUrl(
    entries.map((entry) => ({
      ...entry,
      url: entry.id,
    })),
  ).map(({ url: _url, ...entry }) => entry);
}

async function discoverUllDriveAssets(config: SourceConfig, verbose?: boolean): Promise<DiscoveredAsset[]> {
  const startUrl = config.startUrls[0];
  const html = await fetchText(startUrl);
  const pageContext = extractPageContext(html);
  const links = extractLinksFromHtml(html, startUrl);

  const subjectFolders = uniqueByUrl(
    links
      .filter((link) => DRIVE_FOLDER_RE.test(link.url))
      .map((link) => ({
        url: link.url,
        text: cleanText(link.text),
      })),
  );

  const assets: DiscoveredAsset[] = [];

  for (const folder of subjectFolders) {
    const subjectFolderUrl = folder.url;
    const subjectName = cleanText(folder.text || 'Materia');

    try {
      log(verbose, `  ↳ ULL folder ${subjectName}`);
      const subjectFolderHtml = await fetchDriveFolderHtml(subjectFolderUrl);
      const yearFolders = parseDriveFolderEntries(subjectFolderHtml)
        .filter((entry) => entry.kind === 'folder' && /^\d{4}$/.test(entry.name))
        .sort((a, b) => Number(b.name) - Number(a.name))
        .slice(0, 3);

      for (const yearFolder of yearFolders) {
        const yearFolderUrl = `https://drive.google.com/drive/folders/${yearFolder.id}`;
        const yearFolderHtml = await fetchDriveFolderHtml(yearFolderUrl);
        const yearEntries = parseDriveFolderEntries(yearFolderHtml).filter(
          (entry) => entry.kind === 'file' && /\.pdf$/i.test(entry.name),
        );

        for (const fileEntry of yearEntries) {
          assets.push({
            source: config,
            officialUrl: `https://drive.google.com/file/d/${fileEntry.id}/view`,
            downloadUrl: `https://drive.google.com/uc?export=download&id=${fileEntry.id}`,
            sourcePageUrl: subjectFolderUrl,
            anchorText: cleanText([subjectName, yearFolder.name, fileEntry.name].join(' ')),
            pageContext: cleanText([pageContext, subjectName, yearFolder.name].join(' ')),
          });
        }
      }
    } catch (error) {
      log(verbose, `  ↳ ULL skip ${subjectFolderUrl}: ${(error as Error).message}`);
    }
  }

  return uniqueByUrl(
    assets.map((asset) => ({
      ...asset,
      url: asset.officialUrl,
    })),
  ).map(({ url: _url, ...asset }) => asset);
}

export async function discoverAssetsForSource(config: SourceConfig, verbose?: boolean): Promise<DiscoveredAsset[]> {
  if (config.collectorKind === 'ull_drive') {
    return discoverUllDriveAssets(config, verbose);
  }

  return discoverViaCrawl(config, verbose);
}
