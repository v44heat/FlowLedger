// ─── frontend/src/hooks/useTransactions.ts ────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '../api/client';

interface TxQuery {
  page?: number;
  limit?: number;
  category?: string;
  type?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
}

export const useTransactions = (q: TxQuery = {}) =>
  useQuery({
    queryKey: ['transactions', q],
    queryFn: () => transactionsApi.list(q).then(r => r.data),
    placeholderData: (prev) => prev,
  });

export const useCategorize = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, category }: { id: string; category: string }) =>
      transactionsApi.categorize(id, category).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

export const useBulkCategorize = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, category }: { ids: string[]; category: string }) =>
      transactionsApi.bulkCategorize(ids, category).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};


