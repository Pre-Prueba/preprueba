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

// PATCH /flashcards/:id/estado — atualizar estado
router.patch('/:id/estado', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;
  const { id } = req.params;
  const parsed = z.object({ estado: z.enum(['pendiente', 'facil', 'dificil']) }).safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: 'estado debe ser pendiente, facil o dificil' });
    return;
  }

  const flashcard = await prisma.flashcard.findFirst({ where: { id, userId: user.id } });
  if (!flashcard) {
    res.status(404).json({ error: 'No encontrado' });
    return;
  }

  await prisma.flashcard.update({ where: { id }, data: { estado: parsed.data.estado } });
  res.json({ success: true });
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
