"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !isAuthRoute) {
      router.replace("/login");
    } else if (isAuthenticated && isAuthRoute) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, isAuthRoute, router, pathname]);

  if (isLoading) {
    return (
        <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isAuthRoute) {
    return null;
  }

  if (isAuthenticated && isAuthRoute) {
    return null;
  }

  return <>{children}</>;
}
