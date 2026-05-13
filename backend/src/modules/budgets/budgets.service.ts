// ─── backend/src/modules/budgets/budgets.service.ts ──────────────────────────
import { PrismaClient } from '@prisma/client';
import { createError } from '../../middleware/errorHandler';

const prisma = new PrismaClient();

export const budgetsService = {
  async list(userId: string, year: number, month: number) {
    const budgets = await prisma.budget.findMany({
      where: { userId, year, month },
      orderBy: { category: 'asc' },
    });

    // Fetch actual spending per category for this period
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const spending = await prisma.transaction.groupBy({
      by: ['category'],
      where: {
        userId,
        transactionType: { not: 'CREDIT' },
        transactionDate: { gte: start, lte: end },
      },
      _sum: { amount: true },
    });

    const spendMap: Record<string, number> = {};
    for (const s of spending) {
      spendMap[s.category] = s._sum.amount || 0;
    }

    return budgets.map(b => ({
      ...b,
      spent: spendMap[b.category] || 0,
      remaining: Math.max(b.monthlyLimit - (spendMap[b.category] || 0), 0),
      usagePercent: b.monthlyLimit > 0
        ? Math.min(((spendMap[b.category] || 0) / b.monthlyLimit) * 100, 100)
        : 0,
    }));
  },

  async upsert(
    userId: string,
    category: string,
    monthlyLimit: number,
    month: number,
    year: number
  ) {
    return prisma.budget.upsert({
      where: { userId_category_month_year: { userId, category, month, year } },
      create: { userId, category, monthlyLimit, month, year },
      update: { monthlyLimit },
    });
  },

  async delete(userId: string, id: string) {
    const b = await prisma.budget.findFirst({ where: { id, userId } });
    if (!b) throw createError('Budget not found', 404);
    await prisma.budget.delete({ where: { id } });
    return { deleted: true };
  },
};