"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui";
import { Search, Bell, Plus, DollarSign } from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard Overview";
    if (pathname === "/groups") return "Your Groups";
    if (pathname.includes("/expenses")) return "Expenses";
    if (pathname.includes("/balances")) return "Balances";
    if (pathname.includes("/activity")) return "Activity Feed";
    if (pathname === "/profile") return "Profile";
    if (pathname === "/settings") return "Settings";
    return "SplitEase";
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 px-4 backdrop-blur-md sm:px-8">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4">
        {/* Left: Sidebar Trigger, Title, and Live Sync */}
        <div className="flex items-center gap-3">
          <SidebarTrigger className="size-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" />
          <div className="hidden items-center gap-2.5 sm:flex">
            <h1 className="text-base font-semibold tracking-tight text-foreground">
              {getPageTitle()}
            </h1>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live sync</span>
            </div>
          </div>
        </div>

        {/* Center / Right Utility Cluster matching Stitch */}
        <div className="flex items-center gap-3">
          {/* Quick Search Bar */}
          <div className="relative hidden w-64 md:block lg:w-72">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search expenses, groups..."
              className="h-9 w-full rounded-lg border border-border bg-muted/50 pl-9 pr-12 text-xs text-foreground placeholder:text-muted-foreground transition-all hover:bg-muted focus:border-ring focus:bg-background focus:outline-none"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground shadow-2xs">
              ⌘K
            </kbd>
          </div>

          {/* Currency Selector Badge */}
          <div className="hidden items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground shadow-2xs sm:flex">
            <DollarSign className="size-3.5 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">USD</span>
            <span className="font-semibold">($)</span>
          </div>

          {/* Notification Bell */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Bell className="size-4" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-background" />
          </button>

          <span className="hidden h-4 w-px bg-border sm:block" />

          {/* Primary Action Button */}
          <Link href="/expenses">
            <Button
              size="sm"
              className="hidden gap-1.5 rounded-lg bg-primary text-xs font-medium text-primary-foreground hover:bg-primary/90 sm:inline-flex"
            >
              <Plus className="size-3.5" />
              <span>Add expense</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
