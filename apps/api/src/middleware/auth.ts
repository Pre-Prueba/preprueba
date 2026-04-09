import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../types';

interface JwtPayload {
  userId: string;
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      res.status(401).json({ error: 'Usuario no encontrado' });
      return;
    }
    (req as AuthRequest).user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Tu sesión ha caducado. Inicia sesión de nuevo.' });
  }
};
