// backend/src/modules/analytics/analytics.service.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper: find the date of the most recent transaction for a user
const getLatestTxDate = async (userId: string): Promise<Date> => {
  const latest = await prisma.transaction.findFirst({
    where: { userId },
    orderBy: { transactionDate: 'desc' },
    select: { transactionDate: true },
  });
  // Fall back to today if no transactions exist
  return latest?.transactionDate ?? new Date();
};

export const analyticsService = {
  async monthly(userId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 0, 23, 59, 59);

    const txs = await prisma.transaction.findMany({
      where: { userId, transactionDate: { gte: start, lte: end } },
    });

    const debits  = txs.filter(t => t.transactionType !== 'CREDIT');
    const credits = txs.filter(t => t.transactionType === 'CREDIT');

    const totalExpenses = debits.reduce((s, t) => s + t.amount, 0);
    const totalIncome   = credits.reduce((s, t) => s + t.amount, 0);
    const daysInMonth   = end.getDate();
    const dailyAverage  = totalExpenses / (daysInMonth || 1);

    // Category breakdown
    const categoryMap: Record<string, number> = {};
    for (const t of debits) {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    }
    const categoryBreakdown = Object.entries(categoryMap)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Daily spending trend
    const dailyMap: Record<string, number> = {};
    for (const t of debits) {
      const day = t.transactionDate.toISOString().split('T')[0];
      dailyMap[day] = (dailyMap[day] || 0) + t.amount;
    }
    const dailyTrend = Object.entries(dailyMap)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top merchants
    const merchantMap: Record<string, number> = {};
    for (const t of debits) {
      merchantMap[t.merchantName] = (merchantMap[t.merchantName] || 0) + t.amount;
    }
    const topMerchants = Object.entries(merchantMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      period: { year, month, start, end },
      summary: {
        totalExpenses,
        totalIncome,
        netFlow: totalIncome - totalExpenses,
        dailyAverage,
        transactionCount: txs.length,
      },
      categoryBreakdown,
      dailyTrend,
      topMerchants,
    };
  },

  // ── FIXED: anchor the 6-month window to the latest transaction, not today ──
  async trends(userId: string, months = 6) {
    const anchor = await getLatestTxDate(userId);
    const results = [];

    for (let i = months - 1; i >= 0; i--) {
      const d     = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const [agg, income] = await Promise.all([
        prisma.transaction.aggregate({
          where: {
            userId,
            transactionType: { not: 'CREDIT' },
            transactionDate: { gte: start, lte: end },
          },
          _sum: { amount: true },
          _count: { id: true },
        }),
        prisma.transaction.aggregate({
          where: {
            userId,
            transactionType: 'CREDIT',
            transactionDate: { gte: start, lte: end },
          },
          _sum: { amount: true },
        }),
      ]);

      results.push({
        month:    d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        year:     d.getFullYear(),
        monthNum: d.getMonth() + 1,
        expenses: agg._sum.amount   || 0,
        income:   income._sum.amount || 0,
        txCount:  agg._count.id,
      });
    }

    return results;
  },

  // ── FIXED: anchor the 3-month category window to the latest transaction ──
  async categoryTrends(userId: string, months = 3) {
    const anchor = await getLatestTxDate(userId);
    const result: Record<string, { month: string; amount: number }[]> = {};

    for (let i = months - 1; i >= 0; i--) {
      const d     = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });

      const groups = await prisma.transaction.groupBy({
        by: ['category'],
        where: {
          userId,
          transactionType: { not: 'CREDIT' },
          transactionDate: { gte: start, lte: end },
        },
        _sum: { amount: true },
      });

      for (const g of groups) {
        if (!result[g.category]) result[g.category] = [];
        result[g.category].push({ month: label, amount: g._sum.amount || 0 });
      }
    }

    return result;
  },

  async generateInsights(userId: string) {
    const anchor  = await getLatestTxDate(userId);
    const year    = anchor.getFullYear();
    const month   = anchor.getMonth() + 1;

    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear  = month === 1 ? year - 1 : year;

    const [thisMonth, lastMonth] = await Promise.all([
      analyticsService.monthly(userId, year, month),
      analyticsService.monthly(userId, prevYear, prevMonth),
    ]);

    const insights: string[] = [];

    if (lastMonth.summary.totalExpenses > 0) {
      const diff =
        ((thisMonth.summary.totalExpenses - lastMonth.summary.totalExpenses) /
          lastMonth.summary.totalExpenses) * 100;
      if (Math.abs(diff) > 5) {
        insights.push(
          diff > 0
            ? `You spent ${diff.toFixed(0)}% more than last month overall.`
            : `Great job! Spending is down ${Math.abs(diff).toFixed(0)}% vs last month.`
        );
      }
    }

    const topThis = thisMonth.categoryBreakdown[0];
    const topLast = lastMonth.categoryBreakdown.find(c => c.category === topThis?.category);
    if (topThis && topLast && topLast.amount > 0) {
      const diff =
        ((topThis.amount - topLast.amount) / topLast.amount) * 100;
      if (Math.abs(diff) > 10) {
        insights.push(
          `${topThis.category} spending is ${diff > 0 ? 'up' : 'down'} ${Math.abs(diff).toFixed(0)}% this month.`
        );
      }
    }

    const uncategorized = await prisma.transaction.count({
      where: { userId, category: 'Uncategorized' },
    });
    if (uncategorized > 0) {
      insights.push(
        `You have ${uncategorized} uncategorized transaction${uncategorized > 1 ? 's' : ''} that need your review.`
      );
    }

    const highDays = thisMonth.dailyTrend.filter(
      d => d.amount > thisMonth.summary.dailyAverage * 2
    );
    if (highDays.length > 0) {
      insights.push(
        `You had ${highDays.length} day${highDays.length > 1 ? 's' : ''} with unusually high spending this month.`
      );
    }

    if (insights.length === 0) {
      insights.push('Keep it up! Your spending looks steady this month.');
    }

    return insights;
  },
};