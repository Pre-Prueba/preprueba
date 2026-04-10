import { Router, Request, Response } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { AuthRequest } from '../types';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// All routes require auth + admin
router.use(requireAuth);
router.use(requireAdmin);

// ─── GET /admin/preguntas ─── lista paginada
const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  materiaId: z.string().optional(),
  tipo: z.enum(['TEST', 'ABIERTA']).optional(),
  activa: z.enum(['true', 'false']).optional(),
});

router.get('/preguntas', async (req: Request, res: Response): Promise<void> => {
  const parsed = listSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const { page, limit, materiaId, tipo, activa } = parsed.data;
  const where: Record<string, unknown> = {};
  if (materiaId) where.materiaId = materiaId;
  if (tipo) where.tipo = tipo;
  if (activa !== undefined) where.activa = activa === 'true';

  const [preguntas, total] = await Promise.all([
    prisma.pregunta.findMany({
      where,
      include: {
        materia: { select: { nombre: true } },
        opciones: { orderBy: { orden: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.pregunta.count({ where }),
  ]);

  res.json({
    preguntas: preguntas.map((p) => ({
      id: p.id,
      enunciado: p.enunciado,
      tipo: p.tipo,
      dificultad: p.dificultad,
      fuente: p.fuente,
      activa: p.activa,
      materiaNombre: p.materia.nombre,
      materiaId: p.materiaId,
      opciones: p.opciones,
      createdAt: p.createdAt,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

// ─── GET /admin/preguntas/:id ─── detalle
router.get('/preguntas/:id', async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params['id']);
  const pregunta = await prisma.pregunta.findUnique({
    where: { id },
    include: {
      materia: { select: { nombre: true } },
      opciones: { orderBy: { orden: 'asc' } },
    },
  });

  if (!pregunta) {
    res.status(404).json({ error: 'Pregunta no encontrada' });
    return;
  }

  res.json(pregunta);
});

// ─── POST /admin/preguntas ─── crear
const createSchema = z.object({
  materiaId: z.string(),
  enunciado: z.string().min(10),
  tipo: z.enum(['TEST', 'ABIERTA']),
  dificultad: z.enum(['BASICO', 'INTERMEDIO', 'AVANZADO']),
  opciones: z.array(z.object({
    texto: z.string(),
    esCorrecta: z.boolean(),
    orden: z.number().int(),
  })).optional(),
  respuestaEsperada: z.string().optional(),
});

router.post('/preguntas', async (req: Request, res: Response): Promise<void> => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const { materiaId, enunciado, tipo, dificultad, opciones, respuestaEsperada } = parsed.data;

  const materia = await prisma.materia.findUnique({ where: { id: materiaId } });
  if (!materia) {
    res.status(404).json({ error: 'Materia no encontrada' });
    return;
  }

  if (tipo === 'TEST') {
    if (!opciones || opciones.length < 2) {
      res.status(400).json({ error: 'Las preguntas tipo TEST necesitan al menos 2 opciones' });
      return;
    }
    const correctas = opciones.filter((o) => o.esCorrecta);
    if (correctas.length !== 1) {
      res.status(400).json({ error: 'Debe haber exactamente 1 opción correcta' });
      return;
    }
  }

  const pregunta = await prisma.pregunta.create({
    data: {
      materiaId,
      enunciado,
      tipo,
      dificultad,
      fuente: 'OFICIAL',
      opciones: opciones ? {
        create: opciones.map((o) => ({
          texto: o.texto,
          esCorrecta: o.esCorrecta,
          orden: o.orden,
        })),
      } : undefined,
    },
    include: { opciones: true },
  });

  res.status(201).json(pregunta);
});

// ─── PUT /admin/preguntas/:id ─── editar
router.put('/preguntas/:id', async (req: Request, res: Response): Promise<void> => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const id = String(req.params['id']);
  const existing = await prisma.pregunta.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: 'Pregunta no encontrada' });
    return;
  }

  const { materiaId, enunciado, tipo, dificultad, opciones } = parsed.data;

  if (tipo === 'TEST' && opciones) {
    const correctas = opciones.filter((o) => o.esCorrecta);
    if (correctas.length !== 1) {
      res.status(400).json({ error: 'Debe haber exactamente 1 opción correcta' });
      return;
    }
  }

  await prisma.opcion.deleteMany({ where: { preguntaId: id } });

  const pregunta = await prisma.pregunta.update({
    where: { id },
    data: {
      materiaId,
      enunciado,
      tipo,
      dificultad,
      opciones: opciones ? {
        create: opciones.map((o) => ({
          texto: o.texto,
          esCorrecta: o.esCorrecta,
          orden: o.orden,
        })),
      } : undefined,
    },
    include: { opciones: true, materia: { select: { nombre: true } } },
  });

  res.json(pregunta);
});

// ─── PATCH /admin/preguntas/:id/toggle ─── activar/desactivar
router.patch('/preguntas/:id/toggle', async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params['id']);
  const existing = await prisma.pregunta.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: 'Pregunta no encontrada' });
    return;
  }

  const pregunta = await prisma.pregunta.update({
    where: { id },
    data: { activa: !existing.activa },
  });

  res.json({ id: pregunta.id, activa: pregunta.activa });
});

