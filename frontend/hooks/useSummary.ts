import { useQuery } from "@tanstack/react-query";
import { summaryApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useGroupSummary(groupId: string, month?: string) {
  return useQuery({
    queryKey: queryKeys.summary.group(groupId, month),
    queryFn: async () => {
      const res = await summaryApi.get(groupId, month);
      return res.data;
    },
    enabled: !!groupId,
  });
}
