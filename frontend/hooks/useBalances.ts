import { useQuery } from "@tanstack/react-query";
import { balancesApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useGroupBalance(groupId: string) {
  return useQuery({
    queryKey: queryKeys.balances.group(groupId),
    queryFn: async () => {
      const res = await balancesApi.get(groupId);
      return res.data.balances;
    },
    enabled: !!groupId,
  });
}
