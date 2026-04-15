import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { AuthRequest } from '../types';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  nombre: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const onboardingSchema = z.object({
  pruebaType: z.enum(['MAYORES_25', 'MAYORES_40', 'MAYORES_45']),
  comunidad: z.string().min(1),
});

function signToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  } as jwt.SignOptions);
}

// Multer Config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req: any, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = `${req.user?.id || 'unknown'}-${Date.now()}${ext}`;
    cb(null, fileName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permitem imágenes.'));
    }
  },
});

// POST /auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const { email, password, nombre } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(400).json({ error: 'Ya existe una cuenta con este email.' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, nombre },
    select: { id: true, email: true, nombre: true },
  });

  res.status(201).json({ user, token: signToken(user.id) });
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: 'Email o contraseña incorrectos.' });
    return;
  }

  const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });

  res.json({
    user: {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      pruebaType: user.pruebaType,
      comunidad: user.comunidad,
      onboardingDone: user.onboardingDone,
      role: user.role,
    },
    subscription: subscription
      ? { status: subscription.status, currentPeriodEnd: subscription.currentPeriodEnd }
      : null,
    token: signToken(user.id),
  });
});

// GET /auth/me
router.get('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;
  const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });

  res.json({
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    pruebaType: user.pruebaType,
    comunidad: user.comunidad,
    onboardingDone: user.onboardingDone,
    role: user.role,
    fechaExamen: user.fechaExamen,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    provincia: user.provincia,
    bio: user.bio,
    pais: user.pais,
    subscription: subscription
      ? { status: subscription.status, currentPeriodEnd: subscription.currentPeriodEnd }
      : null,
  });
});

// PATCH /auth/update - Atualizar dados do usuário
router.patch('/update', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;
  const { nombre, fechaExamen, phone, provincia, bio, pais } = req.body;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { 
      nombre, 
      fechaExamen: fechaExamen ? new Date(fechaExamen) : undefined,
      phone,
      provincia,
      bio,
      pais
    },
  });

  res.json({ success: true, user: updated });
});

// POST /auth/avatar - Upload de foto de perfil
router.post('/avatar', requireAuth, upload.single('avatar'), async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    return;
  }

  const user = (req as AuthRequest).user;
  const avatarUrl = `/uploads/${req.file.filename}`;

  await prisma.user.update({
    where: { id: user.id },
    data: { avatarUrl },
  });

  res.json({ success: true, avatarUrl });
});

// PATCH /auth/onboarding
router.patch('/onboarding', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const parsed = onboardingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const user = (req as AuthRequest).user;
  await prisma.user.update({
    where: { id: user.id },
    data: { ...parsed.data, onboardingDone: true },
  });

  res.json({ success: true });
});

export default router;
