// ─── backend/src/middleware/errorHandler.ts ───────────────────────────────────
import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  console.error(`[Error ${statusCode}]`, message);

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const createError = (message: string, statusCode = 400): AppError => {
  const err: AppError = new Error(message);
  err.statusCode = statusCode;
  return err;
};