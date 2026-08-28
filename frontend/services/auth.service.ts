import { apiClient } from "../lib/api/client";
import type {
  ApiResponse,
  AuthData,
  User,
} from "@/types";

export const authApi = {
  signup(data: { name: string; email: string; password: string }) {
    return apiClient.post<ApiResponse<AuthData>>("/auth/signup", data);
  },

  login(data: { email: string; password: string }) {
    return apiClient.post<ApiResponse<AuthData>>("/auth/login", data);
  },

  logout() {
    return apiClient.post<ApiResponse<null>>("/auth/logout");
  },

  getMe() {
    return apiClient.get<ApiResponse<{ user: User }>>("/auth/me");
  },
};
