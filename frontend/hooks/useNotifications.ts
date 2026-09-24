import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "@/services";
import { queryKeys } from "@/lib/query-keys";

export function useNotifications(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: async () => {
      const res = await notificationsApi.list(params);
      return res.data;
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      const res = await notificationsApi.getUnreadCount();
      return res.data.count;
    },
    refetchInterval: 30_000,
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: queryKeys.notifications.preferences(),
    queryFn: async () => {
      const res = await notificationsApi.getPreferences();
      return res.data.preferences;
    },
  });
}