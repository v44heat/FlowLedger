// ─── frontend/src/hooks/useBudgets.ts ────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsApi } from '../api/client';

export const useBudgets = (year?: number, month?: number) =>
  useQuery({
    queryKey: ['budgets', year, month],
    queryFn: () => budgetsApi.list({ year, month }).then(r => r.data),
  });

export const useUpsertBudget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { category: string; monthlyLimit: number; month?: number; year?: number }) =>
      budgetsApi.upsert(data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  });
};

export const useDeleteBudget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => budgetsApi.remove(id).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  });
};