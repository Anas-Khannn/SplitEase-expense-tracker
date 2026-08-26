import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactionsApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useRemoveExpenseReaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expenseId: string) => reactionsApi.remove(expenseId),
    onSuccess: (_data, expenseId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.reactions.expense(expenseId),
      });
    },
  });
}
