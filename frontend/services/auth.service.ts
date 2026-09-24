import { apiClient } from "../lib/api/client";
import type {
  ApiResponse,
  AuthData,
  SendVerificationOtpRequest,
  SendVerificationOtpResponse,
  SignupRequest,
  User,
  VerifyEmailRequest,
} from "@/types";

export const authApi = {
  signup(data: SignupRequest) {
    return apiClient.post<ApiResponse<AuthData>>("/auth/signup", data);
  },

  login(data: { email: string; password: string }) {
    return apiClient.post<ApiResponse<AuthData>>("/auth/login", data);
  },

  sendVerificationOtp(data: SendVerificationOtpRequest) {
    return apiClient.post<ApiResponse<SendVerificationOtpResponse>>(
      "/auth/send-verification-otp",
      data
    );
  },

  verifyEmail(data: VerifyEmailRequest) {
    return apiClient.post<ApiResponse<AuthData>>("/auth/verify-email", data);
  },

  logout() {
    return apiClient.post<ApiResponse<null>>("/auth/logout");
  },

  getMe() {
    return apiClient.get<ApiResponse<{ user: User }>>("/auth/me");
  },
};
