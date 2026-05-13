// ─── backend/src/modules/transactions/transactions.service.ts ─────────────────
import { PrismaClient, Prisma } from '@prisma/client';
import { createError } from '../../middleware/errorHandler';

const prisma = new PrismaClient();

export interface TransactionQuery {
  page: number;
  limit: number;
  category?: string;
  type?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'transactionDate' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

export const transactionsService = {
  async list(userId: string, q: TransactionQuery) {
    const where: Prisma.TransactionWhereInput = { userId };

    if (q.category) where.category = q.category;
    if (q.type) where.transactionType = q.type;
    if (q.search) {
      where.OR = [
        { merchantName: { contains: q.search, mode: 'insensitive' } },
        { rawDescription: { contains: q.search, mode: 'insensitive' } },
      ];
    }
    if (q.startDate || q.endDate) {
      where.transactionDate = {
        ...(q.startDate && { gte: new Date(q.startDate) }),
        ...(q.endDate && { lte: new Date(q.endDate) }),
      };
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { [q.sortBy || 'transactionDate']: q.sortOrder || 'desc' },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return { transactions, total, page: q.page, pages: Math.ceil(total / q.limit) };
  },

  async categorize(userId: string, transactionId: string, category: string) {
    const tx = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });
    if (!tx) throw createError('Transaction not found', 404);

    // Update transaction
    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: { category, confidenceScore: 1.0, isManual: true },
    });

    // Update / create merchant memory
    await prisma.merchantCategory.upsert({
      where: { userId_merchantName: { userId, merchantName: tx.merchantName } },
      create: { userId, merchantName: tx.merchantName, category, timesConfirmed: 1 },
      update: {
        category,
        timesConfirmed: { increment: 1 },
        lastSeen: new Date(),
      },
    });

    return updated;
  },

  async bulkCategorize(userId: string, ids: string[], category: string) {
    // Update all selected transactions
    await prisma.transaction.updateMany({
      where: { id: { in: ids }, userId },
      data: { category, confidenceScore: 1.0, isManual: true },
    });

    // Get merchants for batch memory update
    const txs = await prisma.transaction.findMany({
      where: { id: { in: ids }, userId },
      select: { merchantName: true },
    });

    for (const t of txs) {
      await prisma.merchantCategory.upsert({
        where: { userId_merchantName: { userId, merchantName: t.merchantName } },
        create: { userId, merchantName: t.merchantName, category, timesConfirmed: 1 },
        update: { category, timesConfirmed: { increment: 1 }, lastSeen: new Date() },
      });
    }

    return { updated: ids.length };
  },
};


