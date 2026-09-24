import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/services";
import { queryKeys } from "@/lib/query-keys";

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: { expenses?: boolean; settlements?: boolean; members?: boolean; reactions?: boolean }
    ) => notificationsApi.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.preferences(),
      });
    },
  });
}