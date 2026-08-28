import { apiClient } from "../lib/api/client";
import type { ApiResponse, DashboardSummary } from "@/types";

export const dashboardApi = {
  getSummary() {
    return apiClient.get<ApiResponse<DashboardSummary>>("/dashboard/summary");
  },
};
