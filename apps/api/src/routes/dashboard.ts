import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireSubscription } from '../middleware/subscription';
import { AuthRequest } from '../types';

const router = Router();

// GET /dashboard/recommendations
router.get('/recommendations', requireAuth, requireSubscription, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;

  const recommendations: { type: string; title: string; message: string; link: string; priority: 'high' | 'medium' | 'low' }[] = [];

  // 1. Flashcards para revisar hoje
  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);
  const flashcardsHoy = await prisma.flashcard.count({
    where: { userId: user.id, nextReviewDate: { lte: hoy } },
  });
  if (flashcardsHoy > 0) {
    recommendations.push({
      type: 'FLASHCARD_REVIEW',
      title: 'Flashcards pendientes',
      message: `Tienes ${flashcardsHoy} tarjeta${flashcardsHoy > 1 ? 's' : ''} para revisar hoy.`,
      link: '/flashcards',
      priority: 'high',
    });
  }

  // 2. Materias sem praticar recentemente (últimos 4 dias)
  const cuatroDiasAtras = new Date();
  cuatroDiasAtras.setDate(cuatroDiasAtras.getDate() - 4);
  const materiasPracticadas = await prisma.sesion.findMany({
    where: { userId: user.id, completada: true, createdAt: { gte: cuatroDiasAtras } },
    select: { materiaId: true },
    distinct: ['materiaId'],
  });
  const materiasIdsPracticadas = new Set(materiasPracticadas.map((s) => s.materiaId));

  const todasMaterias = await prisma.materia.findMany({ where: { activa: true }, select: { id: true, nombre: true } });
  const materiasSinPracticar = todasMaterias.filter((m) => !materiasIdsPracticadas.has(m.id));

  if (materiasSinPracticar.length > 0) {
    const m = materiasSinPracticar[0];
    recommendations.push({
      type: 'MATERIA_INACTIVE',
      title: 'Materia sin practicar',
      message: `No practicas ${m.nombre} hace 4 días.`,
      link: `/practice?materiaId=${m.id}`,
      priority: 'medium',
    });
  }

  // 3. Tareas del planner para hoy no completadas
  const diaHoy = new Date().getDay(); // 0=Dom, 1=Lun...
  const diaSemana = diaHoy === 0 ? 6 : diaHoy - 1; // 0=Lun, 6=Dom
  const tareasPendientes = await prisma.tareaPlan.count({
    where: { userId: user.id, diaSemana, completada: false },
  });
  if (tareasPendientes > 0) {
    recommendations.push({
      type: 'PLANNER_PENDING',
      title: 'Plan de hoy pendiente',
      message: `Tienes ${tareasPendientes} tarea${tareasPendientes > 1 ? 's' : ''} sin completar hoy.`,
      link: '/planner',
      priority: 'medium',
    });
  }

  // 4. Racha en riesgo (sin estudiar hoy)
  const hoyInicio = new Date();
  hoyInicio.setHours(0, 0, 0, 0);
  const sesionHoy = await prisma.sesion.findFirst({
    where: { userId: user.id, completada: true, createdAt: { gte: hoyInicio } },
  });
  if (!sesionHoy) {
    recommendations.push({
      type: 'STREAK_RISK',
      title: 'Racha en riesgo',
      message: 'No has completado ninguna sesión hoy. ¡Practica un poco para mantener tu racha!',
      link: '/practice',
      priority: 'high',
    });
  }

  // 5. Materias con bajo acierto (<50%)
  const respuestas = await prisma.respuestaUsuario.findMany({
    where: { userId: user.id },
    select: { esCorrecta: true, pregunta: { select: { materiaId: true } } },
  });
  const statsPorMateria = new Map<string, { total: number; aciertos: number }>();
  for (const r of respuestas) {
    const id = r.pregunta.materiaId;
    const s = statsPorMateria.get(id) ?? { total: 0, aciertos: 0 };
    s.total++;
    if (r.esCorrecta) s.aciertos++;
    statsPorMateria.set(id, s);
  }
  for (const [materiaId, stat] of statsPorMateria) {
    const pct = stat.total > 0 ? (stat.aciertos / stat.total) * 100 : 0;
    if (pct < 50 && stat.total >= 5) {
      const materia = todasMaterias.find((m) => m.id === materiaId);
      if (materia) {
        recommendations.push({
          type: 'LOW_ACCURACY',
          title: 'Área de mejora',
          message: `Tu acierto en ${materia.nombre} es del ${Math.round(pct)}%.`,
          link: `/practice?materiaId=${materiaId}`,
          priority: 'medium',
        });
      }
    }
  }

  res.json(recommendations.slice(0, 5));
});

export default router;
