import { apiClient } from "../lib/api/client";
import type { ApiResponse, UserSearchResult } from "@/types";

export const usersApi = {
  search(q: string) {
    return apiClient.get<ApiResponse<{ users: UserSearchResult[] }>>(
      "/users/search",
      { params: { q } }
    );
  },
};