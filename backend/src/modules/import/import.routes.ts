// ─── backend/src/modules/import/import.routes.ts ─────────────────────────────
import { Router } from 'express';
import { importController } from './import.controller';
import { authenticate } from '../../middleware/auth';

export const importRoutes = Router();

importRoutes.use(authenticate);
importRoutes.post('/', importController.upload, importController.importCsv);
importRoutes.get('/batches', importController.listBatches);