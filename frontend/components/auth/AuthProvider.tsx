"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isReady: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    data: user,
    isLoading,
    isError,
  } = useCurrentUser();

  const isAuthenticated = useMemo(
    () => !!user && !isError,
    [user, isError]
  );

  const isReady = useMemo(
    () => !isLoading,
    [isLoading]
  );

  const value = useMemo(
    () => ({
      user: user ?? null,
      isAuthenticated,
      isLoading,
      isReady,
    }),
    [user, isAuthenticated, isLoading, isReady]
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
