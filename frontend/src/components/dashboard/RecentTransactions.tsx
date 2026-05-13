// ─── frontend/src/components/dashboard/RecentTransactions.tsx ────────────────
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { CategoryBadge } from '../ui/Badge';
import { fmt } from '../../utils/formatters';

interface Tx {
  id: string; merchantName: string; category: string;
  amount: number; transactionType: string; transactionDate: string;
}

export const RecentTransactions = ({ data }: { data: Tx[] }) => (
  <div className="glass p-5">
    <h3 className="text-sm font-medium text-slate-400 mb-4">Recent Transactions</h3>
    <div className="space-y-1">
      {data.slice(0, 8).map(tx => (
        <div key={tx.id} className="flex items-center gap-3 py-2.5 px-3 hover:bg-white/3 rounded-xl transition-colors">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
            ${tx.transactionType === 'CREDIT' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            {tx.transactionType === 'CREDIT'
              ? <ArrowDownLeft size={14} className="text-green-400" />
              : <ArrowUpRight size={14} className="text-red-400" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{tx.merchantName}</p>
            <CategoryBadge category={tx.category} />
          </div>
          <div className="text-right">
            <p className={`text-sm font-semibold ${tx.transactionType === 'CREDIT' ? 'text-green-400' : 'text-white'}`}>
              {tx.transactionType === 'CREDIT' ? '+' : '-'}{fmt.currency(tx.amount)}
            </p>
            <p className="text-xs text-slate-500">{fmt.shortDate(tx.transactionDate)}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);


