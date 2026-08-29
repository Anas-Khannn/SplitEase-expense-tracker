import { useInfiniteQuery } from "@tanstack/react-query";
import { activityApi } from "@/services";
import { queryKeys } from "@/lib/query-keys";

const PAGE_SIZE = 20;

export function useGroupActivity(groupId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.activity.list(groupId),
    queryFn: async ({ pageParam }) => {
      const res = await activityApi.list(groupId, {
        page: pageParam,
        limit: PAGE_SIZE,
      });
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.total_pages
        ? lastPage.pagination.page + 1
        : undefined,
    enabled: !!groupId,
  });
}
