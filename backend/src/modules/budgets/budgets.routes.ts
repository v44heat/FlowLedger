// ─── backend/src/modules/budgets/budgets.routes.ts ───────────────────────────
import { Router } from 'express';
import { budgetsController } from './budgets.controller';
import { authenticate } from '../../middleware/auth';

export const budgetRoutes = Router();

budgetRoutes.use(authenticate);
budgetRoutes.get('/', budgetsController.list);
budgetRoutes.post('/', budgetsController.upsert);
budgetRoutes.delete('/:id', budgetsController.remove);