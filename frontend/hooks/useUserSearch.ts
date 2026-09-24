import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/services";
import { queryKeys } from "@/lib/query-keys";
import { useEffect, useState } from "react";

export function useUserSearch(query: string) {
  const [debounced, setDebounced] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  return useQuery({
    queryKey: queryKeys.users.search(debounced.trim()),
    queryFn: async () => {
      const res = await usersApi.search(debounced.trim());
      return res.data.users;
    },
    enabled: debounced.trim().length >= 2,
  });
}