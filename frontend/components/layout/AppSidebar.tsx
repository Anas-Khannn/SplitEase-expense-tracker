"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLogout } from "@/hooks/mutations/useLogout";
import { Button, Avatar } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Activity,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/balances", label: "Balances", icon: Wallet },
  { href: "/activity", label: "Activity", icon: Activity },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

interface AppSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ open, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const logout = useLogout();
  const router = useRouter();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => {
        router.push("/login");
      },
    });
  };

  const navContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center px-5 border-b border-border-default">
        <Link href="/dashboard" className="text-h3 font-bold text-primary-500">
          SplitEase
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
        <ul className="space-y-1" role="list">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-radius-md px-3 py-2 text-body-sm font-medium transition-colors duration-150",
                    active
                      ? "bg-primary-100 text-primary-600"
                      : "text-text-secondary hover:bg-surface-alt hover:text-text-primary"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {user && (
        <div className="shrink-0 border-t border-border-default p-3">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <Avatar name={user.name} alt={user.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-body-sm font-medium text-text-primary truncate">
                {user.name}
              </p>
              <p className="text-caption text-text-muted truncate">
                {user.email}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={<LogOut />}
            onClick={handleLogout}
            loading={logout.isPending}
            aria-label="Log out"
            className="mt-2 w-full justify-start"
          >
            Logout
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col bg-surface border-r border-border-default">
        {navContent}
      </aside>

      {/* Mobile drawer */}
      {open !== undefined && (
        <div className="lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div
            className={cn(
              "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300",
              open ? "opacity-100" : "pointer-events-none opacity-0"
            )}
            onClick={onClose}
            aria-hidden="true"
          />
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-64 transform bg-surface transition-transform duration-300 ease-in-out",
              open ? "translate-x-0" : "-translate-x-full"
            )}
          >
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
