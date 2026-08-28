import { apiClient } from "../lib/api/client";
import type { ApiResponse, ExpenseReaction, AddReactionRequest } from "@/types";

export const reactionsApi = {
  list(expenseId: string) {
    return apiClient.get<ApiResponse<{ reactions: ExpenseReaction[] }>>(
      `/expenses/${expenseId}/reactions`
    );
  },

  add(expenseId: string, data: AddReactionRequest) {
    return apiClient.post<ApiResponse<{ reaction: ExpenseReaction }>>(
      `/expenses/${expenseId}/reactions`,
      data
    );
  },

  remove(expenseId: string) {
    return apiClient.delete<ApiResponse<null>>(
      `/expenses/${expenseId}/reactions`
    );
  },
};
