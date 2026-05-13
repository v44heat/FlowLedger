// ─── frontend/src/components/dashboard/InsightsPanel.tsx ─────────────────────
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

export const InsightsPanel = ({ insights }: { insights: string[] }) => (
  <div className="glass p-5">
    <div className="flex items-center gap-2 mb-4">
      <Lightbulb size={16} className="text-brand-400" />
      <h3 className="text-sm font-medium text-slate-400">Smart Insights</h3>
    </div>
    <div className="space-y-3">
      {insights.map((insight, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex gap-3 p-3 bg-brand-500/5 border border-brand-500/10 rounded-xl"
        >
          <span className="text-brand-400 text-lg leading-none">💡</span>
          <p className="text-sm text-slate-300 leading-relaxed">{insight}</p>
        </motion.div>
      ))}
    </div>
  </div>
);