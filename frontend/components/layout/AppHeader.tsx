"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { IconButton, Avatar } from "@/components/ui";
import { Menu, Bell } from "lucide-react";

interface AppHeaderProps {
  onMenuToggle?: () => void;
}

export function AppHeader({ onMenuToggle }: AppHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border-default bg-surface/80 px-4 backdrop-blur-sm">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {onMenuToggle && (
          <IconButton
            icon={<Menu />}
            size="sm"
            aria-label="Open navigation menu"
            onClick={onMenuToggle}
            className="lg:hidden"
          />
        )}
        <span className="text-h3 font-bold text-primary-500 lg:hidden">
          SplitEase
        </span>
        <span className="hidden text-caption text-text-muted lg:block">
          SplitEase
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <IconButton icon={<Bell />} size="sm" aria-label="Notifications" />
        {user && (
          <Link
            href="/profile"
            className="flex items-center gap-2 rounded-radius-md px-1.5 py-1 transition-colors duration-150 hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            <Avatar name={user.name} alt={user.name} size="sm" />
            <span className="hidden min-w-0 text-left sm:block">
              <span className="block max-w-40 truncate text-body-sm font-medium text-text-primary">
                {user.name}
              </span>
              <span className="block max-w-40 truncate text-caption text-text-muted">
                {user.email}
              </span>
            </span>
          </Link>
        )}
      </div>
    </header>
  );
}