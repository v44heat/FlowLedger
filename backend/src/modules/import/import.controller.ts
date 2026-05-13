// ─── backend/src/modules/import/import.controller.ts ─────────────────────────
import { Response, NextFunction } from 'express';
import multer from 'multer';
import { importService } from './import.service';
import { AuthRequest } from '../../middleware/auth';
import { createError } from '../../middleware/errorHandler';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(createError('Only CSV files are allowed', 400) as unknown as null, false);
    }
  },
});

export const importController = {
  upload: upload.single('file'),

  async importCsv(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw createError('No file uploaded', 400);
      const result = await importService.importCsv(
        req.userId!,
        req.file.buffer,
        req.file.originalname
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async listBatches(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const batches = await importService.listBatches(req.userId!);
      res.json(batches);
    } catch (err) {
      next(err);
    }
  },
};