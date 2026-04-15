import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireSubscription } from '../middleware/subscription';
import { AuthRequest } from '../types';

const router = Router();

// GET /planner - Obtener tareas de la semana
router.get('/', requireAuth, requireSubscription, async (req: Request, res: Response) => {
  const user = (req as AuthRequest).user;

  const tasks = await prisma.tareaPlan.findMany({
    where: { userId: user.id },
    include: { materia: { select: { nombre: true, fase: true } } },
    orderBy: { diaSemana: 'asc' },
  });

  res.json(tasks);
});

// POST /planner/sync - Sincronizar tareas manuales
router.post('/sync', requireAuth, requireSubscription, async (req: Request, res: Response) => {
  const user = (req as AuthRequest).user;
  const { tasks } = req.body; // Array de { materiaId, diaSemana }

  if (!Array.isArray(tasks)) {
    res.status(400).json({ error: 'Tasks must be an array' });
    return;
  }

  // Borrar previas y crear nuevas (simplicidad para MVP)
  await prisma.tareaPlan.deleteMany({ where: { userId: user.id } });

  const created = await prisma.tareaPlan.createMany({
    data: tasks.map((t: any) => ({
      userId: user.id,
      materiaId: t.materiaId,
      diaSemana: t.diaSemana,
      completada: false,
    })),
  });

  res.json({ count: created.count });
});

// PATCH /planner/tasks/:id - Marcar como completada
router.patch('/tasks/:id', requireAuth, requireSubscription, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { completada } = req.body;

  const task = await prisma.tareaPlan.update({
    where: { id },
    data: { completada },
  });

  res.json(task);
});

// POST /planner/suggest - Sugerencia inteligente de IA/Stats
router.post('/suggest', requireAuth, requireSubscription, async (req: Request, res: Response) => {
  const user = (req as AuthRequest).user;

  // 1. Obtener materias y stats
  const [materias, stats] = await Promise.all([
    prisma.materia.findMany({ where: { activa: true }, select: { id: true, nombre: true } }),
    prisma.respuestaUsuario.findMany({
      where: { userId: user.id },
      select: { esCorrecta: true, pregunta: { select: { materiaId: true } } },
    }),
  ]);

  if (materias.length === 0) {
    res.json([]);
    return;
  }

  // 2. Calcular prioridades
  const materiaPrioridade = materias.map(m => {
    const resp = stats.filter(r => r.pregunta.materiaId === m.id);
    const acierto = resp.length > 0 ? (resp.filter(r => r.esCorrecta).length / resp.length) : 0.6; // 0.6 se for novo
    return { id: m.id, weight: 1 - acierto }; // Quanto menor o acerto, maior o peso
  }).sort((a, b) => b.weight - a.weight);

  // 3. Distribuir em 14 slots (2 por dia)
  const newTasks: any[] = [];
  let currentIdx = 0;

  for (let dia = 0; dia < 7; dia++) {
    // Adiciona 2 matérias por dia (pode ajustar isso)
    for (let slot = 0; slot < 2; slot++) {
      const materia = materiaPrioridade[currentIdx % materiaPrioridade.length];
      newTasks.push({
        userId: user.id,
        materiaId: materia.id,
        diaSemana: dia,
        completada: false,
      });
      currentIdx++;
    }
  }

  // 4. Salvar (limpando o plano anterior automático se desejar)
  await prisma.tareaPlan.deleteMany({ where: { userId: user.id } });
  await prisma.tareaPlan.createMany({ data: newTasks });

  const finalTasks = await prisma.tareaPlan.findMany({
    where: { userId: user.id },
    include: { materia: { select: { nombre: true, fase: true } } },
    orderBy: { diaSemana: 'asc' },
  });

  res.json(finalTasks);
});

export default router;
