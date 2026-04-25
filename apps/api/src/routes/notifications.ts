import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// GET /notifications
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;
  const { unreadOnly } = req.query;

  const where: Record<string, unknown> = { userId: user.id };
  if (unreadOnly === 'true') where.read = false;

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  res.json(notifications);
});

// GET /notifications/unread-count
router.get('/unread-count', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;
  const count = await prisma.notification.count({
    where: { userId: user.id, read: false },
  });
  res.json({ count });
});

// PATCH /notifications/:id/read
router.patch('/:id/read', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;
  const { id } = req.params;

  const notif = await prisma.notification.findFirst({
    where: { id, userId: user.id },
  });

  if (!notif) {
    res.status(404).json({ error: 'No encontrado' });
    return;
  }

  await prisma.notification.update({
    where: { id },
    data: { read: true },
  });

  res.json({ success: true });
});

// POST /notifications/mark-all-read
router.post('/mark-all-read', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;

  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });

  res.json({ success: true });
});

export default router;
