import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/services";
import { queryKeys } from "@/lib/query-keys";

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const res = await authApi.getMe();
      return res.data.user;
    },
    retry: false,
  });
}
