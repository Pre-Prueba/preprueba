import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireSubscription } from '../middleware/subscription';
import { AuthRequest } from '../types';

const router = Router();

// GET /search?q=...&type=all|questions|topics|errors|flashcards
router.get('/', requireAuth, requireSubscription, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;
  const { q, type = 'all' } = req.query;

  if (!q || typeof q !== 'string' || q.trim().length < 2) {
    res.status(400).json({ error: 'Query mínimo de 2 caracteres' });
    return;
  }

  const query = q.trim();
  const results: Record<string, unknown[]> = {};

  if (type === 'all' || type === 'questions') {
    const preguntas = await prisma.pregunta.findMany({
      where: {
        activa: true,
        enunciado: { contains: query, mode: 'insensitive' },
      },
      take: 10,
      include: { materia: { select: { id: true, nombre: true } } },
    });
    results.questions = preguntas.map((p) => ({
      id: p.id,
      type: 'question',
      title: p.enunciado.slice(0, 80) + (p.enunciado.length > 80 ? '...' : ''),
      subtitle: p.materia.nombre,
      link: `/practice?materiaId=${p.materiaId}`,
    }));
  }

  if (type === 'all' || type === 'topics') {
    const materias = await prisma.materia.findMany({
      where: {
        activa: true,
        nombre: { contains: query, mode: 'insensitive' },
      },
      take: 10,
    });
    results.topics = materias.map((m) => ({
      id: m.id,
      type: 'topic',
      title: m.nombre,
      subtitle: m.fase,
      link: `/practice?materiaId=${m.id}`,
    }));
  }

  if (type === 'all' || type === 'errors') {
    const errores = await prisma.respuestaUsuario.findMany({
      where: {
        userId: user.id,
        esCorrecta: false,
        pregunta: {
          enunciado: { contains: query, mode: 'insensitive' },
        },
      },
      take: 10,
      include: {
        pregunta: { include: { materia: { select: { id: true, nombre: true } } } },
      },
    });
    results.errors = errores.map((e) => ({
      id: e.id,
      type: 'error',
      title: e.pregunta.enunciado.slice(0, 80) + (e.pregunta.enunciado.length > 80 ? '...' : ''),
      subtitle: e.pregunta.materia.nombre,
      link: '/errores',
    }));
  }

  if (type === 'all' || type === 'flashcards') {
    const flashcards = await prisma.flashcard.findMany({
      where: {
        userId: user.id,
        OR: [
          { frente: { contains: query, mode: 'insensitive' } },
          { dorso: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
      include: { materia: { select: { id: true, nombre: true } } },
    });
    results.flashcards = flashcards.map((f) => ({
      id: f.id,
      type: 'flashcard',
      title: f.frente.slice(0, 80) + (f.frente.length > 80 ? '...' : ''),
      subtitle: f.materia?.nombre || 'General',
      link: '/flashcards',
    }));
  }

  res.json(results);
});

export default router;
