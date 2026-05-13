// ─── frontend/src/utils/formatters.ts ─────────────────────────────────────────
import { format, parseISO, isValid } from 'date-fns';

export const fmt = {
  currency: (n: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(n),

  number: (n: number) =>
    new Intl.NumberFormat('en-KE').format(n),

  percent: (n: number, decimals = 1) => `${n.toFixed(decimals)}%`,

  date: (d: string | Date) => {
    const parsed = typeof d === 'string' ? parseISO(d) : d;
    return isValid(parsed) ? format(parsed, 'dd MMM yyyy') : '—';
  },

  dateTime: (d: string | Date) => {
    const parsed = typeof d === 'string' ? parseISO(d) : d;
    return isValid(parsed) ? format(parsed, 'dd MMM yyyy, HH:mm') : '—';
  },

  shortDate: (d: string | Date) => {
    const parsed = typeof d === 'string' ? parseISO(d) : d;
    return isValid(parsed) ? format(parsed, 'dd MMM') : '—';
  },

  monthYear: (d: string | Date) => {
    const parsed = typeof d === 'string' ? parseISO(d) : d;
    return isValid(parsed) ? format(parsed, 'MMMM yyyy') : '—';
  },
};

