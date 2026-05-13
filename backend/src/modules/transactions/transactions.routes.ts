// ─── backend/src/modules/transactions/transactions.routes.ts ──────────────────
import { Router } from 'express';
import { transactionsController } from './transactions.controller';
import { authenticate } from '../../middleware/auth';

export const transactionRoutes = Router();

transactionRoutes.use(authenticate);
transactionRoutes.get('/', transactionsController.list);
transactionRoutes.patch('/:id/categorize', transactionsController.categorize);
transactionRoutes.post('/bulk-categorize', transactionsController.bulkCategorize);