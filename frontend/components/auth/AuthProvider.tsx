"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAuthToken } from "@/hooks/useAuthToken";
import { useIsClient } from "@/hooks/useIsClient";
import type { User } from "@/types";

export type AuthStatus = "initializing" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isReady: boolean;
  status: AuthStatus;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const isClient = useIsClient();
  const token = useAuthToken();
  const {
    data: user,
    isError,
  } = useCurrentUser();

  const status = useMemo<AuthStatus>(() => {
    // Server render and the initial hydration render must agree. Neither has
    // access to the browser-only session, so auth is always "initializing"
    // until the client has mounted and read the stored token.
    if (!isClient) return "initializing";

    if (token === null) return "unauthenticated";

    if (isError) return "unauthenticated";

    if (user) return "authenticated";

    // A token exists but /auth/me has not resolved yet.
    return "initializing";
  }, [isClient, token, user, isError]);

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "initializing";
  const isReady = status !== "initializing";

  const value = useMemo(
    () => ({
      user: user ?? null,
      isAuthenticated,
      isLoading,
      isReady,
      status,
    }),
    [user, isAuthenticated, isLoading, isReady, status]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
