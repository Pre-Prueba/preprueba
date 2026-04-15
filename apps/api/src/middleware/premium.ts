import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../types';

export const requirePremium = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.user;

  // Admins sempre têm acesso
  if (user.role === 'ADMIN') {
    return next();
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });

  if (!subscription || (subscription.status !== 'ACTIVE' && subscription.status !== 'TRIALING')) {
    return res.status(403).json({ 
      code: 'SUBSCRIPTION_REQUIRED',
      error: 'Esta funcionalidade é exclusiva para membros Premium.' 
    });
  }

  next();
};
