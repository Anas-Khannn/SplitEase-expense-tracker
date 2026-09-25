import { apiClient } from "../lib/api/client";
import type {
  ApiResponse,
  AppNotification,
  NotificationListResponse,
  NotificationPreferences,
  NotificationPreferencesRequest,
} from "@/types";

export const notificationsApi = {
  list(params?: { page?: number; limit?: number }) {
    return apiClient.get<ApiResponse<NotificationListResponse>>(
      "/notifications",
      { params }
    );
  },

  getUnreadCount() {
    return apiClient.get<ApiResponse<{ count: number }>>(
      "/notifications/unread-count"
    );
  },

  markRead(notificationId: string) {
    return apiClient.patch<ApiResponse<{ notification: AppNotification }>>(
      `/notifications/${notificationId}/read`
    );
  },

  markAllRead() {
    return apiClient.patch<ApiResponse<null>>("/notifications/read-all");
  },

  getPreferences() {
    return apiClient.get<ApiResponse<{ preferences: NotificationPreferences }>>(
      "/notifications/preferences"
    );
  },

  updatePreferences(data: NotificationPreferencesRequest) {
    return apiClient.put<ApiResponse<{ preferences: NotificationPreferences }>>(
      "/notifications/preferences",
      data
    );
  },

  streamUrl() {
    const baseUrl =
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000/api";
    return `${baseUrl}/notifications/stream`;
  },
};