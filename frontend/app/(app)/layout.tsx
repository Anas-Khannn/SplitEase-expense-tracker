"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLogout } from "@/hooks/mutations/useLogout";
import { Button } from "@/components/ui";
import { LogOut } from "lucide-react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const logout = useLogout();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-base">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          <p className="text-body-sm text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-dvh bg-base">
      <header className="sticky top-0 z-40 border-b border-border-default bg-surface/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <h1 className="text-h3 font-bold text-primary-500">SplitEase</h1>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-body-sm text-text-secondary hidden sm:inline">
                {user.name}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              icon={<LogOut />}
              onClick={() => {
                logout.mutate(undefined, {
                  onSettled: () => {
                    router.push("/login");
                  },
                });
              }}
              loading={logout.isPending}
              aria-label="Log out"
            >
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
