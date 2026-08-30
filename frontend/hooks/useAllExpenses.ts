import { useMemo } from "react";
import {
  useQueries,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { expensesApi } from "@/services";
import { queryKeys } from "@/lib/query-keys";
import type { Expense, GroupListItem } from "@/types";

const PAGE_SIZE = 20;

export function useAllExpenses(groups: GroupListItem[] | undefined) {
  const queries = useMemo<Array<UseQueryOptions<Expense[], Error>>>(
    () =>
      (groups ?? []).map((group) => ({
        queryKey: queryKeys.expenses.list(group.group_id, {
          page: 1,
          limit: PAGE_SIZE,
        }),
        queryFn: async () => {
          const res = await expensesApi.list(group.group_id, {
            page: 1,
            limit: PAGE_SIZE,
          });
          return res.data.expenses;
        },
        enabled: (groups?.length ?? 0) > 0,
      })),
    [groups]
  );

  return useQueries({ queries });
}
