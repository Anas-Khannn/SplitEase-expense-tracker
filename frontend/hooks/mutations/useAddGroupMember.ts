import { useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi } from "@/services";
import { queryKeys } from "@/lib/query-keys";

export function useAddGroupMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      identifier,
    }: {
      groupId: string;
      identifier: string;
    }) => groupsApi.addMember(groupId, { identifier }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.members(variables.groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.detail(variables.groupId),
      });
    },
  });
}
