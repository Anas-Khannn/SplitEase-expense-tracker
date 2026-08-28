import { useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi } from "@/services";
import { queryKeys } from "@/lib/query-keys";

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; icon?: string; description?: string }) =>
      groupsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.list() });
    },
  });
}
