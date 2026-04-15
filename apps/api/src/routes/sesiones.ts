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
  totalPreguntas: z.number().int().min(1).max(50).default(10),
  tipo: z.enum(['TEST', 'ABIERTA', 'MIXTO']).optional(),
  codigo: z.string().optional(),
  secundaria: z.string().optional(),
  tema: z.string().optional(),
  soloNoRespondidas: z.boolean().optional(),
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
  const { materiaId, totalPreguntas, tipo, codigo, tema, soloNoRespondidas } = parsed.data;
  const todasLasMaterias = materiaId === 'all';

  const materia = todasLasMaterias
    ? null
    : await prisma.materia.findUnique({ where: { id: materiaId } });

  if (!todasLasMaterias && !materia) {
    res.status(404).json({ error: 'Materia no encontrada.' });
    return;
  }

  const reciente = new Date();
  reciente.setDate(reciente.getDate() - 30);

  const preguntaBaseWhere = {
    activa: true,
    ...(todasLasMaterias ? {} : { materiaId }),
    ...(tipo && tipo !== 'MIXTO' ? { tipo } : {}),
    ...(codigo ? { codigo } : {}),
    ...(tema ? { tema: { contains: tema, mode: 'insensitive' as const } } : {}),
  };

  const respondidasRecientes = await prisma.respuestaUsuario.findMany({
    where: {
      userId: user.id,
      createdAt: { gte: reciente },
      pregunta: todasLasMaterias ? {} : { materiaId },
    },
    select: { preguntaId: true },
  });
  const respondidasHistoricas = await prisma.respuestaUsuario.findMany({
    where: {
      userId: user.id,
      pregunta: todasLasMaterias ? {} : { materiaId },
    },
    select: { preguntaId: true },
    distinct: ['preguntaId'],
  });
  const respondidasRecientesIds = respondidasRecientes.map((r) => r.preguntaId);
  const respondidasHistoricasIds = respondidasHistoricas.map((r) => r.preguntaId);

  const includeOpciones = {
    opciones: {
      orderBy: { orden: 'asc' as const },
      select: { id: true, texto: true, orden: true },
    },
  };

  const preguntasSeleccionadas = new Map<string, any>();

  async function agregarPreguntas(where: Record<string, unknown>) {
    if (preguntasSeleccionadas.size >= totalPreguntas) {
      return;
    }

    const candidatas = await prisma.pregunta.findMany({
      where,
      include: includeOpciones,
    });

    for (const pregunta of candidatas.sort(() => Math.random() - 0.5)) {
      if (!preguntasSeleccionadas.has(pregunta.id)) {
        preguntasSeleccionadas.set(pregunta.id, pregunta);
      }

      if (preguntasSeleccionadas.size >= totalPreguntas) {
        return;
      }
    }
  }

  if (soloNoRespondidas) {
    await agregarPreguntas({
      ...preguntaBaseWhere,
      id: { notIn: respondidasHistoricasIds },
    });
  } else {
    await agregarPreguntas({
      ...preguntaBaseWhere,
      id: { notIn: respondidasRecientesIds },
    });

    if (preguntasSeleccionadas.size < totalPreguntas) {
      const falladas = await prisma.respuestaUsuario.findMany({
        where: {
          userId: user.id,
          esCorrecta: false,
          pregunta: todasLasMaterias ? {} : { materiaId },
        },
        select: { preguntaId: true },
        distinct: ['preguntaId'],
      });
      const falladasIds = falladas.map((r) => r.preguntaId);

      if (falladasIds.length > 0) {
        await agregarPreguntas({
          ...preguntaBaseWhere,
          id: { in: falladasIds },
        });
      }
    }

    if (preguntasSeleccionadas.size < totalPreguntas) {
      await agregarPreguntas(preguntaBaseWhere);
    }
  }

  const shuffled = Array.from(preguntasSeleccionadas.values())
    .sort(() => Math.random() - 0.5)
    .slice(0, totalPreguntas);

  if (shuffled.length === 0) {
    res.status(409).json({
      error: soloNoRespondidas
        ? 'No quedan preguntas sin responder para esta configuración.'
        : 'No hay preguntas disponibles para esta configuración.',
    });
    return;
  }

  const materiaSesionId = todasLasMaterias ? shuffled[0]?.materiaId : materia!.id;
  if (!materiaSesionId) {
    res.status(409).json({ error: 'No se pudo determinar la materia de la sesión.' });
    return;
  }

  const sesion = await prisma.sesion.create({
    data: {
      userId: user.id,
      materiaId: materiaSesionId,
      totalPreguntas: shuffled.length,
      estado: 'INICIADA',
      currentIndex: 0,
    },
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
        feedbackIA: JSON.stringify(feedback),
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
    feedback,
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
    data: { completada: true, estado: 'FINALIZADA', duracionSegundos },
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

// GET /sesiones/historial - Lista de sesiones concluidas
router.get('/historial', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;

  const sesiones = await prisma.sesion.findMany({
    where: { userId: user.id, completada: true },
    include: { materia: { select: { nombre: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  res.json(sesiones);
});

// GET /sesiones/:sesionId/detalles - Detalle de una sesión con feedbacks
router.get('/:sesionId/detalles', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;
  const sesionId = String(req.params['sesionId']);

  const sesion = await prisma.sesion.findUnique({
    where: { id: sesionId },
    include: {
      materia: { select: { nombre: true } },
      respuestas: {
        include: {
          pregunta: {
            include: { opciones: { select: { id: true, texto: true, esCorrecta: true } } },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!sesion || sesion.userId !== user.id) {
    res.status(404).json({ error: 'Sesión no encontrada.' });
    return;
  }

  res.json(sesion);
});

const pausarSchema = z.object({
  currentIndex: z.number().int().min(0),
});

// POST /sesiones/:sesionId/pausar
router.post('/:sesionId/pausar', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const parsed = pausarSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const user = (req as AuthRequest).user;
  const sesionId = String(req.params['sesionId']);
  const { currentIndex } = parsed.data;

  const sesion = await prisma.sesion.findUnique({ where: { id: sesionId } });
  if (!sesion || sesion.userId !== user.id) {
    res.status(404).json({ error: 'Esta sesión no existe.' });
    return;
  }

  const duracionSegundos = Math.floor((Date.now() - sesion.createdAt.getTime()) / 1000);

  const sesionPausada = await prisma.sesion.update({
    where: { id: sesionId },
    data: { estado: 'PAUSADA', currentIndex, duracionSegundos },
  });

  res.json({ success: true, estado: sesionPausada.estado });
});

export default router;
