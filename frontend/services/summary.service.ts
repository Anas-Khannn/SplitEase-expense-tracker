import { apiClient } from "../lib/api/client";
import type { ApiResponse, GroupSummary } from "@/types";

export const summaryApi = {
  get(groupId: string, month?: string) {
    const params: Record<string, string | number | undefined> = {};
    if (month) params.month = month;
    return apiClient.get<ApiResponse<GroupSummary>>(
      `/groups/${groupId}/summary`,
      { params }
    );
  },
};
