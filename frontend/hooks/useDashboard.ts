import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/services";
import { queryKeys } from "@/lib/query-keys";

export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: async () => {
      const res = await dashboardApi.getSummary();
      return res.data;
    },
  });
}
