import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireSubscription } from '../middleware/subscription';
import { AuthRequest } from '../types';

const router = Router();

// GET /materias
router.get('/', requireAuth, requireSubscription, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;

  const materias = await prisma.materia.findMany({
    where: { activa: true },
    orderBy: { orden: 'asc' },
    include: {
      _count: { select: { preguntas: { where: { activa: true } } } },
    },
  });

  const result = await Promise.all(
    materias.map(async (materia) => {
      const respuestas = await prisma.respuestaUsuario.findMany({
        where: { userId: user.id, pregunta: { materiaId: materia.id } },
        select: { esCorrecta: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      });

      const totalRespondidas = respuestas.length;
      const aciertos = respuestas.filter((r) => r.esCorrecta).length;
      const porcentajeAcierto = totalRespondidas > 0 ? Math.round((aciertos / totalRespondidas) * 100) : 0;
      const ultimaSesion = respuestas[0]?.createdAt ?? null;

      return {
        id: materia.id,
        nombre: materia.nombre,
        descripcion: materia.descripcion,
        fase: materia.fase,
        totalPreguntas: materia._count.preguntas,
        miProgreso: { totalRespondidas, porcentajeAcierto, ultimaSesion },
      };
    })
  );

  res.json(result);
});

// GET /materias/:id
router.get('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params['id']);
  const [materia, totalPreguntas] = await Promise.all([
    prisma.materia.findUnique({ where: { id } }),
    prisma.pregunta.count({ where: { materiaId: id, activa: true } }),
  ]);

  if (!materia) {
    res.status(404).json({ error: 'Materia no encontrada.' });
    return;
  }

  res.json({
    id: materia.id,
    nombre: materia.nombre,
    descripcion: materia.descripcion,
    fase: materia.fase,
    totalPreguntas,
    pruebaType: materia.pruebaType,
  });
});

export default router;
