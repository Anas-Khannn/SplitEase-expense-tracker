import { useSyncExternalStore } from "react";
import {
  getAuthToken,
  subscribeAuthToken,
} from "@/lib/auth-token";

export function useAuthToken() {
  return useSyncExternalStore(
    subscribeAuthToken,
    getAuthToken,
    () => null
  );
}
