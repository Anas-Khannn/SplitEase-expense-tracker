import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/services";
import { queryKeys } from "@/lib/query-keys";

function hasToken() {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
}

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const res = await authApi.getMe();
      return res.data.user;
    },
    enabled: hasToken(),
    retry: false,
  });
}
