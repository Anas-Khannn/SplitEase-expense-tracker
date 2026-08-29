import { useMemo } from "react";
import {
  useQueries,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { groupsApi } from "@/services";
import { queryKeys } from "@/lib/query-keys";
import type { GroupListItem, GroupMemberRecord } from "@/types";

export function useAllGroupMembers(groups: GroupListItem[] | undefined) {
  const queries = useMemo<Array<UseQueryOptions<GroupMemberRecord[], Error>>>(
    () =>
      (groups ?? []).map((group) => ({
        queryKey: queryKeys.groups.members(group.group_id),
        queryFn: async () => {
          const res = await groupsApi.getMembers(group.group_id);
          return res.data.members;
        },
        enabled: (groups?.length ?? 0) > 0,
      })),
    [groups]
  );

  return useQueries({ queries });
}