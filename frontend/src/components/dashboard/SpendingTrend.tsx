// ─── frontend/src/components/dashboard/SpendingTrend.tsx ─────────────────────
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  } from 'recharts';
  import { fmt } from '../../utils/formatters';
  
  interface Props { data: { date: string; amount: number }[] }
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="glass px-3 py-2 text-sm">
        <p className="text-slate-400">{label}</p>
        <p className="font-semibold text-brand-400">{fmt.currency(payload[0].value)}</p>
      </div>
    );
  };
  
  export const SpendingTrend = ({ data }: Props) => (
    <div className="glass p-5">
      <h3 className="text-sm font-medium text-slate-400 mb-4">Daily Spending</h3>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#1279f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#1279f1" stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2333" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false}
                 tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="amount" stroke="#1279f1" strokeWidth={2}
                fill="url(#spendGrad)" dot={false} activeDot={{ r: 5, fill: '#1279f1' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
  
  
  