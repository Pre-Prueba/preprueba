import 'dotenv/config';

import { ingestOfficialExamDocuments } from '../exam-docs/pipeline';

function parseArgs(argv: string[]) {
  const sources = new Set<string>();
  let replaceExisting = true;
  let verbose = true;

  for (const arg of argv) {
    if (arg === '--append') {
      replaceExisting = false;
      continue;
    }

    if (arg === '--quiet') {
      verbose = false;
      continue;
    }

    if (arg.startsWith('--source=')) {
      sources.add(arg.slice('--source='.length).trim());
      continue;
    }

    if (arg.startsWith('--sources=')) {
      arg
        .slice('--sources='.length)
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
        .forEach((value) => sources.add(value));
    }
  }

  return {
    sources: Array.from(sources),
    replaceExisting,
    verbose,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const summary = await ingestOfficialExamDocuments({
    replaceExisting: args.replaceExisting,
    verbose: args.verbose,
    sources: args.sources,
  });

  console.log('\nResumen de ingestión');
  console.table(
    summary.sources.map((item) => ({
      source: item.sourceId,
      discovered: item.discovered,
      downloaded: item.downloaded,
      published: item.published,
      skipped: item.skipped,
    })),
  );
  console.log(`Total discovered: ${summary.totalDiscovered}`);
  console.log(`Total published: ${summary.totalPublished}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
