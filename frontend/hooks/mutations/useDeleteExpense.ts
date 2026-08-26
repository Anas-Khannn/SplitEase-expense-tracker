import { useMutation, useQueryClient } from "@tanstack/react-query";
import { expensesApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      expenseId,
    }: {
      groupId: string;
      expenseId: string;
    }) => expensesApi.delete(groupId, expenseId),
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
