import 'dotenv/config';
import * as Sentry from '@sentry/node';
import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';

import { prisma } from './lib/prisma';
import authRoutes from './routes/auth';
import materiasRoutes from './routes/materias';
import sesionesRoutes from './routes/sesiones';
import statsRoutes from './routes/stats';
import stripeRoutes from './routes/stripe';
import adminRoutes from './routes/admin';

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
app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' }));

app.use('/auth', authRoutes);
app.use('/materias', materiasRoutes);
app.use('/sesiones', sesionesRoutes);
app.use('/stats', statsRoutes);
app.use('/stripe', stripeRoutes);
app.use('/admin', adminRoutes);

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
