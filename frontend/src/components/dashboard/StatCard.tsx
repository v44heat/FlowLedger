// ─── frontend/src/components/dashboard/StatCard.tsx ────────────────────────
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: ReactNode;
  trend?: { value: number; label: string };
  delay?: number;
}

export const StatCard = ({ label, value, sub, icon, trend, delay = 0 }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="glass p-5"
  >
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm text-slate-400">{label}</span>
      <div className="w-9 h-9 rounded-xl bg-surface-600 flex items-center justify-center text-brand-400">
        {icon}
      </div>
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
    {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    {trend && (
      <p className={`text-xs mt-2 font-medium ${trend.value >= 0 ? 'text-red-400' : 'text-green-400'}`}>
        {trend.value >= 0 ? '▲' : '▼'} {Math.abs(trend.value).toFixed(1)}% {trend.label}
      </p>
    )}
  </motion.div>
);


