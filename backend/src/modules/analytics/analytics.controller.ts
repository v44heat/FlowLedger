// ─── backend/src/modules/analytics/analytics.controller.ts ───────────────────
import { Response, NextFunction } from 'express';
import { analyticsService } from './analytics.service';
import { AuthRequest } from '../../middleware/auth';

export const analyticsController = {
  async monthly(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const now = new Date();
      const year = parseInt(req.query.year as string) || now.getFullYear();
      const month = parseInt(req.query.month as string) || now.getMonth() + 1;
      const data = await analyticsService.monthly(req.userId!, year, month);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async trends(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const months = parseInt(req.query.months as string) || 6;
      const data = await analyticsService.trends(req.userId!, months);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async categoryTrends(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const months = parseInt(req.query.months as string) || 3;
      const data = await analyticsService.categoryTrends(req.userId!, months);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async insights(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.generateInsights(req.userId!);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
};


