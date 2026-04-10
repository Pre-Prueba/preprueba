import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as AuthRequest).user;
  if (!user || user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Acceso denegado' });
    return;
  }
  next();
};
