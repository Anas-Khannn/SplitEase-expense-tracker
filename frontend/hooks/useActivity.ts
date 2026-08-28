import { useQuery } from "@tanstack/react-query";
import { activityApi } from "@/services";
import { queryKeys } from "@/lib/query-keys";
import type { ActivityPagination } from "@/types";

export function useGroupActivity(groupId: string, pagination?: ActivityPagination) {
  return useQuery({
    queryKey: queryKeys.activity.list(groupId, pagination as Record<string, unknown>),
    queryFn: async () => {
      const res = await activityApi.list(groupId, pagination);
      return res.data;
    },
    enabled: !!groupId,
  });
}
