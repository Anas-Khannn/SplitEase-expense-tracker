import { apiClient } from "./client";
import type {
  ApiResponse,
  Expense,
  ExpenseListResponse,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ExpenseFilters,
} from "@/types";

export const expensesApi = {
  list(groupId: string, filters?: ExpenseFilters) {
    const params: Record<string, string | number | undefined> = {};
    if (filters) {
      params.payer_id = filters.payer_id;
      params.start_date = filters.start_date;
      params.end_date = filters.end_date;
      params.page = filters.page;
      params.limit = filters.limit;
    }
    return apiClient.get<ApiResponse<ExpenseListResponse>>(
      `/groups/${groupId}/expenses`,
      { params }
    );
  },

  get(groupId: string, expenseId: string) {
    return apiClient.get<ApiResponse<{ expense: Expense }>>(
      `/groups/${groupId}/expenses/${expenseId}`
    );
  },

  create(groupId: string, data: CreateExpenseRequest) {
    return apiClient.post<ApiResponse<{ expense: Expense }>>(
      `/groups/${groupId}/expenses`,
      data
    );
  },

  update(groupId: string, expenseId: string, data: UpdateExpenseRequest) {
    return apiClient.put<ApiResponse<{ expense: Expense }>>(
      `/groups/${groupId}/expenses/${expenseId}`,
      data
    );
  },

  delete(groupId: string, expenseId: string) {
    return apiClient.delete<ApiResponse<null>>(
      `/groups/${groupId}/expenses/${expenseId}`
    );
  },
};
