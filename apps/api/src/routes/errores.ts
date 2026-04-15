import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireSubscription } from '../middleware/subscription';
import { AuthRequest } from '../types';

const router = Router();

// GET /errores — lista respostas incorretas do usuário
router.get('/', requireAuth, requireSubscription, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;
  const { materiaId, tema, revisado, page = '1' } = req.query;

  const pageNum = Math.max(1, parseInt(page as string) || 1);
  const perPage = 20;

  const where: Record<string, unknown> = {
    userId: user.id,
    esCorrecta: false,
  };

  if (revisado === 'true') where.revisado = true;
  if (revisado === 'false') where.revisado = false;

  if (materiaId) {
    where.pregunta = { materiaId: materiaId as string };
  }

  if (tema) {
    where.pregunta = {
      ...(where.pregunta as Record<string, unknown> ?? {}),
      tema: { contains: tema as string, mode: 'insensitive' },
    };
  }

  const [total, items] = await Promise.all([
    prisma.respuestaUsuario.count({ where }),
    prisma.respuestaUsuario.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * perPage,
      take: perPage,
      include: {
        pregunta: {
          include: {
            materia: { select: { id: true, nombre: true, fase: true } },
            opciones: true,
          },
        },
        opcion: true,
      },
    }),
  ]);

  res.json({
    items,
    total,
    page: pageNum,
    pages: Math.ceil(total / perPage),
  });
});

// PATCH /errores/:id/revisado — marcar erro como revisado
router.patch('/:id/revisado', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;
  const { id } = req.params;
  const { revisado = true } = req.body;

  const respuesta = await prisma.respuestaUsuario.findFirst({
    where: { id, userId: user.id },
  });

  if (!respuesta) {
    res.status(404).json({ error: 'No encontrado' });
    return;
  }

  await prisma.respuestaUsuario.update({
    where: { id },
    data: { revisado: Boolean(revisado) },
  });

  res.json({ success: true });
});

export default router;
