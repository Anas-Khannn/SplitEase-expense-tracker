import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactionsApi } from "@/services";
import { queryKeys } from "@/lib/query-keys";
import type { ReactionType } from "@/types";

export function useAddExpenseReaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      expenseId,
      reaction,
    }: {
      expenseId: string;
      reaction: ReactionType;
    }) => reactionsApi.add(expenseId, { reaction }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.reactions.expense(variables.expenseId),
      });
    },
  });
}
