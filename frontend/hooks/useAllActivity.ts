import { useMemo } from "react";
import {
  useQueries,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { activityApi } from "@/services";
import { queryKeys } from "@/lib/query-keys";
import type { Activity, GroupListItem } from "@/types";

const PAGE_SIZE = 20;

export function useAllActivity(groups: GroupListItem[] | undefined) {
  const queries = useMemo<Array<UseQueryOptions<Activity[], Error>>>(
    () =>
      (groups ?? []).map((group) => ({
        queryKey: queryKeys.activity.list(group.group_id, {
          page: 1,
          limit: PAGE_SIZE,
        }),
        queryFn: async () => {
          const res = await activityApi.list(group.group_id, {
            page: 1,
            limit: PAGE_SIZE,
          });
          return res.data.activities;
        },
        enabled: (groups?.length ?? 0) > 0,
      })),
    [groups]
  );

  return useQueries({ queries });
}
