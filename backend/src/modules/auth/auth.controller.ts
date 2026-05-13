// ─── backend/src/modules/auth/auth.controller.ts ─────────────────────────────
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from './auth.service';
import { AuthRequest } from '../../middleware/auth';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = registerSchema.parse(req.body);
      const result = await authService.register(name, email, password);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await authService.login(email, password);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async profile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.userId!);
      res.json(user);
    } catch (err) {
      next(err);
    }
  },
};