import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// GET /favoritos — lista favoritos do usuário
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;
  const { materiaId } = req.query;

  const where: Record<string, unknown> = { userId: user.id };
  if (materiaId) {
    where.pregunta = { materiaId: materiaId as string };
  }

  const favoritos = await prisma.favorito.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      pregunta: {
        include: {
          materia: { select: { id: true, nombre: true, fase: true } },
          opciones: true,
        },
      },
    },
  });

  res.json(favoritos);
});

// POST /favoritos — adicionar favorito
router.post('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;
  const parsed = z.object({ preguntaId: z.string() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'preguntaId requerido' });
    return;
  }

  const { preguntaId } = parsed.data;

  // upsert para evitar duplicado
  const favorito = await prisma.favorito.upsert({
    where: { userId_preguntaId: { userId: user.id, preguntaId } },
    create: { userId: user.id, preguntaId },
    update: {},
  });

  res.json({ success: true, favorito });
});

// DELETE /favoritos/:preguntaId — remover favorito
router.delete('/:preguntaId', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;
  const { preguntaId } = req.params;

  await prisma.favorito.deleteMany({
    where: { userId: user.id, preguntaId },
  });

  res.json({ success: true });
});

export default router;
