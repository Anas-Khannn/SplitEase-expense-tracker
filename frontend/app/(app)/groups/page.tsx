"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useGroups } from "@/hooks/useGroups";
import { useDashboardSummary } from "@/hooks/useDashboard";
import { useAllGroupMembers } from "@/hooks/useAllGroupMembers";
import { CreateGroupModal } from "@/components/groups/CreateGroupModal";
import { GroupsPageSkeleton } from "@/components/skeletons";
import { buildBalanceMap, filterGroups, formatCurrency, type GroupTab } from "@/lib/selectors";
import { groupIcon } from "@/lib/utils/group-icons";
import {
  Button,
  Avatar,
  Badge,
  Input,
  EmptyState,
  ErrorState,
} from "@/components/ui";
import {
  Plus,
  Users,
  Search,
  Wallet,
  TrendingDown,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function GroupsPage() {
  const {
    data: groups,
    isLoading: groupsLoading,
    isError: groupsError,
    error: groupsErrorMsg,
    refetch: refetchGroups,
  } = useGroups();

  const {
    data: summary,
    isLoading: summaryLoading,
  } = useDashboardSummary();

  const memberQueries = useAllGroupMembers(groups);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<GroupTab>("all");

  const balances = useMemo(() => buildBalanceMap(summary), [summary]);
  const hasBalances = summary !== undefined && !summaryLoading;

  const filteredGroups = useMemo(
    () => filterGroups(groups, searchQuery, activeTab, balances, hasBalances),
    [groups, searchQuery, activeTab, balances, hasBalances]
  );

  const totalGroups = groups?.length ?? 0;
  const activeCount = useMemo(() => {
    if (!groups || !hasBalances) return 0;
    return groups.filter((g) => balances[g.group_id] !== 0).length;
  }, [groups, balances, hasBalances]);
  const settledCount = useMemo(() => {
    if (!groups || !hasBalances) return 0;
    return groups.filter((g) => balances[g.group_id] === 0).length;
  }, [groups, balances, hasBalances]);

  const totalOwed = summary?.total_owed ?? 0;
  const totalOwe = summary?.total_owe ?? 0;
  const netBalance = summary?.net_balance ?? 0;

  const isLoading = groupsLoading || summaryLoading;

  return (
    <div className="space-y-8 pb-8">
      {/* 1. Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Your Groups
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your shared expenses, track settlements, and split costs seamlessly.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            className="gap-1.5 rounded-lg"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="size-4" />
            <span>Create group</span>
          </Button>
        </div>
      </div>

      {isLoading && <GroupsPageSkeleton />}

      {groupsError && (
        <ErrorState
          title="Failed to load your groups"
          description={groupsErrorMsg?.message ?? "Please check your network and try again."}
          onRetry={refetchGroups}
        />
      )}

      {!isLoading && !groupsError && (
        <>
          {/* 2. Three Summary / Stat Cards Row matching Stitch */}
          {summary && (
            <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {/* Card 1: Total balance */}
              <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-2xs transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-label">
                    Total balance
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Wallet className="size-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                      {netBalance >= 0 ? `+${formatCurrency(netBalance)}` : `-${formatCurrency(Math.abs(netBalance))}`}
                    </span>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                        netBalance >= 0
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/80 dark:bg-emerald-950/50 dark:text-emerald-400"
                          : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/80 dark:bg-rose-950/50 dark:text-rose-400"
                      )}
                    >
                      {netBalance >= 0 ? "Overall positive" : "Deficit"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Net position across all groups
                  </p>
                </div>
              </div>

              {/* Card 2: You're owed */}
              <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-2xs transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-label">
                    You&apos;re owed
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                    <TrendingUp className="size-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
                    +{formatCurrency(totalOwed)}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Owed to you across active groups
                  </p>
                </div>
              </div>

              {/* Card 3: You owe */}
              <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-2xs transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-label">
                    You owe
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                    <TrendingDown className="size-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
                    -{formatCurrency(totalOwe)}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Pending liabilities due
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* 3. Search and Segmented Filter Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex rounded-lg bg-muted p-1 text-xs font-medium text-muted-foreground">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={cn(
                  "rounded-md px-3 py-1.5 transition-all",
                  activeTab === "all"
                    ? "bg-background font-semibold text-foreground shadow-2xs"
                    : "hover:text-foreground"
                )}
              >
                All Groups ({totalGroups})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("outstanding")}
                className={cn(
                  "rounded-md px-3 py-1.5 transition-all",
                  activeTab === "outstanding"
                    ? "bg-background font-semibold text-foreground shadow-2xs"
                    : "hover:text-foreground"
                )}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("settled")}
                className={cn(
                  "rounded-md px-3 py-1.5 transition-all",
                  activeTab === "settled"
                    ? "bg-background font-semibold text-foreground shadow-2xs"
                    : "hover:text-foreground"
                )}
              >
                Settled ({settledCount})
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search groups by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>

          {/* 4. Groups Bento Grid */}
          {totalGroups === 0 ? (
            <EmptyState
              className="py-16"
              icon={<Users />}
              title="No groups created yet"
              description="Groups let you organize shared expenses with housemates, trip squads, or friends."
              action={
                <Button
                  variant="primary"
                  className="gap-2 mt-2"
                  onClick={() => setModalOpen(true)}
                >
                  <Plus className="size-4" />
                  Create your first group
                </Button>
              }
            />
          ) : filteredGroups.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
              No groups match your search or filter criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredGroups.map((group, idx) => {
                const bal = balances[group.group_id] ?? 0;
                const isSettled = bal === 0;
                const isOwed = bal > 0;
                const members = memberQueries[idx]?.data ?? [];

                return (
                  <div
                    key={group.group_id}
                    className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-2xs transition-all hover:border-zinc-300 hover:shadow-sm dark:hover:border-zinc-700"
                  >
                    <div>
                      {/* Top Row: Icon and Badges */}
                      <div className="flex items-start justify-between">
                        <div className="flex size-11 items-center justify-center rounded-lg border border-border bg-muted/80 text-foreground text-xl">
                          {groupIcon(group.icon)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {group.role === "admin" && (
                            <Badge variant="primary" className="text-[10px]">
                              Admin
                            </Badge>
                          )}
                          <span
                            className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold",
                              isSettled
                                ? "bg-muted text-muted-foreground"
                                : isOwed
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                            )}
                          >
                            {isSettled ? "Settled" : isOwed ? `+${formatCurrency(bal)} owed` : `-${formatCurrency(Math.abs(bal))} owe`}
                          </span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div className="mt-4">
                        <h3 className="text-base font-bold text-foreground truncate">
                          {group.name}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {group.description || "Shared group expenses and settlement records."}
                        </p>
                      </div>

                      {/* Member Avatars */}
                      <div className="mt-4 flex items-center gap-2">
                        {members.length > 0 ? (
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {members.slice(0, 4).map((m) => (
                              <Avatar
                                key={m.user_id}
                                name={m.name || m.user_id}
                                alt={m.name || "Member"}
                                size="sm"
                                className="ring-2 ring-card"
                              />
                            ))}
                          </div>
                        ) : null}
                        <span className="text-xs text-muted-foreground">
                          {members.length} {members.length === 1 ? "member" : "members"}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                      <Link
                        href={`/groups/${group.group_id}/expenses`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:underline"
                      >
                        <span>View Expenses</span>
                        <ArrowRight className="size-3.5" />
                      </Link>
                      <Link
                        href={`/groups/${group.group_id}/balances`}
                        className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        Balances
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <CreateGroupModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}