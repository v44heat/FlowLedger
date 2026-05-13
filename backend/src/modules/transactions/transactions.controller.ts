// ─── backend/src/modules/transactions/transactions.controller.ts ──────────────
import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { transactionsService, TransactionQuery } from './transactions.service';
import { AuthRequest } from '../../middleware/auth';

export const transactionsController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const q: TransactionQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: Math.min(parseInt(req.query.limit as string) || 25, 100),
        category: req.query.category as string | undefined,
        type: req.query.type as string | undefined,
        search: req.query.search as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        sortBy: (req.query.sortBy as 'transactionDate' | 'amount') || 'transactionDate',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      };
      const result = await transactionsService.list(req.userId!, q);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async categorize(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const schema = z.object({ category: z.string().min(1) });
      const { category } = schema.parse(req.body);
      const tx = await transactionsService.categorize(
        req.userId!,
        req.params.id,
        category
      );
      res.json(tx);
    } catch (err) {
      next(err);
    }
  },

  async bulkCategorize(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        ids: z.array(z.string()).min(1),
        category: z.string().min(1),
      });
      const { ids, category } = schema.parse(req.body);
      const result = await transactionsService.bulkCategorize(req.userId!, ids, category);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};


