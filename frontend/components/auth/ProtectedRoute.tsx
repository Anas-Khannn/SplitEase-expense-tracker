"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  useEffect(() => {
    if (status === "initializing") return;

    if (!isAuthRoute && status === "unauthenticated") {
      router.replace("/login");
    } else if (isAuthRoute && status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, isAuthRoute, router, pathname]);

  if (status === "initializing") {
    // Auth routes render their content immediately so the login page never
    // flashes a loading screen; protected routes wait for the auth lifecycle.
    if (isAuthRoute) {
      return <>{children}</>;
    }

    return (
        <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3" role="status" aria-label="Loading">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthRoute && status === "authenticated") {
    return null;
  }

  if (!isAuthRoute && status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}
