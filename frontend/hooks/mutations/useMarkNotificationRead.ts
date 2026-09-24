import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/services";
import { queryKeys } from "@/lib/query-keys";

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationsApi.markRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.list(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unreadCount(),
      });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.list(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unreadCount(),
      });
    },
  });
}