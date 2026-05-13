// ─── frontend/src/utils/categories.ts ─────────────────────────────────────────
export const CATEGORIES = [
  'Food & Dining',
  'Transport',
  'Groceries',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Health',
  'Education',
  'Savings & Investment',
  'Mobile & Internet',
  'Transfer',
  'Income',
  'Withdrawal',
  'Uncategorized',
] as const;

export type Category = typeof CATEGORIES[number];

export const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining':       '#f97316',
  'Transport':           '#3b82f6',
  'Groceries':           '#22c55e',
  'Utilities':           '#a855f7',
  'Entertainment':       '#ec4899',
  'Shopping':            '#f59e0b',
  'Health':              '#14b8a6',
  'Education':           '#6366f1',
  'Savings & Investment':'#10b981',
  'Mobile & Internet':   '#0ea5e9',
  'Transfer':            '#64748b',
  'Income':              '#84cc16',
  'Withdrawal':          '#ef4444',
  'Uncategorized':       '#6b7280',
};

export const CATEGORY_ICONS: Record<string, string> = {
  'Food & Dining':       '🍽️',
  'Transport':           '🚗',
  'Groceries':           '🛒',
  'Utilities':           '💡',
  'Entertainment':       '🎉',
  'Shopping':            '🛍️',
  'Health':              '🏥',
  'Education':           '📚',
  'Savings & Investment':'💰',
  'Mobile & Internet':   '📱',
  'Transfer':            '↔️',
  'Income':              '💵',
  'Withdrawal':          '🏧',
  'Uncategorized':       '❓',
};