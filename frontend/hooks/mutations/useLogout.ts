import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/services";

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await authApi.logout();
    },
    onSettled: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      queryClient.clear();
    },
  });
}
