import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireSubscription } from '../middleware/subscription';

const router = Router();

// GET /examenes — lista exames agrupados por (anio + comunidad + materiaId)
router.get('/', requireAuth, requireSubscription, async (req: Request, res: Response): Promise<void> => {
  const { materiaId, comunidad, anio } = req.query;

  const where: Record<string, unknown> = {
    activa: true,
    anio: { not: null },
  };

  if (materiaId) where.materiaId = materiaId as string;
  if (comunidad) where.comunidad = comunidad as string;
  if (anio) where.anio = parseInt(anio as string);

  // Busca preguntas com anio/comunidad definidos para montar exames
  const preguntas = await prisma.pregunta.findMany({
    where,
    select: {
      id: true,
      materiaId: true,
      anio: true,
      comunidad: true,
      universidad: true,
      tipo: true,
      materia: { select: { id: true, nombre: true, fase: true } },
    },
    orderBy: [{ anio: 'desc' }, { comunidad: 'asc' }],
  });

  // Agrupa por (materiaId + anio + comunidad)
  const examenesMap = new Map<string, {
    key: string;
    materiaId: string;
    materiaNombre: string;
    materiaFase: string;
    anio: number;
    comunidad: string;
    universidad: string | null;
    totalPreguntas: number;
    duracionEstimadaMin: number;
  }>();

  for (const p of preguntas) {
    const key = `${p.materiaId}-${p.anio}-${p.comunidad ?? 'sin-comunidad'}`;
    if (!examenesMap.has(key)) {
      examenesMap.set(key, {
        key,
        materiaId: p.materiaId,
        materiaNombre: p.materia.nombre,
        materiaFase: p.materia.fase,
        anio: p.anio!,
        comunidad: p.comunidad ?? 'Sin especificar',
        universidad: p.universidad ?? null,
        totalPreguntas: 0,
        duracionEstimadaMin: 0,
      });
    }
    const examen = examenesMap.get(key)!;
    examen.totalPreguntas++;
    examen.duracionEstimadaMin = Math.ceil(examen.totalPreguntas * 2); // ~2 min por pregunta
  }

  const examenes = Array.from(examenesMap.values()).sort((a, b) => b.anio - a.anio);

  // Metadatos para filtros
  const comunidades = [...new Set(preguntas.map((p) => p.comunidad).filter(Boolean))].sort();
  const anios = [...new Set(preguntas.map((p) => p.anio).filter(Boolean))].sort((a, b) => (b as number) - (a as number));

  res.json({ examenes, comunidades, anios });
});

// GET /examenes/:key/preguntas — preguntas de um exame específico
router.get('/:key/preguntas', requireAuth, requireSubscription, async (req: Request, res: Response): Promise<void> => {
  const { key } = req.params;
  const parts = key.split('-');

  if (parts.length < 3) {
    res.status(400).json({ error: 'Clave de examen inválida' });
    return;
  }

  // key = materiaId-anio-comunidad (comunidad puede tener guiones)
  const materiaId = parts[0];
  const anio = parseInt(parts[1]);
  const comunidad = parts.slice(2).join('-');

  if (isNaN(anio)) {
    res.status(400).json({ error: 'Año inválido' });
    return;
  }

  const where: Record<string, unknown> = {
    materiaId,
    anio,
    activa: true,
  };

  if (comunidad !== 'sin-comunidad') {
    where.comunidad = comunidad;
  } else {
    where.comunidad = null;
  }

  const preguntas = await prisma.pregunta.findMany({
    where,
    include: {
      opciones: { orderBy: { orden: 'asc' } },
      materia: { select: { id: true, nombre: true } },
    },
  });

  if (!preguntas.length) {
    res.status(404).json({ error: 'Examen no encontrado' });
    return;
  }

  res.json({ preguntas, total: preguntas.length });
});

export default router;
