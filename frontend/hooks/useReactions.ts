import { useQuery } from "@tanstack/react-query";
import { reactionsApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useExpenseReactions(expenseId: string) {
  return useQuery({
    queryKey: queryKeys.reactions.expense(expenseId),
    queryFn: async () => {
      const res = await reactionsApi.list(expenseId);
      return res.data.reactions;
    },
    enabled: !!expenseId,
  });
}
