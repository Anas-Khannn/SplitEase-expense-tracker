import { useQuery } from "@tanstack/react-query";
import { paymentsApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useGroupPayments(groupId: string) {
  return useQuery({
    queryKey: queryKeys.payments.list(groupId),
    queryFn: async () => {
      const res = await paymentsApi.list(groupId);
      return res.data.payments;
    },
    enabled: !!groupId,
  });
}
