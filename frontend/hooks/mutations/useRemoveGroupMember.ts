import { useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi } from "@/services";
import { queryKeys } from "@/lib/query-keys";

export function useRemoveGroupMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      userId,
    }: {
      groupId: string;
      userId: string;
    }) => groupsApi.removeMember(groupId, userId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.members(variables.groupId),
      });
    },
  });
}
