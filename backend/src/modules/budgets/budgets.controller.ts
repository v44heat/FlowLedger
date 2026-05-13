// ─── backend/src/modules/budgets/budgets.controller.ts ───────────────────────
import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { budgetsService } from './budgets.service';
import { AuthRequest } from '../../middleware/auth';

export const budgetsController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const now = new Date();
      const year = parseInt(req.query.year as string) || now.getFullYear();
      const month = parseInt(req.query.month as string) || now.getMonth() + 1;
      const data = await budgetsService.list(req.userId!, year, month);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async upsert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        category: z.string().min(1),
        monthlyLimit: z.number().positive(),
        month: z.number().min(1).max(12).optional(),
        year: z.number().min(2020).optional(),
      });
      const now = new Date();
      const { category, monthlyLimit, month, year } = schema.parse(req.body);
      const data = await budgetsService.upsert(
        req.userId!,
        category,
        monthlyLimit,
        month || now.getMonth() + 1,
        year || now.getFullYear()
      );
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await budgetsService.delete(req.userId!, req.params.id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
};