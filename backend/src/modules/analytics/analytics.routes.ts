// ─── backend/src/modules/analytics/analytics.routes.ts ───────────────────────
import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { authenticate } from '../../middleware/auth';

export const analyticsRoutes = Router();

analyticsRoutes.use(authenticate);
analyticsRoutes.get('/monthly', analyticsController.monthly);
analyticsRoutes.get('/trends', analyticsController.trends);
analyticsRoutes.get('/categories', analyticsController.categoryTrends);
analyticsRoutes.get('/insights', analyticsController.insights);