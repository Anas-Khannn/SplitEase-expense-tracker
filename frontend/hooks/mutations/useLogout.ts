import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "@/services";
import { setAuthToken } from "@/lib/auth-token";
import { queryKeys } from "@/lib/query-keys";

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      setAuthToken(null);
      queryClient.removeQueries({ queryKey: queryKeys.auth.me() });
      queryClient.clear();
      try {
        await authApi.logout();
      } catch {
        // Best-effort server call. The local session is already cleared, so a
        // failed or slow logout request must never block or error the redirect.
      }
    },
    onSettled: () => {
      router.replace("/login");
    },
  });
}
