import { Router, Request, Response } from 'express';
import { Prisma, TipoDocumento, DocumentoStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

const PUBLISHED_WHERE = {
  status: { in: ['PUBLISHED', 'INTERACTIVE_READY'] as DocumentoStatus[] },
} satisfies Prisma.ExamDocumentWhereInput;

type FacetValue = string | number;
type FacetItem<T extends FacetValue> = { value: T; count: number };

function sortFacetItems<T extends FacetValue>(items: FacetItem<T>[], mode: 'alpha' | 'count' | 'numeric-desc'): FacetItem<T>[] {
  const copy = [...items];

  if (mode === 'count') {
    return copy.sort((a, b) => b.count - a.count || String(a.value).localeCompare(String(b.value), 'es'));
  }

  if (mode === 'numeric-desc') {
    return copy.sort((a, b) => Number(b.value) - Number(a.value));
  }

  return copy.sort((a, b) => String(a.value).localeCompare(String(b.value), 'es'));
}

// GET /exam-docs/stats — acervo statistics
router.get('/stats', async (_req: Request, res: Response): Promise<void> => {
  const [communities, universities, subjects, total] = await Promise.all([
    prisma.examDocument.groupBy({ by: ['community'], where: PUBLISHED_WHERE }),
    prisma.examDocument.groupBy({ by: ['university'], where: PUBLISHED_WHERE }),
    prisma.examDocument.groupBy({ by: ['subject'], where: PUBLISHED_WHERE }),
    prisma.examDocument.count({ where: PUBLISHED_WHERE }),
  ]);

  res.json({
    numCommunities: communities.length,
    numUniversities: universities.length,
    numSubjects: subjects.length,
    numDocuments: total,
  });
});

// GET /exam-docs — library list with rich filters
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const {
    subject,
    community,
    university,
    year,
    call,
    documentType,
    soloOficiales,
    soloInteractivos,
    q,
    page = '1',
    limit = '50',
  } = req.query;

  const where: Prisma.ExamDocumentWhereInput = {
    status: { in: ['PUBLISHED', 'INTERACTIVE_READY'] as DocumentoStatus[] },
    ...(subject     && { subject:      subject as string }),
    ...(community   && { community:    community as string }),
    ...(university  && { university:   university as string }),
    ...(year        && { year:         parseInt(year as string) }),
    ...(call        && { call:         call as string }),
    ...(documentType && { documentType: documentType as TipoDocumento }),
    ...(soloOficiales  === 'true' && { isOfficial:   true }),
    ...(soloInteractivos === 'true' && { isInteractive: true }),
    ...(q && {
      OR: [
        { title:      { contains: q as string, mode: 'insensitive' } },
        { subject:    { contains: q as string, mode: 'insensitive' } },
        { university: { contains: q as string, mode: 'insensitive' } },
        { community:  { contains: q as string, mode: 'insensitive' } },
      ],
    }),
  };

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const take = parseInt(limit as string);

  const [docs, totalCount] = await Promise.all([
    prisma.examDocument.findMany({
      where,
      orderBy: [{ year: 'desc' }, { createdAt: 'desc' }, { subject: 'asc' }],
      skip,
      take,
    }),
    prisma.examDocument.count({ where }),
  ]);

  // Facets for filters
  const [allCommunities, allUniversities, allSubjects, allYears, allCalls, allDocumentTypes] = await Promise.all([
    prisma.examDocument.groupBy({
      by: ['community'],
      where: PUBLISHED_WHERE,
      _count: { _all: true },
    }),
    prisma.examDocument.groupBy({
      by: ['university'],
      where: PUBLISHED_WHERE,
      _count: { _all: true },
    }),
    prisma.examDocument.groupBy({
      by: ['subject'],
      where: PUBLISHED_WHERE,
      _count: { _all: true },
    }),
    prisma.examDocument.groupBy({
      by: ['year'],
      where: PUBLISHED_WHERE,
      _count: { _all: true },
    }),
    prisma.examDocument.groupBy({
      by: ['call'],
      where: {
        ...PUBLISHED_WHERE,
        call: { not: null },
      },
      _count: { _all: true },
    }),
    prisma.examDocument.groupBy({
      by: ['documentType'],
      where: PUBLISHED_WHERE,
      _count: { _all: true },
    }),
  ]);

  const communities = sortFacetItems(
    allCommunities.map((item) => ({ value: item.community, count: item._count._all })),
    'count',
  );
  const universities = sortFacetItems(
    allUniversities.map((item) => ({ value: item.university, count: item._count._all })),
    'count',
  );
  const subjects = sortFacetItems(
    allSubjects.map((item) => ({ value: item.subject, count: item._count._all })),
    'count',
  );
  const years = sortFacetItems(
    allYears.map((item) => ({ value: item.year, count: item._count._all })),
    'numeric-desc',
  );
  const calls = sortFacetItems(
    allCalls
      .filter((item): item is typeof item & { call: string } => Boolean(item.call))
      .map((item) => ({ value: item.call, count: item._count._all })),
    'alpha',
  );
  const documentTypes = sortFacetItems(
    allDocumentTypes.map((item) => ({ value: item.documentType, count: item._count._all })),
    'count',
  );
  const totalPages = Math.max(1, Math.ceil(totalCount / take));

  res.json({
    docs,
    total: totalCount,
    page: parseInt(page as string),
    limit: take,
    totalPages,
    hasNextPage: skip + docs.length < totalCount,
    hasPrevPage: skip > 0,
    facets: {
      communities,
      universities,
      subjects,
      years,
      calls,
      documentTypes,
    },
    highlights: {
      topCommunities: communities.slice(0, 8),
      topUniversities: universities.slice(0, 8),
      topSubjects: subjects.slice(0, 10),
      latestYears: years.slice(0, 4),
    },
  });
});

// GET /exam-docs/recent — últimos 8 adicionados
router.get('/recent', async (_req: Request, res: Response): Promise<void> => {
  const docs = await prisma.examDocument.findMany({
    where: { status: { in: ['PUBLISHED', 'INTERACTIVE_READY'] } },
    orderBy: { createdAt: 'desc' },
    take: 8,
  });
  res.json({ docs });
});

// GET /exam-docs/:id — document detail
router.get('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const doc = await prisma.examDocument.findUnique({
    where: { id },
  });

  if (!doc) {
    res.status(404).json({ error: 'Documento no encontrado' });
    return;
  }

  res.json({ doc });
});

export default router;
