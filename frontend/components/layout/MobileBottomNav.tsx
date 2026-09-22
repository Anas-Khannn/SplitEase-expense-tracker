"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ReceiptText,
  Wallet,
  History,
  Users,
} from "lucide-react";
import { isLinkActive } from "@/lib/selectors";
import { cn } from "@/lib/utils/cn";

interface NavDestination {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const destinations: NavDestination[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Expenses",
    href: "/expenses",
    icon: ReceiptText,
  },
  {
    label: "Balances",
    href: "/balances",
    icon: Wallet,
  },
  {
    label: "Activity",
    href: "/activity",
    icon: History,
  },
  {
    label: "Groups",
    href: "/groups",
    icon: Users,
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 flex h-16 w-full items-center justify-around border-t border-border bg-background/95 px-2 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-md md:hidden"
    >
      {destinations.map((dest) => {
        const active = isLinkActive(dest.href, pathname);
        const Icon = dest.icon;

        return (
          <Link
            key={dest.href}
            href={dest.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-1 text-xs font-medium transition-colors active:scale-95",
              active
                ? "font-semibold text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="relative">
              <Icon
                className={cn(
                  "size-5 transition-transform",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
                strokeWidth={active ? 2.4 : 1.8}
                aria-hidden="true"
              />
              {active && (
                <span className="absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </div>
            <span className="text-[11px] tracking-tight">{dest.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
