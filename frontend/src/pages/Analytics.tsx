// frontend/src/pages/Analytics.tsx
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Spinner } from '../components/ui/Spinner';
import { useTrends, useCategoryTrends, useMonthlyAnalytics } from '../hooks/useAnalytics';
import { useTransactions } from '../hooks/useTransactions';
import { fmt } from '../utils/formatters';
import { CATEGORY_COLORS } from '../utils/categories';

const TooltipStyle = {
  contentStyle: { background: '#181c26', border: '1px solid #2e3650', borderRadius: 12 },
  labelStyle: { color: '#94a3b8' },
};

export const Analytics = () => {
  // Default to Jan 2025 — auto-corrected to latest data month on load
  const [year, setYear]   = useState(2025);
  const [month, setMonth] = useState(1);

  // Auto-jump to the month of the most recent transaction
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

  // These now anchor to latest tx date on the backend — no params needed
  const { data: trends,    isLoading: trendLoad } = useTrends(6);
  const { data: catTrends, isLoading: catLoad   } = useCategoryTrends(3);
  const { data: monthly } = useMonthlyAnalytics(year, month);

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

  // Build multi-line category trend data
  const catLineData: Record<string, any>[] = [];
  if (catTrends) {
    const allMonths = new Set<string>();
    Object.values(catTrends).forEach((arr: any[]) =>
      arr.forEach((d: any) => allMonths.add(d.month))
    );
    [...allMonths].forEach(m => {
      const row: Record<string, any> = { month: m };
      Object.entries(catTrends).forEach(([cat, arr]: [string, any[]]) => {
        const found = (arr as any[]).find((d: any) => d.month === m);
        row[cat] = found?.amount || 0;
      });
      catLineData.push(row);
    });
  }

  const topCategories = Object.keys(catTrends || {}).slice(0, 5);

  return (
    <Layout>
      <Header title="Analytics" subtitle="Deep dive into your spending patterns" />

      <div className="p-8 space-y-6 animate-fade-in">

        {/* Month navigator */}
        <div className="glass p-4 flex items-center gap-4 flex-wrap">
          <span className="text-sm text-slate-400 mr-1">Viewing period:</span>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="btn-ghost p-1.5 border border-white/10">
              <ChevronLeft size={15} />
            </button>
            <span className="text-sm font-semibold text-white w-36 text-center">{monthLabel}</span>
            <button onClick={nextMonth} className="btn-ghost p-1.5 border border-white/10">
              <ChevronRight size={15} />
            </button>
          </div>
          <span className="text-xs text-slate-600 ml-2">
            (6-month trend and category trends auto-detect your data range)
          </span>
        </div>

        {/* Income vs Expenses 6-month trend */}
        <div className="glass p-5">
          <h3 className="text-sm font-medium text-slate-400 mb-5">
            Income vs Expenses — Last 6 Months
          </h3>
          {trendLoad ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : (trends || []).every((t: any) => t.expenses === 0 && t.income === 0) ? (
            <div className="flex items-center justify-center py-12 text-slate-500 text-sm">
              No trend data available yet. Import transactions to see your history.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={trends} barGap={4} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2333" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false} axisLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  {...TooltipStyle}
                  formatter={(v: number) => [fmt.currency(v)]}
                />
                <Legend formatter={v => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>} />
                <Bar dataKey="income"   name="Income"   fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#1279f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category trends over time */}
        <div className="glass p-5">
          <h3 className="text-sm font-medium text-slate-400 mb-5">
            Category Trends — Last 3 Months
          </h3>
          {catLoad ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : catLineData.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-slate-500 text-sm">
              No category data available for this period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={catLineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2333" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false} axisLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  {...TooltipStyle}
                  formatter={(v: number) => [fmt.currency(v)]}
                />
                <Legend formatter={v => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>} />
                {topCategories.map(cat => (
                  <Line
                    key={cat}
                    type="monotone"
                    dataKey={cat}
                    name={cat}
                    stroke={CATEGORY_COLORS[cat] || '#6b7280'}
                    strokeWidth={2}
                    dot={{ fill: CATEGORY_COLORS[cat] || '#6b7280', r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly category breakdown bars */}
        {monthly && (monthly.categoryBreakdown?.length ?? 0) > 0 && (
          <div className="glass p-5">
            <h3 className="text-sm font-medium text-slate-400 mb-4">
              Spending by Category — {monthLabel}
            </h3>
            <div className="space-y-3">
              {monthly.categoryBreakdown.map((item: any) => (
                <div key={item.category} className="flex items-center gap-4">
                  <span className="text-sm text-slate-400 w-40 truncate">{item.category}</span>
                  <div className="flex-1 h-6 bg-surface-500 rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg flex items-center justify-end pr-2 transition-all duration-700"
                      style={{
                        width: `${item.percentage}%`,
                        background: CATEGORY_COLORS[item.category] || '#6b7280',
                        minWidth: item.percentage > 0 ? 4 : 0,
                      }}
                    >
                      {item.percentage > 8 && (
                        <span className="text-xs font-semibold text-white">
                          {item.percentage.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-white w-32 text-right">
                    {fmt.currency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily spending heatmap */}
        {(monthly?.dailyTrend?.length ?? 0) > 0 && (
          <div className="glass p-5">
            <h3 className="text-sm font-medium text-slate-400 mb-4">
              Daily Spending Heatmap — {monthLabel}
            </h3>
            <div className="grid grid-cols-7 gap-1.5">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-xs text-slate-600 text-center py-1">{d}</div>
              ))}
              {monthly!.dailyTrend.map((d: any) => {
                const intensity = monthly!.summary.dailyAverage > 0
                  ? Math.min(d.amount / (monthly!.summary.dailyAverage * 2.5), 1) : 0;
                const day = new Date(d.date);
                return (
                  <div
                    key={d.date}
                    title={`${fmt.shortDate(d.date)}: ${fmt.currency(d.amount)}`}
                    className="h-10 rounded-lg flex items-center justify-center text-xs font-medium cursor-default transition-all"
                    style={{
                      background: `rgba(18, 121, 241, ${0.08 + intensity * 0.82})`,
                      color: intensity > 0.5 ? 'white' : '#64748b',
                    }}
                  >
                    {day.getDate()}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2 mt-3 justify-end">
              <span className="text-xs text-slate-500">Low</span>
              {[0.1, 0.3, 0.5, 0.7, 0.9].map(v => (
                <div key={v} className="w-5 h-5 rounded" style={{ background: `rgba(18,121,241,${v})` }} />
              ))}
              <span className="text-xs text-slate-500">High</span>
            </div>
          </div>
        )}

        {/* Empty state for selected month */}
        {!catLoad && !trendLoad && monthly && monthly.summary.transactionCount === 0 && (
          <div className="glass py-16 text-center">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-lg font-semibold text-white mb-1">No data for {monthLabel}</p>
            <p className="text-slate-500 text-sm">
              Use the navigator above to go back to a month with transactions.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};