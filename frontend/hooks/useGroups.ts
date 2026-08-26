import { useQuery } from "@tanstack/react-query";
import { groupsApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useGroups() {
  return useQuery({
    queryKey: queryKeys.groups.list(),
    queryFn: async () => {
      const res = await groupsApi.list();
      return res.data.groups;
    },
  });
}

export function useGroup(groupId: string) {
  return useQuery({
    queryKey: queryKeys.groups.detail(groupId),
    queryFn: async () => {
      const res = await groupsApi.get(groupId);
      return res.data.group;
    },
    enabled: !!groupId,
  });
}

export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: queryKeys.groups.members(groupId),
    queryFn: async () => {
      const res = await groupsApi.getMembers(groupId);
      return res.data.members;
    },
    enabled: !!groupId,
  });
}
