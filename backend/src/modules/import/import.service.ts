
// ─── backend/src/modules/import/import.service.ts ────────────────────────────
import { PrismaClient } from '@prisma/client';
import { parseMpesaCsv } from '../../utils/csvParser';
import { categorize } from '../categorization/categorization.engine';
import { createError } from '../../middleware/errorHandler';

const prisma = new PrismaClient();

export const importService = {
  async importCsv(userId: string, buffer: Buffer, fileName: string) {
    const { transactions: parsed, errors } = await parseMpesaCsv(buffer);

    if (parsed.length === 0) {
      throw createError('No valid transactions found in CSV. Check format.', 422);
    }

    // Create import batch record
    const batch = await prisma.importBatch.create({
      data: {
        userId,
        fileName,
        rowsTotal: parsed.length + errors.length,
        rowsImported: 0,
        rowsSkipped: errors.length,
        status: 'processing',
      },
    });

    let imported = 0;
    let skipped = errors.length;

    for (const t of parsed) {
      // Check duplicate
      const exists = await prisma.transaction.findUnique({
        where: { transactionCode: t.transactionCode },
      });
      if (exists) { skipped++; continue; }

      // Fetch merchant memory for this user
      const memory = await prisma.merchantCategory.findUnique({
        where: { userId_merchantName: { userId, merchantName: t.merchantName } },
      });

      const { category, confidence } = categorize(
        t.merchantName,
        t.rawDescription,
        t.amount,
        t.transactionType,
        t.transactionDate,
        memory
      );

      await prisma.transaction.create({
        data: {
          userId,
          transactionCode: t.transactionCode,
          transactionDate: t.transactionDate,
          merchantName: t.merchantName,
          amount: t.amount,
          transactionType: t.transactionType,
          category,
          confidenceScore: confidence,
          rawDescription: t.rawDescription,
          importBatchId: batch.id,
        },
      });

      imported++;
    }

    await prisma.importBatch.update({
      where: { id: batch.id },
      data: { rowsImported: imported, rowsSkipped: skipped, status: 'done' },
    });

    return { batchId: batch.id, imported, skipped, parseErrors: errors };
  },

  async listBatches(userId: string) {
    return prisma.importBatch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  },
};


