import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/services";

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      queryClient.clear();
      try {
        await authApi.logout();
      } catch {
        // Best-effort server call. The local session is already cleared, so a
        // failed or slow logout request must never block or error the redirect.
      }
    },
  });
}
