import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { expensesApi } from "@/services";
import { queryKeys } from "@/lib/query-keys";
import type { ExpenseFilters } from "@/types";

export function useGroupExpenses(groupId: string, filters?: ExpenseFilters) {
  return useQuery({
    queryKey: queryKeys.expenses.list(groupId, filters as Record<string, unknown>),
    queryFn: async () => {
      const res = await expensesApi.list(groupId, filters);
      return res.data;
    },
    placeholderData: keepPreviousData,
    enabled: !!groupId,
  });
}

export function useExpense(groupId: string, expenseId: string) {
  return useQuery({
    queryKey: queryKeys.expenses.detail(groupId, expenseId),
    queryFn: async () => {
      const res = await expensesApi.get(groupId, expenseId);
      return res.data.expense;
    },
    enabled: !!groupId && !!expenseId,
  });
}
