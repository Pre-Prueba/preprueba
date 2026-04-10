import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireSubscription } from '../middleware/subscription';
import { AuthRequest } from '../types';

const router = Router();

// GET /stats/resumen
router.get('/resumen', requireAuth, requireSubscription, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;

  const [totalSesiones, totalRespuestas, respuestasAll, materias] = await Promise.all([
    prisma.sesion.count({ where: { userId: user.id, completada: true } }),
    prisma.respuestaUsuario.count({ where: { userId: user.id } }),
    prisma.respuestaUsuario.findMany({
      where: { userId: user.id },
      select: { esCorrecta: true, createdAt: true, pregunta: { select: { materiaId: true } } },
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

    const ultSemana = resp.filter((r) => ahora - r.createdAt.getTime() < semana);
    const semAnt = resp.filter((r) => {
      const diff = ahora - r.createdAt.getTime();
      return diff >= semana && diff < 2 * semana;
    });

    const pctUlt = ultSemana.length > 0 ? ultSemana.filter((r) => r.esCorrecta).length / ultSemana.length : 0;
    const pctAnt = semAnt.length > 0 ? semAnt.filter((r) => r.esCorrecta).length / semAnt.length : 0;
    const tendencia: 'mejorando' | 'estable' | 'bajando' =
      pctUlt > pctAnt + 0.05 ? 'mejorando' : pctUlt < pctAnt - 0.05 ? 'bajando' : 'estable';

    return { materiaId: materia.id, materiaNombre: materia.nombre, totalRespondidas: total, porcentajeAcierto: pct, tendencia };
  });

  res.json({ totalSesiones, totalRespuestas, porcentajeAcierto, racha, porMateria });
});

export default router;
