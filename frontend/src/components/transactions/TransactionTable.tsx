// ─── frontend/src/components/transactions/TransactionTable.tsx ────────────────
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { CategoryEditor } from './CategoryEditor';
import { Spinner } from '../ui/Spinner';
import { fmt } from '../../utils/formatters';
import { useBulkCategorize } from '../../hooks/useTransactions';
import { CATEGORIES } from '../../utils/categories';

interface Tx {
  id: string; merchantName: string; transactionCode: string; category: string;
  amount: number; transactionType: string; transactionDate: string;
  confidenceScore: number; isManual: boolean;
}

interface Props {
  data: Tx[];
  isLoading?: boolean;
  total: number;
  page: number;
  pages: number;
  onPageChange: (p: number) => void;
  onSort: (col: string) => void;
}

export const TransactionTable = ({ data, isLoading, total, page, pages, onPageChange, onSort }: Props) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkCat, setBulkCat] = useState('');
  const { mutate: bulk, isPending: bulkPending } = useBulkCategorize();

  const toggleAll = () => {
    setSelected(s => s.size === data.length ? new Set() : new Set(data.map(t => t.id)));
  };
  const toggle = (id: string) => {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const applyBulk = () => {
    if (!bulkCat || selected.size === 0) return;
    bulk({ ids: [...selected], category: bulkCat }, {
      onSuccess: () => { setSelected(new Set()); setBulkCat(''); },
    });
  };

  if (isLoading) return (
    <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  );

  return (
    <div>
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-4 p-3 glass"
        >
          <span className="text-sm text-slate-400">{selected.size} selected</span>
          <select
            value={bulkCat}
            onChange={e => setBulkCat(e.target.value)}
            className="input text-sm py-1.5 flex-1 max-w-xs"
          >
            <option value="">Assign category…</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            onClick={applyBulk}
            disabled={!bulkCat || bulkPending}
            className="btn-primary py-1.5 text-sm flex items-center gap-2"
          >
            {bulkPending ? <Spinner size="sm" /> : null}
            Apply
          </button>
          <button onClick={() => setSelected(new Set())} className="btn-ghost py-1.5 text-sm">
            Clear
          </button>
        </motion.div>
      )}

      <div className="glass overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="p-4 w-10">
                <input type="checkbox" checked={selected.size === data.length && data.length > 0}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded accent-brand-500 cursor-pointer" />
              </th>
              {[
                { label: 'Merchant',    key: null },
                { label: 'Date',        key: 'transactionDate' },
                { label: 'Amount',      key: 'amount' },
                { label: 'Category',    key: null },
                { label: 'Confidence',  key: null },
              ].map(col => (
                <th key={col.label}
                  className="p-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <button
                    onClick={() => col.key && onSort(col.key)}
                    className={`flex items-center gap-1 ${col.key ? 'hover:text-white' : ''} transition-colors`}
                  >
                    {col.label}
                    {col.key && <ArrowUpDown size={12} />}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((tx, i) => (
              <motion.tr
                key={tx.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className={`border-b border-white/3 hover:bg-white/2 transition-colors
                  ${selected.has(tx.id) ? 'bg-brand-500/5' : ''}`}
              >
                <td className="p-4">
                  <input type="checkbox" checked={selected.has(tx.id)} onChange={() => toggle(tx.id)}
                    className="w-4 h-4 rounded accent-brand-500 cursor-pointer" />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                      ${tx.transactionType === 'CREDIT' ? 'bg-green-500/20' : 'bg-red-500/10'}`}>
                      {tx.transactionType === 'CREDIT'
                        ? <ArrowDownLeft size={12} className="text-green-400" />
                        : <ArrowUpRight size={12} className="text-red-400" />
                      }
                    </div>
                    <div>
                      <p className="font-medium text-white">{tx.merchantName}</p>
                      <p className="text-xs text-slate-600 font-mono">{tx.transactionCode}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-slate-400">{fmt.date(tx.transactionDate)}</td>
                <td className="p-4">
                  <span className={`font-semibold ${tx.transactionType === 'CREDIT' ? 'text-green-400' : 'text-white'}`}>
                    {tx.transactionType === 'CREDIT' ? '+' : '-'}{fmt.currency(tx.amount)}
                  </span>
                </td>
                <td className="p-4">
                  <CategoryEditor txId={tx.id} current={tx.category} />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-surface-500 rounded-full overflow-hidden w-16">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${tx.confidenceScore * 100}%`,
                          background: tx.isManual ? '#10b981'
                            : tx.confidenceScore > 0.7 ? '#1279f1'
                            : tx.confidenceScore > 0.4 ? '#f59e0b' : '#ef4444',
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 w-8">
                      {tx.isManual ? '✓' : `${(tx.confidenceScore * 100).toFixed(0)}%`}
                    </span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {data.length === 0 && (
          <div className="py-20 text-center text-slate-500">
            <p className="text-4xl mb-3">📭</p>
            <p>No transactions found</p>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-xs text-slate-500">
              {total} transaction{total !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`w-8 h-8 text-xs rounded-lg transition-all ${
                    p === page ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-white/5'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};