// ─── DELETE /admin/preguntas/:id ─── soft delete (activa=false)
router.delete('/preguntas/:id', async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params['id']);
  const existing = await prisma.pregunta.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: 'Pregunta no encontrada' });
    return;
  }

  await prisma.pregunta.update({
    where: { id },
    data: { activa: false },
  });

  res.json({ success: true });
});

// ─── POST /admin/preguntas/import ─── import CSV
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

router.post('/preguntas/import', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'Archivo CSV requerido' });
    return;
  }

  const content = req.file.buffer.toString('utf-8');
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);

  if (lines.length < 2) {
    res.status(400).json({ error: 'El CSV debe tener al menos una cabecera y una fila de datos' });
    return;
  }

  // Skip header
  const dataLines = lines.slice(1);

  const materias = await prisma.materia.findMany();
  const materiaMap = new Map(materias.map((m) => [m.nombre.toLowerCase(), m.id]));

  const results: { fila: number; status: 'ok' | 'error'; error?: string; enunciado?: string }[] = [];
  let inserted = 0;

  for (let i = 0; i < dataLines.length; i++) {
    const fields = parseCSVLine(dataLines[i]);
    const [materiaNombre, enunciado, tipo, dificultad, opcionA, opcionB, opcionC, opcionD, correcta, respuestaEsperada] = fields;

    try {
      if (!materiaNombre || !enunciado || !tipo) {
        throw new Error('Campos obligatorios vacíos: materia, enunciado, tipo');
      }

      const materiaId = materiaMap.get(materiaNombre.toLowerCase());
      if (!materiaId) {
        throw new Error(`Materia "${materiaNombre}" no encontrada`);
      }

      const tipoUpper = tipo.toUpperCase() as 'TEST' | 'ABIERTA';
      if (tipoUpper !== 'TEST' && tipoUpper !== 'ABIERTA') {
        throw new Error(`Tipo "${tipo}" no válido. Usa TEST o ABIERTA`);
      }

      const dificultadUpper = (dificultad?.toUpperCase() || 'INTERMEDIO') as 'BASICO' | 'INTERMEDIO' | 'AVANZADO';
      if (!['BASICO', 'INTERMEDIO', 'AVANZADO'].includes(dificultadUpper)) {
        throw new Error(`Dificultad "${dificultad}" no válida`);
      }

      const opcionesData: { texto: string; esCorrecta: boolean; orden: number }[] = [];

      if (tipoUpper === 'TEST') {
        const opts = [opcionA, opcionB, opcionC, opcionD].filter(Boolean);
        if (opts.length < 2) {
          throw new Error('Las preguntas TEST necesitan al menos 2 opciones');
        }
        const correctaUpper = (correcta || '').toUpperCase();
        const correctaIdx = { A: 0, B: 1, C: 2, D: 3 }[correctaUpper];
        if (correctaIdx === undefined) {
          throw new Error(`Correcta "${correcta}" no válida. Usa A, B, C o D`);
        }

        opts.forEach((texto, idx) => {
          opcionesData.push({ texto, esCorrecta: idx === correctaIdx, orden: idx });
        });
      }

      await prisma.pregunta.create({
        data: {
          materiaId,
          enunciado,
          tipo: tipoUpper,
          dificultad: dificultadUpper,
          fuente: 'OFICIAL',
          opciones: opcionesData.length > 0 ? { create: opcionesData } : undefined,
        },
      });

      inserted++;
      results.push({ fila: i + 2, status: 'ok', enunciado: enunciado.slice(0, 50) });
    } catch (err) {
      results.push({
        fila: i + 2,
        status: 'error',
        error: err instanceof Error ? err.message : 'Error desconocido',
        enunciado: enunciado?.slice(0, 50),
      });
    }
  }

  res.json({
    insertadas: inserted,
    errores: results.filter((r) => r.status === 'error').length,
    total: dataLines.length,
    detalle: results,
  });
});

// ─── GET /admin/stats ─── totales por materia
router.get('/stats', async (_req: Request, res: Response): Promise<void> => {
  const stats = await prisma.pregunta.groupBy({
    by: ['materiaId', 'activa'],
    _count: true,
  });

  const materias = await prisma.materia.findMany({ select: { id: true, nombre: true } });
  const materiaMap = new Map(materias.map((m) => [m.id, m.nombre]));

  const result: Record<string, { nombre: string; activas: number; inactivas: number; total: number }> = {};

  for (const stat of stats) {
    if (!result[stat.materiaId]) {
      result[stat.materiaId] = {
        nombre: materiaMap.get(stat.materiaId) ?? 'Desconocida',
        activas: 0,
        inactivas: 0,
        total: 0,
      };
    }
    if (stat.activa) {
      result[stat.materiaId].activas += stat._count;
    } else {
      result[stat.materiaId].inactivas += stat._count;
    }
    result[stat.materiaId].total += stat._count;
  }

  res.json(Object.entries(result).map(([materiaId, data]) => ({ materiaId, ...data })));
});

export default router;
