import 'dotenv/config';
import 'express-async-errors';
import * as Sentry from '@sentry/node';
import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import path from 'path';

import { prisma } from './lib/prisma';
import authRoutes from './routes/auth';
import materiasRoutes from './routes/materias';
import sesionesRoutes from './routes/sesiones';
import statsRoutes from './routes/stats';
import stripeRoutes from './routes/stripe';
import adminRoutes from './routes/admin';
import plannerRoutes from './routes/planner';
import forumRoutes from './routes/forum';
import erroresRoutes from './routes/errores';
import favoritosRoutes from './routes/favoritos';
import flashcardsRoutes from './routes/flashcards';
import examenesRoutes from './routes/examenes';
import examDocsRoutes from './routes/exam-docs';
import simulacrosRoutes from './routes/simulacros';
import communityRoutes from './routes/community';
import notificationsRoutes from './routes/notifications';
import searchRoutes from './routes/search';
import dashboardRoutes from './routes/dashboard';

const sentryDsn = process.env.SENTRY_DSN;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: 0.1,
  });
}

const app = express();
const PORT = process.env.PORT ?? 3000;

// Stripe webhook precisa do raw body ANTES do json parser
app.use('/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
const allowedOrigins = [
  process.env.FRONTEND_URL ?? 'http://localhost:5174',
  'http://localhost:5173',
  'http://localhost:5174',
];
app.use(cors({ origin: allowedOrigins }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/auth', authRoutes);
app.use('/materias', materiasRoutes);
app.use('/sesiones', sesionesRoutes);
app.use('/stats', statsRoutes);
app.use('/stripe', stripeRoutes);
app.use('/admin', adminRoutes);
app.use('/planner', plannerRoutes);
app.use('/forum', forumRoutes);
app.use('/errores', erroresRoutes);
app.use('/favoritos', favoritosRoutes);
app.use('/flashcards', flashcardsRoutes);
app.use('/examenes', examenesRoutes);
app.use('/exam-docs', examDocsRoutes);
app.use('/simulacros', simulacrosRoutes);
app.use('/community', communityRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/search', searchRoutes);
app.use('/dashboard', dashboardRoutes);

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      db: 'connected',
    });
  } catch (error) {
    if (sentryDsn) {
      Sentry.captureException(error);
    }

    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      db: 'disconnected',
    });
  }
});

app.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (sentryDsn) {
    Sentry.captureException(error);
  }

  console.error(error);
  res.status(500).json({ error: 'Algo salió mal. Inténtalo de nuevo.' });
});

app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log(`✅ Servidor rodando na porta ${PORT}`);
    console.log(`✅ Banco de dados conectado`);
  } catch {
    console.error(`❌ Erro ao conectar ao banco de dados`);
  }
});
