import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireSubscription } from '../middleware/subscription';
import { AuthRequest } from '../types';

const router = Router();

const modos = [
  {
    id: 'rapido',
    nombre: 'Simulacro Rápido',
    descripcion: '25 preguntas aleatorias de todas las materias',
    totalPreguntas: 25,
    duracionMin: 45,
    tipo: 'GENERAL',
  },
  {
    id: 'materia',
    nombre: 'Simulacro por Materia',
    descripcion: 'Elige una materia y practica 20 preguntas',
    totalPreguntas: 20,
    duracionMin: 35,
    tipo: 'MATERIA',
  },
  {
    id: 'completo',
    nombre: 'Simulacro Completo',
    descripcion: 'Próximamente: examen completo con todas las secciones',
    totalPreguntas: 0,
    duracionMin: 0,
    tipo: 'COMPLETO',
    proximamente: true,
  },
];

// GET /simulacros — lista modos disponíveis
router.get('/', requireAuth, async (_req: Request, res: Response): Promise<void> => {
  res.json({ modos });
});

// POST /simulacros/iniciar — inicia sessão simulacro
router.post('/iniciar', requireAuth, requireSubscription, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;

  const parsed = z.object({
    modo: z.enum(['rapido', 'materia']),
    materiaId: z.string().optional(),
  }).safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos' });
    return;
  }

  const { modo, materiaId } = parsed.data;

  if (modo === 'materia' && !materiaId) {
    res.status(400).json({ error: 'Se requiere materiaId para el modo materia' });
    return;
  }

  // Para modo rápido: usa a primeira matéria geral disponível como proxy
  // O frontend redirecionará para /practice/:materiaId/session?simulacro=true
  let targetMateriaId = materiaId;

  if (modo === 'rapido') {
    // Busca matéria com mais perguntas para modo rápido
    const materia = await prisma.materia.findFirst({
      where: { activa: true },
      orderBy: { preguntas: { _count: 'desc' } },
    });
    if (!materia) {
      res.status(404).json({ error: 'No hay materias disponibles' });
      return;
    }
    targetMateriaId = materia.id;
  }

  const config = modos.find((m) => m.id === modo)!;

  res.json({
    materiaId: targetMateriaId,
    totalPreguntas: config.totalPreguntas,
    duracionSegundos: config.duracionMin * 60,
    modo,
    redirectTo: `/practice/${targetMateriaId}/session?simulacro=true&duracion=${config.duracionMin * 60}&total=${config.totalPreguntas}`,
  });
});

export default router;
