// ─── frontend/src/hooks/useAnalytics.ts ──────────────────────────────────────
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/client';

export const useMonthlyAnalytics = (year?: number, month?: number) =>
  useQuery({
    queryKey: ['analytics', 'monthly', year, month],
    queryFn: () => analyticsApi.monthly({ year, month }).then(r => r.data),
  });

export const useTrends = (months = 6) =>
  useQuery({
    queryKey: ['analytics', 'trends', months],
    queryFn: () => analyticsApi.trends(months).then(r => r.data),
  });

export const useCategoryTrends = (months = 3) =>
  useQuery({
    queryKey: ['analytics', 'categories', months],
    queryFn: () => analyticsApi.categories(months).then(r => r.data),
  });

export const useInsights = () =>
  useQuery({
    queryKey: ['analytics', 'insights'],
    queryFn: () => analyticsApi.insights().then(r => r.data),
  });


