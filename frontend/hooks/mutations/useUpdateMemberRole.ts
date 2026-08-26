import { useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      userId,
      role,
    }: {
      groupId: string;
      userId: string;
      role: "admin" | "member";
    }) => groupsApi.updateMemberRole(groupId, userId, { role }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.members(variables.groupId),
      });
    },
  });
}
