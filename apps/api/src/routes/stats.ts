import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireSubscription } from '../middleware/subscription';
import { AuthRequest } from '../types';
import { generarTipsEstudo } from '../services/claude';

const router = Router();

// GET /stats/resumen
router.get('/resumen', requireAuth, requireSubscription, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;

  const [totalSesiones, totalRespuestas, respuestasAll, materias] = await Promise.all([
    prisma.sesion.count({ where: { userId: user.id, completada: true } }),
    prisma.respuestaUsuario.count({ where: { userId: user.id } }),
    prisma.respuestaUsuario.findMany({
      where: { userId: user.id },
      select: { esCorrecta: true, createdAt: true, tiempoRespuesta: true, pregunta: { select: { materiaId: true } } },
    }),
    prisma.materia.findMany({ where: { activa: true }, select: { id: true, nombre: true } }),
  ]);

  const aciertosTotal = respuestasAll.filter((r) => r.esCorrecta).length;
  const porcentajeAcierto = totalRespuestas > 0 ? Math.round((aciertosTotal / totalRespuestas) * 100) : 0;

  // Racha: dias consecutivos com pelo menos uma sessão completa
  const sesionesCompletadas = await prisma.sesion.findMany({
    where: { userId: user.id, completada: true },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  });

  let racha = 0;
  if (sesionesCompletadas.length > 0) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    let diaCheck = new Date(hoy);

    for (let i = 0; i < 365; i++) {
      const tieneActividad = sesionesCompletadas.some((s) => {
        const d = new Date(s.createdAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === diaCheck.getTime();
      });
      if (!tieneActividad) break;
      racha++;
      diaCheck.setDate(diaCheck.getDate() - 1);
    }
  }

  const semana = 7 * 24 * 60 * 60 * 1000;
  const ahora = Date.now();

  const porMateria = materias.map((materia) => {
    const resp = respuestasAll.filter((r) => r.pregunta.materiaId === materia.id);
    const total = resp.length;
    const aciertos = resp.filter((r) => r.esCorrecta).length;
    const pct = total > 0 ? Math.round((aciertos / total) * 100) : 0;

    const tiempos = resp.map((r) => r.tiempoRespuesta).filter((t): t is number => t !== null && t > 0);
    const avgTime = tiempos.length > 0 ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length) : 0;

    const ultSemana = resp.filter((r) => ahora - r.createdAt.getTime() < semana);
    const semAnt = resp.filter((r) => {
      const diff = ahora - r.createdAt.getTime();
      return diff >= semana && diff < 2 * semana;
    });

    const pctUlt = ultSemana.length > 0 ? ultSemana.filter((r) => r.esCorrecta).length / ultSemana.length : 0;
    const pctAnt = semAnt.length > 0 ? semAnt.filter((r) => r.esCorrecta).length / semAnt.length : 0;
    const tendencia: 'mejorando' | 'estable' | 'bajando' =
      pctUlt > pctAnt + 0.05 ? 'mejorando' : pctUlt < pctAnt - 0.05 ? 'bajando' : 'estable';

    return { materiaId: materia.id, materiaNombre: materia.nombre, totalRespondidas: total, porcentajeAcierto: pct, tendencia, avgTime };
  });

  // Global average time per question
  const allTiempos = respuestasAll.map((r) => r.tiempoRespuesta).filter((t): t is number => t !== null && t > 0);
  const globalAvgTime = allTiempos.length > 0 ? Math.round(allTiempos.reduce((a, b) => a + b, 0) / allTiempos.length) : 45;

  // Weekly evolution (last 7 days)
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const weeklyEvolution = Array.from({ length: 7 }).map((_, i) => {
    const dia = new Date(hoy);
    dia.setDate(dia.getDate() - (6 - i));
    const diaSig = diasSemana[dia.getDay()];
    const respDia = respuestasAll.filter((r) => {
      const d = new Date(r.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === dia.getTime();
    });
    const aciertosDia = respDia.filter((r) => r.esCorrecta).length;
    const totalDia = respDia.length;
    return {
      name: diaSig,
      acierto: totalDia > 0 ? Math.round((aciertosDia / totalDia) * 100) : 0,
    };
  });

  res.json({ totalSesiones, totalRespuestas, porcentajeAcierto, racha, porMateria, weeklyEvolution, globalAvgTime });
});

// GET /stats/tips - Gerar dicas de estudo IA
router.get('/tips', requireAuth, requireSubscription, async (req: Request, res: Response) => {
  const user = (req as AuthRequest).user;

  // 1. Pegar respostas para calcular performance por matéria
  const [materias, respostas] = await Promise.all([
    prisma.materia.findMany({ where: { activa: true }, select: { id: true, nombre: true } }),
    prisma.respuestaUsuario.findMany({
      where: { userId: user.id },
      select: { esCorrecta: true, pregunta: { select: { materiaId: true } } },
    }),
  ]);

  if (respostas.length === 0) {
    res.json(["Comece sua primeira prática para receber dicas personalizadas!", "O segredo do sucesso é a constância.", "Foque em uma matéria de cada vez no início."]);
    return;
  }

  const statsPorMateria = materias.map(m => {
    const resp = respostas.filter(r => r.pregunta.materiaId === m.id);
    const pct = resp.length > 0 ? Math.round((resp.filter(r => r.esCorrecta).length / resp.length) * 100) : 0;
    return { materiaNombre: m.nombre, porcentajeAcierto: pct, tendencia: 'estable' };
  }).filter(m => m.porcentajeAcierto > 0);

  const tips = await generarTipsEstudo(statsPorMateria);
  res.json(tips);
});

// GET /stats/ranking - Top 5 usuarios
router.get('/ranking', requireAuth, async (req: Request, res: Response) => {
  const topUsers = await prisma.user.findMany({
    select: { id: true, nombre: true, respuestas: { where: { esCorrecta: true }, select: { id: true } } },
    take: 100
  });

  const ranking = topUsers
    .map(u => ({ id: u.id, nombre: u.nombre || 'Estudiante', aciertos: u.respuestas.length }))
    .sort((a, b) => b.aciertos - a.aciertos)
    .slice(0, 5);

  res.json(ranking);
});

export default router;
