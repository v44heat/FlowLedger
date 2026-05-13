// frontend/src/pages/Budgets.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { useBudgets, useUpsertBudget, useDeleteBudget } from '../hooks/useBudgets';
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS } from '../utils/categories';
import { fmt } from '../utils/formatters';

interface BudgetWithUsage {
  id: string;
  category: string;
  monthlyLimit: number;
  spent: number;
  remaining: number;
  usagePercent: number;
}

const BudgetCard = ({ b, onDelete }: { b: BudgetWithUsage; onDelete: (id: string) => void }) => {
  const color = CATEGORY_COLORS[b.category] || '#6b7280';
  const icon = CATEGORY_ICONS[b.category] || '❓';
  const isWarning = b.usagePercent >= 80 && b.usagePercent < 100;
  const isOver = b.usagePercent >= 100;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="font-medium text-white">{b.category}</span>
          {isOver && (
            <span className="flex items-center gap-1 text-xs text-red-400 font-medium">
              <AlertTriangle size={12} /> Over budget
            </span>
          )}
          {isWarning && (
            <span className="flex items-center gap-1 text-xs text-amber-400 font-medium">
              <AlertTriangle size={12} /> Near limit
            </span>
          )}
        </div>
        <button
          onClick={() => onDelete(b.id)}
          className="btn-ghost p-1.5 text-slate-500 hover:text-red-400"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-surface-500 rounded-full overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(b.usagePercent, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{
            background: isOver ? '#ef4444' : isWarning ? '#f59e0b' : color,
          }}
        />
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Spent</p>
          <p className="text-sm font-semibold text-white">{fmt.currency(b.spent)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Budget</p>
          <p className="text-sm font-semibold text-white">{fmt.currency(b.monthlyLimit)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Left</p>
          <p className={`text-sm font-semibold ${b.remaining === 0 ? 'text-red-400' : 'text-green-400'}`}>
            {fmt.currency(b.remaining)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex justify-between text-xs text-slate-500">
        <span>{b.usagePercent.toFixed(0)}% used</span>
      </div>
    </motion.div>
  );
};

export const Budgets = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ category: CATEGORIES[0], monthlyLimit: '' });

  const { data: budgets, isLoading } = useBudgets(year, month);
  const { mutate: upsert, isPending } = useUpsertBudget();
  const { mutate: deleteBudget } = useDeleteBudget();

  const save = () => {
    if (!form.monthlyLimit || isNaN(+form.monthlyLimit)) return;
    upsert(
      { category: form.category, monthlyLimit: +form.monthlyLimit, month, year },
      { onSuccess: () => { setModalOpen(false); setForm({ category: CATEGORIES[0], monthlyLimit: '' }); } }
    );
  };

  const totalBudget = (budgets || []).reduce((s: number, b: BudgetWithUsage) => s + b.monthlyLimit, 0);
  const totalSpent = (budgets || []).reduce((s: number, b: BudgetWithUsage) => s + b.spent, 0);
  const overCount = (budgets || []).filter((b: BudgetWithUsage) => b.usagePercent >= 100).length;

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i).toLocaleString('default', { month: 'long' }),
  }));

  return (
    <Layout>
      <Header title="Budgets" subtitle="Set limits, track spending" />

      <div className="p-8 space-y-6 animate-fade-in">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <select value={month} onChange={e => setMonth(+e.target.value)}
              className="input text-sm py-2 w-36">
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select value={year} onChange={e => setYear(+e.target.value)}
              className="input text-sm py-2 w-24">
              {[2023, 2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Budget
          </button>
        </div>

        {/* Summary stats */}
        {(budgets?.length || 0) > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Budgeted', value: fmt.currency(totalBudget), color: 'text-white' },
              { label: 'Total Spent', value: fmt.currency(totalSpent), color: totalSpent > totalBudget ? 'text-red-400' : 'text-white' },
              { label: 'Over Budget', value: `${overCount} categor${overCount === 1 ? 'y' : 'ies'}`, color: overCount > 0 ? 'text-red-400' : 'text-green-400' },
            ].map(s => (
              <div key={s.label} className="glass p-4 text-center">
                <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Budget cards */}
        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (budgets?.length || 0) === 0 ? (
          <div className="glass py-20 text-center">
            <p className="text-4xl mb-3">🎯</p>
            <p className="text-lg font-semibold text-white mb-1">No budgets yet</p>
            <p className="text-slate-500 text-sm mb-5">Set monthly limits to track your spending</p>
            <button onClick={() => setModalOpen(true)} className="btn-primary">
              Create your first budget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {(budgets as BudgetWithUsage[]).map(b => (
                <BudgetCard key={b.id} b={b} onDelete={deleteBudget} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add budget modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Budget">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Category</label>
            <select value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="input">
              {CATEGORIES.filter(c => !['Income', 'Transfer', 'Uncategorized'].includes(c)).map(c => (
                <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Monthly Limit (KES)
            </label>
            <input type="number" value={form.monthlyLimit}
              onChange={e => setForm(f => ({ ...f, monthlyLimit: e.target.value }))}
              className="input" placeholder="e.g. 5000" min="1" />
          </div>
          <div className="flex gap-3 mt-2">
            <button onClick={() => setModalOpen(false)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={save} disabled={isPending || !form.monthlyLimit}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              {isPending ? <Spinner size="sm" /> : null}
              Save Budget
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};