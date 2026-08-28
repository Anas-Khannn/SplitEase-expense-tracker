import { apiClient } from "../lib/api/client";
import type { ApiResponse, ActivityListResponse, ActivityPagination } from "@/types";

export const activityApi = {
  list(groupId: string, pagination?: ActivityPagination) {
    const params: Record<string, string | number | undefined> = {};
    if (pagination) {
      params.page = pagination.page;
      params.limit = pagination.limit;
    }
    return apiClient.get<ApiResponse<ActivityListResponse>>(
      `/groups/${groupId}/activity`,
      { params }
    );
  },
};
