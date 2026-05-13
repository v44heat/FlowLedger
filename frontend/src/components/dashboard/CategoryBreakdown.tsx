// ─── frontend/src/components/dashboard/CategoryBreakdown.tsx ─────────────────
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CATEGORY_COLORS } from '../../utils/categories';
import { fmt } from '../../utils/formatters';

interface CatItem { category: string; amount: number; percentage: number }

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null;
  const rad = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + rad * Math.cos(-midAngle * (Math.PI / 180));
  const y = cy + rad * Math.sin(-midAngle * (Math.PI / 180));
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const CategoryBreakdown = ({ data }: { data: CatItem[] }) => {
  const top = data.slice(0, 7);
  return (
    <div className="glass p-5">
      <h3 className="text-sm font-medium text-slate-400 mb-4">Category Breakdown</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={top} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
               dataKey="amount" labelLine={false} label={renderLabel}>
            {top.map((e, i) => (
              <Cell key={i} fill={CATEGORY_COLORS[e.category] || '#6b7280'} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number) => [fmt.currency(v), 'Amount']}
            contentStyle={{ background: '#181c26', border: '1px solid #2e3650', borderRadius: 12 }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Legend
            formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};


