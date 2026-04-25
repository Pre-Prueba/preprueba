import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

const createSchema = z.object({
  frente: z.string().min(1),
  dorso: z.string().min(1),
  preguntaId: z.string().optional(),
  materiaId: z.string().optional(),
});

// GET /flashcards — lista flashcards do usuário
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;
  const { materiaId, estado } = req.query;

  const where: Record<string, unknown> = { userId: user.id };
  if (materiaId) where.materiaId = materiaId as string;
  if (estado) where.estado = estado as string;

  const flashcards = await prisma.flashcard.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      materia: { select: { id: true, nombre: true } },
      pregunta: { select: { id: true, enunciado: true } },
    },
  });

  res.json(flashcards);
});

// POST /flashcards — criar flashcard
router.post('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos', details: parsed.error.issues });
    return;
  }

  const flashcard = await prisma.flashcard.create({
    data: {
      userId: user.id,
      ...parsed.data,
      estado: 'pendiente',
    },
    include: {
      materia: { select: { id: true, nombre: true } },
    },
  });

  res.status(201).json(flashcard);
});

// PATCH /flashcards/:id/estado — atualizar estado com SRS SM-2
router.patch('/:id/estado', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;
  const { id } = req.params;
  const parsed = z.object({
    estado: z.enum(['pendiente', 'facil', 'dificil']).optional(),
    rating: z.number().min(1).max(3).optional(), // 1=difícil, 2=pendiente, 3=fácil
  }).safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos' });
    return;
  }

  const flashcard = await prisma.flashcard.findFirst({ where: { id, userId: user.id } });
  if (!flashcard) {
    res.status(404).json({ error: 'No encontrado' });
    return;
  }

  const { estado, rating } = parsed.data;
  const newEstado = estado ?? (rating === 3 ? 'facil' : rating === 1 ? 'dificil' : 'pendiente');

  // SRS SM-2 simplified
  let { easeFactor = 2.5, interval = 0, reps = 0 } = flashcard;
  const now = new Date();
  let nextReviewDate: Date | null = null;

  if (rating !== undefined) {
    // Quality: 1=difícil, 2=pendiente, 3=fácil -> mapear para SM-2 quality (0-5)
    const quality = rating === 3 ? 5 : rating === 2 ? 3 : 1;

    if (quality < 3) {
      reps = 0;
      interval = 1;
    } else {
      reps += 1;
      if (reps === 1) interval = 1;
      else if (reps === 2) interval = 3;
      else interval = Math.round(interval * easeFactor);
    }

    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    nextReviewDate = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);
  } else if (newEstado === 'facil') {
    reps += 1;
    if (reps === 1) interval = 7;
    else interval = Math.round(interval * 1.5);
    nextReviewDate = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);
  } else if (newEstado === 'dificil') {
    reps = 0;
    interval = 1;
    nextReviewDate = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
  } else {
    // pendiente — não altera SRS
    nextReviewDate = flashcard.nextReviewDate;
  }

  await prisma.flashcard.update({
    where: { id },
    data: {
      estado: newEstado,
      easeFactor,
      interval,
      reps,
      nextReviewDate,
    },
  });

  res.json({ success: true, nextReviewDate, interval, easeFactor });
});

// DELETE /flashcards/:id — deletar flashcard
router.delete('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;
  const { id } = req.params;

  const flashcard = await prisma.flashcard.findFirst({ where: { id, userId: user.id } });
  if (!flashcard) {
    res.status(404).json({ error: 'No encontrado' });
    return;
  }

  await prisma.flashcard.delete({ where: { id } });
  res.json({ success: true });
});

export default router;
