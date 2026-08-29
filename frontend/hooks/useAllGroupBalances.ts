import { useMemo } from "react";
import {
  useQueries,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { balancesApi } from "@/services";
import { queryKeys } from "@/lib/query-keys";
import type { Balance, GroupListItem } from "@/types";

export function useAllGroupBalances(groups: GroupListItem[] | undefined) {
  const queries = useMemo<Array<UseQueryOptions<Balance[], Error>>>(
    () =>
      (groups ?? []).map((group) => ({
        queryKey: queryKeys.balances.group(group.group_id),
        queryFn: async () => {
          const res = await balancesApi.get(group.group_id);
          return res.data.balances;
        },
        enabled: (groups?.length ?? 0) > 0,
      })),
    [groups]
  );

  return useQueries({ queries });
}
