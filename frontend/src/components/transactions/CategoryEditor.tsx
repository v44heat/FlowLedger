// ─── frontend/src/components/transactions/CategoryEditor.tsx ─────────────────
import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS } from '../../utils/categories';
import { useCategorize } from '../../hooks/useTransactions';

interface Props { txId: string; current: string; onDone?: () => void }

export const CategoryEditor = ({ txId, current, onDone }: Props) => {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCategorize();

  const pick = (cat: string) => {
    mutate({ id: txId, category: cat }, { onSuccess: () => { setOpen(false); onDone?.(); } });
  };

  const color = CATEGORY_COLORS[current] || '#6b7280';
  const icon = CATEGORY_ICONS[current] || '❓';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        disabled={isPending}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all hover:opacity-80"
        style={{ background: `${color}20`, color }}
      >
        <span>{icon}</span>
        <span>{current}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full mt-1 z-40 w-52 glass shadow-2xl shadow-black/40 py-1 overflow-hidden"
            >
              <p className="px-3 py-1.5 text-xs text-slate-500 font-medium">Select category</p>
              <div className="max-h-60 overflow-y-auto">
                {CATEGORIES.map(cat => {
                  const c = CATEGORY_COLORS[cat] || '#6b7280';
                  const ic = CATEGORY_ICONS[cat] || '❓';
                  return (
                    <button
                      key={cat}
                      onClick={() => pick(cat)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-white/5 transition-colors text-left"
                    >
                      <span>{ic}</span>
                      <span style={{ color: c }} className="flex-1">{cat}</span>
                      {cat === current && <Check size={12} style={{ color: c }} />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};


