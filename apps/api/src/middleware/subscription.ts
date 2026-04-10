import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../types';

export const requireSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = (req as AuthRequest).user;

  // Admins bypass subscription check
  if (user.role === 'ADMIN') {
    next();
    return;
  }

  const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });

  if (!subscription || (subscription.status !== 'ACTIVE' && subscription.status !== 'TRIALING')) {
    res.status(403).json({ error: 'Necesitas un plan activo para practicar.', code: 'SUBSCRIPTION_REQUIRED' });
    return;
  }
  next();
};
