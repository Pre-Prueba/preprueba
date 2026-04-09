import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireSubscription } from '../middleware/subscription';
import { generarFeedback } from '../services/claude';
import { AuthRequest } from '../types';

const router = Router();

const iniciarSchema = z.object({
  materiaId: z.string(),
  totalPreguntas: z.number().int().min(1).max(40).default(10),
});

const responderSchema = z.object({
  preguntaId: z.string(),
  opcionId: z.string().optional(),
  respuestaTexto: z.string().optional(),
  tiempoRespuesta: z.number().int().optional(),
});

// POST /sesiones/iniciar
router.post('/iniciar', requireAuth, requireSubscription, async (req: Request, res: Response): Promise<void> => {
  const parsed = iniciarSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const user = (req as AuthRequest).user;
  const { materiaId, totalPreguntas } = parsed.data;

  const materia = await prisma.materia.findUnique({ where: { id: materiaId } });
  if (!materia) {
    res.status(404).json({ error: 'Materia no encontrada.' });
    return;
  }

  const reciente = new Date();
  reciente.setDate(reciente.getDate() - 30);

  const respondidas = await prisma.respuestaUsuario.findMany({
    where: { userId: user.id, pregunta: { materiaId }, createdAt: { gte: reciente } },
    select: { preguntaId: true },
  });
  const respondidasIds = respondidas.map((r) => r.preguntaId);

  let preguntas = await prisma.pregunta.findMany({
    where: { materiaId, activa: true, id: { notIn: respondidasIds } },
    include: { opciones: { orderBy: { orden: 'asc' }, select: { id: true, texto: true, orden: true } } },
  });

  if (preguntas.length < totalPreguntas) {
    const falladas = await prisma.respuestaUsuario.findMany({
      where: { userId: user.id, pregunta: { materiaId }, esCorrecta: false },
      select: { preguntaId: true },
      distinct: ['preguntaId'],
    });
    const falladasIds = falladas
      .map((r) => r.preguntaId)
      .filter((id) => !preguntas.find((p) => p.id === id));

    const extra = await prisma.pregunta.findMany({
      where: { materiaId, activa: true, id: { in: falladasIds } },
      include: { opciones: { orderBy: { orden: 'asc' }, select: { id: true, texto: true, orden: true } } },
    });
    preguntas = [...preguntas, ...extra];
  }

  const shuffled = preguntas.sort(() => Math.random() - 0.5).slice(0, totalPreguntas);

  const sesion = await prisma.sesion.create({
    data: { userId: user.id, materiaId, totalPreguntas: shuffled.length },
  });

  res.status(201).json({
    sesionId: sesion.id,
    preguntas: shuffled.map((p) => ({
      id: p.id,
      enunciado: p.enunciado,
      tipo: p.tipo,
      dificultad: p.dificultad,
      opciones: p.opciones,
    })),
  });
});

// POST /sesiones/:sesionId/responder
router.post('/:sesionId/responder', requireAuth, requireSubscription, async (req: Request, res: Response): Promise<void> => {
  const parsed = responderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const user = (req as AuthRequest).user;
  const sesionId = String(req.params['sesionId']);
  const { preguntaId, opcionId, respuestaTexto, tiempoRespuesta } = parsed.data;

  const sesion = await prisma.sesion.findUnique({ where: { id: sesionId } });
  if (!sesion || sesion.userId !== user.id) {
    res.status(404).json({ error: 'Esta sesión no existe o ya ha finalizado.' });
    return;
  }

  const pregunta = await prisma.pregunta.findUnique({
    where: { id: preguntaId },
    include: { opciones: true },
  });
  if (!pregunta) {
    res.status(404).json({ error: 'Pregunta no encontrada.' });
    return;
  }

  const opcionCorrecta = pregunta.opciones.find((o) => o.esCorrecta);
  let esCorrecta = false;

  if (pregunta.tipo === 'TEST' && opcionId) {
    const opcionElegida = pregunta.opciones.find((o) => o.id === opcionId);
    esCorrecta = opcionElegida?.esCorrecta ?? false;
  }

  const respuestaUsuarioTexto = opcionId
    ? (pregunta.opciones.find((o) => o.id === opcionId)?.texto ?? '')
    : (respuestaTexto ?? '');
  const respuestaCorrectaTexto = opcionCorrecta?.texto ?? '';

  const feedback = await generarFeedback(pregunta.enunciado, respuestaUsuarioTexto, respuestaCorrectaTexto);

  if (pregunta.tipo === 'ABIERTA') {
    esCorrecta = feedback.correcta;
  }

  const [, sesionActualizada] = await prisma.$transaction([
    prisma.respuestaUsuario.create({
      data: {
        userId: user.id,
        preguntaId,
        sesionId,
        opcionId: opcionId ?? null,
        respuestaTexto: respuestaTexto ?? null,
        esCorrecta,
        feedbackIA: feedback.explicacion,
        tiempoRespuesta: tiempoRespuesta ?? null,
      },
    }),
    prisma.sesion.update({
      where: { id: sesionId },
      data: { aciertos: { increment: esCorrecta ? 1 : 0 } },
    }),
  ]);

  const respondidas = await prisma.respuestaUsuario.count({ where: { sesionId } });

  res.json({
    esCorrecta,
    feedbackIA: feedback.explicacion,
    opcionCorrecta: opcionCorrecta ? { id: opcionCorrecta.id, texto: opcionCorrecta.texto } : null,
    sesionProgreso: {
      respondidas,
      totalPreguntas: sesion.totalPreguntas,
      aciertosHastaAhora: sesionActualizada.aciertos,
    },
  });
});

// POST /sesiones/:sesionId/finalizar
router.post('/:sesionId/finalizar', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;
  const sesionId = String(req.params['sesionId']);

  const sesion = await prisma.sesion.findUnique({ where: { id: sesionId } });
  if (!sesion || sesion.userId !== user.id) {
    res.status(404).json({ error: 'Esta sesión no existe o ya ha finalizado.' });
    return;
  }

  const duracionSegundos = Math.floor((Date.now() - sesion.createdAt.getTime()) / 1000);

  const sesionFinalizada = await prisma.sesion.update({
    where: { id: sesionId },
    data: { completada: true, duracionSegundos },
  });

  res.json({
    sesionId: sesion.id,
    totalPreguntas: sesion.totalPreguntas,
    aciertos: sesionFinalizada.aciertos,
    porcentaje: Math.round((sesionFinalizada.aciertos / sesion.totalPreguntas) * 100),
    duracionSegundos,
    materiaId: sesion.materiaId,
  });
});

export default router;
