import type { DashboardSummary, GroupListItem } from "@/types";

export type GroupTab = "all" | "settled" | "outstanding";

export function buildBalanceMap(
  summary: DashboardSummary | undefined
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const group of summary?.groups ?? []) {
    map[group.group_id] = group.balance;
  }
  return map;
}

export function filterGroups(
  groups: GroupListItem[] | undefined,
  query: string,
  tab: GroupTab,
  balances: Record<string, number>,
  hasBalances: boolean
): GroupListItem[] {
  const search = query.trim().toLowerCase();
  return (groups ?? []).filter((group) => {
    if (search && !group.name.toLowerCase().includes(search)) return false;
    if (!hasBalances || tab === "all") return true;
    const balance = balances[group.group_id];
    if (tab === "settled") return balance === 0;
    return balance !== 0;
  });
}

export function isLinkActive(href: string, pathname: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}