import { Request } from 'express';

export interface UserPayload {
  id: string;
  email: string;
  passwordHash: string;
  nombre: string | null;
  pruebaType: 'MAYORES_25' | 'MAYORES_40' | 'MAYORES_45' | null;
  comunidad: string | null;
  onboardingDone: boolean;
  role: 'USER' | 'ADMIN';
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user: UserPayload;
}
