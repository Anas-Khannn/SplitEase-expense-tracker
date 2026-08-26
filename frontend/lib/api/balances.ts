import { apiClient } from "./client";
import type { ApiResponse, Balance } from "@/types";

export const balancesApi = {
  get(groupId: string) {
    return apiClient.get<ApiResponse<{ balances: Balance[] }>>(
      `/groups/${groupId}/balances`
    );
  },
};
