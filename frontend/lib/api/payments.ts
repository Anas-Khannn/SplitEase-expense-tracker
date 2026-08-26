import { apiClient } from "./client";
import type {
  ApiResponse,
  Payment,
  CreatePaymentRequest,
} from "@/types";

export const paymentsApi = {
  list(groupId: string) {
    return apiClient.get<ApiResponse<{ payments: Payment[] }>>(
      `/groups/${groupId}/payments`
    );
  },

  create(groupId: string, data: CreatePaymentRequest) {
    return apiClient.post<ApiResponse<{ payment: Payment }>>(
      `/groups/${groupId}/payments`,
      data
    );
  },
};
