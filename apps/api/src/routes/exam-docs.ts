import { Router, Request, Response } from 'express';
import { Prisma, TipoDocumento, DocumentoStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

const PUBLISHED_WHERE = {
  status: { in: ['PUBLISHED', 'INTERACTIVE_READY'] as DocumentoStatus[] },
} satisfies Prisma.ExamDocumentWhereInput;

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
      orderBy: [{ year: 'desc' }, { community: 'asc' }, { subject: 'asc' }],
      skip,
      take,
    }),
    prisma.examDocument.count({ where }),
  ]);

  // Facets for filters
  const [allCommunities, allUniversities, allSubjects, allYears] = await Promise.all([
    prisma.examDocument.groupBy({
      by: ['community'],
      where: PUBLISHED_WHERE,
      orderBy: { community: 'asc' },
    }),
    prisma.examDocument.groupBy({
      by: ['university'],
      where: PUBLISHED_WHERE,
      orderBy: { university: 'asc' },
    }),
    prisma.examDocument.groupBy({
      by: ['subject'],
      where: PUBLISHED_WHERE,
      orderBy: { subject: 'asc' },
    }),
    prisma.examDocument.groupBy({
      by: ['year'],
      where: PUBLISHED_WHERE,
      orderBy: { year: 'desc' },
    }),
  ]);

  res.json({
    docs,
    total: totalCount,
    page: parseInt(page as string),
    facets: {
      communities: allCommunities.map((c) => c.community),
      universities: allUniversities.map((u) => u.university),
      subjects: allSubjects.map((s) => s.subject),
      years: allYears.map((y) => y.year),
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
