import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth';
import materiasRoutes from './routes/materias';
import sesionesRoutes from './routes/sesiones';
import statsRoutes from './routes/stats';
import stripeRoutes from './routes/stripe';

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

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, async () => {
  const { prisma } = await import('./lib/prisma');
  try {
    await prisma.$connect();
    console.log(`✅ Servidor rodando na porta ${PORT}`);
    console.log(`✅ Banco de dados conectado`);
  } catch {
    console.error(`❌ Erro ao conectar ao banco de dados`);
  }
});
