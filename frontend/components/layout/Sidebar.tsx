"use client";

import { useMemo, type ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icon from "lucide-react";
import { Plus, Wallet, Settings } from "lucide-react";
import type { MenuItem, NavItem } from "@/configs/navConfig";
import { navItems } from "@/configs/navConfig";
import { isLinkActive, buildBalanceMap, formatCurrency } from "@/lib/selectors";
import { useAuth } from "@/components/auth/AuthProvider";
import { useGroups } from "@/hooks/useGroups";
import { useDashboardSummary } from "@/hooks/useDashboard";
import { cn } from "@/lib/utils/cn";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const SidebarMenuItemComponent = ({
  item,
  pathname,
}: {
  item: MenuItem;
  pathname: string;
}) => {
  const Tag = item.icon ? (Icon[item.icon] as ComponentType<{ className?: string }>) : null;
  const isActive = item.href ? isLinkActive(item.href, pathname) : false;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={item.label}
        render={<Link href={item.href ?? "/dashboard"} />}
        isActive={isActive}
        className="data-[active=true]:bg-zinc-100 dark:data-[active=true]:bg-zinc-800 data-[active=true]:font-semibold data-[active=true]:text-foreground rounded-lg"
      >
        {Tag && <Tag className="size-4 shrink-0" />}
        <span className="min-w-0 flex-1 truncate text-xs">{item.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default function SidebarLayout() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { data: groups } = useGroups();
  const { data: summary } = useDashboardSummary();

  const balances = useMemo(() => buildBalanceMap(summary), [summary]);

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "SE";

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <SidebarHeader className="p-4 pb-2 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:items-center">
        {/* Brand Header matching Stitch */}
        <div className="flex items-center gap-2.5 px-1 py-1 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:w-full">
          <Link
            href="/dashboard"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs hover:opacity-90 transition-opacity"
            title="SplitEase"
          >
            <Wallet className="size-4.5" />
          </Link>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold tracking-tight text-sm text-foreground">
                SplitEase
              </span>
              <span className="rounded bg-muted px-1 py-0.2 text-[10px] font-mono text-muted-foreground border border-border">
                v2.4
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">Expense Sharing</span>
          </div>
        </div>

        {/* Quick CTA Button matching Stitch */}
        <div className="pt-3 group-data-[collapsible=icon]:hidden">
          <Link
            href="/expenses"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white shadow-xs transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Plus className="size-3.5" />
            <span>Add expense</span>
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        {navItems.map((navItem: NavItem, index) => (
          <SidebarGroup key={navItem.groupLabel || index}>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItem.items.map((item) => (
                  <SidebarMenuItemComponent
                    key={item.label}
                    item={item}
                    pathname={pathname}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Pinned Groups Segment matching Stitch */}
        {groups && groups.length > 0 && (
          <div className="pt-3 mt-2 border-t border-zinc-100 dark:border-zinc-900 group-data-[collapsible=icon]:hidden">
            <div className="px-3 pb-2 flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 font-label">
                Pinned Groups
              </span>
              <Link
                href="/groups"
                className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 font-medium"
              >
                Edit
              </Link>
            </div>
            <div className="flex flex-col gap-0.5 px-1">
              {groups.slice(0, 4).map((g) => {
                const isGroupActive = pathname.includes(`/groups/${g.group_id}`);
                const grpBalance = balances[g.group_id];
                const isPositive = (grpBalance ?? 0) > 0;
                const isNegative = (grpBalance ?? 0) < 0;

                return (
                  <Link
                    key={g.group_id}
                    href={`/groups/${g.group_id}/summary`}
                    className={cn(
                      "rounded-lg px-2.5 py-1.5 flex items-center justify-between text-xs font-medium transition-colors group",
                      isGroupActive
                        ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 font-semibold"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={cn(
                          "size-2 rounded-full shrink-0",
                          isPositive
                            ? "bg-emerald-500"
                            : isNegative
                              ? "bg-rose-500"
                              : isGroupActive
                                ? "bg-emerald-500"
                                : "bg-zinc-300 dark:bg-zinc-700"
                        )}
                      />
                      <span className="truncate">{g.name}</span>
                    </div>
                    {grpBalance !== undefined ? (
                      <span
                        className={cn(
                          "text-[11px] font-semibold tabular-nums shrink-0",
                          isPositive
                            ? "text-emerald-600 dark:text-emerald-400"
                            : isNegative
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-zinc-400"
                        )}
                      >
                        {isPositive
                          ? `+${formatCurrency(grpBalance)}`
                          : isNegative
                            ? `-${formatCurrency(Math.abs(grpBalance))}`
                            : "$0.00"}
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-400 group-hover:text-zinc-600 font-normal shrink-0">
                        {isGroupActive ? "Active" : ""}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-2 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:items-center">
        {user && (
          <div className="flex items-center justify-between rounded-lg p-1.5 hover:bg-muted/70 transition-colors group group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full">
            <Link
              href="/profile"
              className="flex items-center gap-2.5 min-w-0 flex-1 group-data-[collapsible=icon]:flex-initial group-data-[collapsible=icon]:justify-center"
              title={user.name || "Profile"}
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold">
                {userInitials}
              </div>
              <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                <span className="truncate text-xs font-medium text-foreground">
                  {user.name}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </Link>
            <Link
              href="/settings"
              className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors group-data-[collapsible=icon]:hidden"
              title="Settings"
            >
              <Settings className="size-4" />
            </Link>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
