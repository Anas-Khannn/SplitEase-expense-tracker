import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/services";
import { queryKeys } from "@/lib/query-keys";
import { useAuthToken } from "@/hooks/useAuthToken";

export function useCurrentUser() {
  const token = useAuthToken();

  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const res = await authApi.getMe();
      return res.data.user;
    },
    enabled: token != null,
    retry: false,
  });
}
