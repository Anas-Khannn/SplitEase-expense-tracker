import { useMutation, useQueryClient } from "@tanstack/react-query";
import { expensesApi } from "@/services";
import { queryKeys } from "@/lib/query-keys";
import type { CreateExpenseRequest } from "@/types";

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      data,
    }: {
      groupId: string;
      data: CreateExpenseRequest;
    }) => expensesApi.create(groupId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.expenses.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.balances.group(variables.groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.activity.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.summary.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.all,
      });
    },
  });
}
