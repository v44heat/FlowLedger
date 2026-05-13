// frontend/src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { StatCard } from '../components/dashboard/StatCard';
import { SpendingTrend } from '../components/dashboard/SpendingTrend';
import { CategoryBreakdown } from '../components/dashboard/CategoryBreakdown';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { InsightsPanel } from '../components/dashboard/InsightsPanel';
import { Spinner } from '../components/ui/Spinner';
import { useMonthlyAnalytics, useInsights } from '../hooks/useAnalytics';
import { useTransactions } from '../hooks/useTransactions';
import { fmt } from '../utils/formatters';
import { TrendingDown, TrendingUp, Activity, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

export const Dashboard = () => {
  // Default to January 2025 where the test data lives,
  // but allow navigation to any month
  const [year, setYear]   = useState(2025);
  const [month, setMonth] = useState(1);

  // Once we have real transactions, jump to their latest month automatically
  const { data: recentTx } = useTransactions({
    limit: 1, sortBy: 'transactionDate', sortOrder: 'desc',
  });

  useEffect(() => {
    if (recentTx?.transactions?.[0]) {
      const d = new Date(recentTx.transactions[0].transactionDate);
      setYear(d.getFullYear());
      setMonth(d.getMonth() + 1);
    }
  }, [recentTx]);

  const { data: monthly, isLoading: loadM } = useMonthlyAnalytics(year, month);
  const { data: insights } = useInsights();
  const { data: allTx } = useTransactions({
    limit: 8, sortBy: 'transactionDate', sortOrder: 'desc',
  });

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const monthLabel = new Date(year, month - 1).toLocaleString('default', {
    month: 'long', year: 'numeric',
  });

  const s = monthly?.summary;

  return (
    <Layout>
      <Header title="Dashboard" subtitle={monthLabel} />

      <div className="p-8 space-y-6 animate-fade-in">

        {/* Month navigator */}
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="btn-ghost p-2 border border-white/10">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-white px-2">{monthLabel}</span>
          <button onClick={nextMonth} className="btn-ghost p-2 border border-white/10">
            <ChevronRight size={16} />
          </button>
          {loadM && <Spinner size="sm" />}
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total Expenses"
            value={fmt.currency(s?.totalExpenses || 0)}
            icon={<TrendingDown size={18} />}
            sub={`${s?.transactionCount || 0} transactions`}
            delay={0}
          />
          <StatCard
            label="Total Income"
            value={fmt.currency(s?.totalIncome || 0)}
            icon={<TrendingUp size={18} />}
            sub={(s?.netFlow ?? 0) >= 0 ? 'Net positive' : 'Net negative'}
            delay={0.05}
          />
          <StatCard
            label="Daily Average"
            value={fmt.currency(s?.dailyAverage || 0)}
            icon={<Activity size={18} />}
            sub="Per day this month"
            delay={0.1}
          />
          <StatCard
            label="Net Flow"
            value={fmt.currency(Math.abs(s?.netFlow || 0))}
            icon={<CalendarDays size={18} />}
            sub={(s?.netFlow || 0) >= 0 ? 'Surplus' : 'Deficit'}
            delay={0.15}
          />
        </div>

        {/* Empty state */}
        {!loadM && !s?.transactionCount && (
          <div className="glass py-16 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-lg font-semibold text-white mb-1">No data for {monthLabel}</p>
            <p className="text-slate-500 text-sm">
              Use the arrows above to navigate to a month with transactions,
              or import a CSV to get started.
            </p>
          </div>
        )}

        {/* Charts — only show when there's data */}
        {!!s?.transactionCount && (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="xl:col-span-2">
                <SpendingTrend data={monthly?.dailyTrend || []} />
              </div>
              <div>
                <CategoryBreakdown data={monthly?.categoryBreakdown || []} />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="xl:col-span-2">
                <RecentTransactions data={allTx?.transactions || []} />
              </div>
              <div>
                <InsightsPanel insights={insights || ['Analyzing your transactions…']} />
              </div>
            </div>

            {/* Top Merchants */}
            {(monthly?.topMerchants?.length ?? 0) > 0 && (
              <div className="glass p-5">
                <h3 className="text-sm font-medium text-slate-400 mb-4">Top Merchants</h3>
                <div className="space-y-3">
                  {monthly!.topMerchants.map((m: { name: string; amount: number }, i: number) => {
                    const pct = s!.totalExpenses > 0
                      ? (m.amount / s!.totalExpenses) * 100 : 0;
                    return (
                      <div key={m.name} className="flex items-center gap-4">
                        <span className="text-xs text-slate-600 w-4">{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-white">{m.name}</span>
                            <span className="text-sm text-slate-400">{fmt.currency(m.amount)}</span>
                          </div>
                          <div className="h-1.5 bg-surface-500 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-500 rounded-full transition-all duration-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-slate-500 w-10 text-right">
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};