"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useGroups } from "@/hooks/useGroups";
import { useDashboardSummary } from "@/hooks/useDashboard";
import { useAllGroupBalances } from "@/hooks/useAllGroupBalances";
import { BalancesPageSkeleton } from "@/components/skeletons";
import { formatCurrency } from "@/lib/selectors";
import {
  EmptyState,
  ErrorState,
} from "@/components/ui";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Download,
  CheckCircle,
  ArrowRight,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCw,
  Send,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { groupIcon } from "@/lib/utils/group-icons";

type PeopleFilter = "all" | "owed" | "owe";

const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400",
  "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
  "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400",
  "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400",
  "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400",
];

export default function BalancesPage() {
  const { user } = useAuth();
  const [peopleFilter, setPeopleFilter] = useState<PeopleFilter>("all");
  const [remindedMap, setRemindedMap] = useState<Record<string, boolean>>({});
  const [simplifyDebts, setSimplifyDebts] = useState(true);

  const {
    data: groups,
    isLoading: groupsLoading,
    isError: groupsError,
    refetch: refetchGroups,
  } = useGroups();

  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
    refetch: refetchSummary,
  } = useDashboardSummary();

  const groupQueries = useAllGroupBalances(groups);
  const balancesLoading = groupsLoading || summaryLoading || groupQueries.some((q) => q.isLoading);

  const totalOwed = summary?.total_owed ?? 0;
  const totalOwe = summary?.total_owe ?? 0;
  const netBalance = summary?.net_balance ?? 0;

  // Aggregate member-level balances across all groups
  const aggregatedMembers = useMemo(() => {
    if (!groups || !user) return [];
    const memberMap: Record<
      string,
      {
        userId: string;
        name: string;
        balance: number;
        groupNames: string[];
      }
    > = {};

    groups.forEach((group, idx) => {
      const q = groupQueries[idx];
      const balances = q?.data ?? [];
      const myBalance = balances.find((b) => b.user_id === user.user_id);
      if (!myBalance) return;

      balances.forEach((other) => {
        if (other.user_id === user.user_id) return;
        if (!memberMap[other.user_id]) {
          memberMap[other.user_id] = {
            userId: other.user_id,
            name: other.name || other.user_id,
            balance: 0,
            groupNames: [],
          };
        }
        if (!memberMap[other.user_id].groupNames.includes(group.name)) {
          memberMap[other.user_id].groupNames.push(group.name);
        }
        // Group balances: other.balance is relative to group net
        memberMap[other.user_id].balance += (other.balance || 0);
      });
    });

    return Object.values(memberMap);
  }, [groups, user, groupQueries]);

  const filteredMembers = useMemo(() => {
    return aggregatedMembers.filter((m) => {
      if (peopleFilter === "owed") return m.balance < 0; // they owe you
      if (peopleFilter === "owe") return m.balance > 0; // you owe them
      return true;
    });
  }, [aggregatedMembers, peopleFilter]);

  const owedCount = useMemo(
    () => aggregatedMembers.filter((m) => m.balance < 0).length,
    [aggregatedMembers]
  );
  const oweCount = useMemo(
    () => aggregatedMembers.filter((m) => m.balance > 0).length,
    [aggregatedMembers]
  );

  const handleRemind = (userId: string) => {
    setRemindedMap((prev) => ({ ...prev, [userId]: true }));
    setTimeout(() => {
      setRemindedMap((prev) => ({ ...prev, [userId]: false }));
    }, 2500);
  };

  const handleExportCSV = () => {
    if (!aggregatedMembers.length && !summary?.groups?.length) return;
    const rows = [["Type", "Name / Group", "Balance", "Details"]];

    aggregatedMembers.forEach((m) => {
      rows.push([
        "Person",
        m.name,
        m.balance < 0
          ? `+$${Math.abs(m.balance).toFixed(2)} (owes you)`
          : m.balance > 0
            ? `-$${m.balance.toFixed(2)} (you owe)`
            : "$0.00 (settled)",
        m.groupNames.join(" | "),
      ]);
    });

    summary?.groups.forEach((g) => {
      rows.push([
        "Group",
        g.group_name,
        g.balance >= 0 ? `+$${g.balance.toFixed(2)}` : `-$${Math.abs(g.balance).toFixed(2)}`,
        `Group ID: ${g.group_id}`,
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.map((val) => `"${val}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `splitease_balances_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (balancesLoading) {
    return <BalancesPageSkeleton />;
  }

  if (groupsError || summaryError) {
    return (
      <ErrorState
        title="Failed to load balances"
        description="Could not load your financial balance overview. Please try again."
        onRetry={() => {
          refetchGroups();
          refetchSummary();
        }}
      />
    );
  }

  const groupCount = groups?.length ?? 0;

  // Suggested settlements derived from owed and owe peers
  const suggestedSettlements = aggregatedMembers
    .filter((m) => m.balance !== 0)
    .slice(0, 3)
    .map((m) => ({
      userId: m.userId,
      name: m.name,
      amount: Math.abs(m.balance),
      isOwed: m.balance < 0,
      group: m.groupNames[0] || "Shared expenses",
    }));

  return (
    <div className="space-y-6 pb-8">
      {/* 1. View Header Title & Primary Action Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-headline">
            Balances
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            Net balances across all your groups and individual splits.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
          >
            <Download className="size-3.5 text-zinc-500" />
            <span>Export</span>
          </button>
          <Link
            href="/groups"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors shadow-xs"
          >
            <Send className="size-3.5" />
            <span>Settle Up</span>
          </Link>
        </div>
      </div>

      {/* 2. 3 Summary Stat Cards (Bento Grid) matching Stitch */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Card 1: You're owed */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 font-label">
              You&apos;re owed
            </span>
            <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="size-4.5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-headline font-semibold text-2xl tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              +{formatCurrency(totalOwed)}
            </div>
            <div className="font-label text-xs text-zinc-500 dark:text-zinc-400">
              {owedCount > 0
                ? `${owedCount} ${owedCount === 1 ? "friend owes" : "friends owe"} you across ${groupCount} groups`
                : "No pending receivables"}
            </div>
          </div>
        </div>

        {/* Card 2: You owe */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 font-label">
              You owe
            </span>
            <div className="size-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="size-4.5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-headline font-semibold text-2xl tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
              -{formatCurrency(totalOwe)}
            </div>
            <div className="font-label text-xs text-zinc-500 dark:text-zinc-400">
              {oweCount > 0
                ? `${oweCount} pending ${oweCount === 1 ? "expense" : "expenses"} due soon`
                : "No pending payables"}
            </div>
          </div>
        </div>

        {/* Card 3: Net balance */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 font-label">
              Net balance
            </span>
            <div className="size-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
              <Wallet className="size-4.5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="font-headline font-semibold text-2xl tracking-tight text-zinc-900 dark:text-zinc-50 tabular-nums">
                {netBalance >= 0 ? `+${formatCurrency(netBalance)}` : `-${formatCurrency(Math.abs(netBalance))}`}
              </span>
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border",
                  netBalance >= 0
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                    : "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800"
                )}
              >
                {netBalance >= 0 ? "Overall positive" : "Deficit"}
              </span>
            </div>
            <div className="font-label text-xs text-zinc-500 dark:text-zinc-400">
              Calculated after smart group offsets
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Two-Column Bento Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Column 1: People / Member Balances (7 cols) */}
        <section className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            {/* Card Header & Filter Chips */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 gap-3">
              <div className="flex items-center gap-2">
                <h2 className="font-headline font-semibold text-base text-zinc-900 dark:text-zinc-50">
                  People
                </h2>
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {aggregatedMembers.length}
                </span>
              </div>
              {/* Segmented Filter Control */}
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400">
                <button
                  type="button"
                  onClick={() => setPeopleFilter("all")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-all",
                    peopleFilter === "all"
                      ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-2xs font-semibold"
                      : "hover:text-zinc-900 dark:hover:text-zinc-100"
                  )}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setPeopleFilter("owed")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-all",
                    peopleFilter === "owed"
                      ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-2xs font-semibold"
                      : "hover:text-zinc-900 dark:hover:text-zinc-100"
                  )}
                >
                  Owed to you
                </button>
                <button
                  type="button"
                  onClick={() => setPeopleFilter("owe")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-all",
                    peopleFilter === "owe"
                      ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-2xs font-semibold"
                      : "hover:text-zinc-900 dark:hover:text-zinc-100"
                  )}
                >
                  You owe
                </button>
              </div>
            </div>

            {/* Member Balance Rows */}
            {filteredMembers.length === 0 ? (
              <div className="py-12 text-center text-sm text-zinc-500">
                No member balances match this filter.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredMembers.map((member, idx) => {
                  const initials = member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "U";
                  const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  const owesYou = member.balance < 0;
                  const youOwe = member.balance > 0;
                  const isSettled = member.balance === 0;
                  const isReminded = remindedMap[member.userId];

                  return (
                    <div
                      key={member.userId}
                      className="py-3.5 flex items-center justify-between hover:bg-zinc-50/70 dark:hover:bg-zinc-800/50 -mx-2 px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            "size-10 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
                            colorClass
                          )}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-headline font-semibold text-sm text-zinc-900 dark:text-zinc-50 truncate">
                            {member.name}
                          </div>
                          <div className="font-label text-xs text-zinc-500 dark:text-zinc-400 truncate">
                            {member.groupNames.join(" • ") || "Shared group"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {isSettled ? (
                          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                            <CheckCircle className="size-4 text-emerald-500" />
                            <span>All settled up • $0.00</span>
                          </div>
                        ) : (
                          <>
                            <div className="text-right">
                              <div
                                className={cn(
                                  "font-headline font-semibold text-sm tabular-nums",
                                  owesYou
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-rose-600 dark:text-rose-400"
                                )}
                              >
                                {owesYou
                                  ? `+${formatCurrency(Math.abs(member.balance))}`
                                  : `-${formatCurrency(member.balance)}`}
                              </div>
                              <div className="font-label text-[11px] text-zinc-400">
                                {owesYou ? "owes you" : "you owe"}
                              </div>
                            </div>
                            {owesYou ? (
                              <button
                                type="button"
                                onClick={() => handleRemind(member.userId)}
                                className={cn(
                                  "px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                                  isReminded
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400"
                                    : "border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                                )}
                              >
                                {isReminded ? "Reminded ✓" : "Remind"}
                              </button>
                            ) : (
                              <Link
                                href="/groups"
                                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors shadow-2xs"
                              >
                                Pay
                              </Link>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Column 2: Balances by Group (5 cols) */}
        <section className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <h2 className="font-headline font-semibold text-base text-zinc-900 dark:text-zinc-50">
                  Balances by group
                </h2>
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {summary?.groups.length || 0} active
                </span>
              </div>
              <Link
                href="/groups"
                className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>

            {/* Group List */}
            {summary?.groups.length === 0 ? (
              <EmptyState
                className="py-12"
                icon={<Building2 />}
                title="No groups found"
                description="Join or create a group to start tracking balances."
              />
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {summary?.groups.map((g, idx) => {
                  const balancesForGroup = groupQueries[idx]?.data ?? [];
                  const isNetPositive = g.balance > 0;
                  const isNetNegative = g.balance < 0;
                  const isSettled = g.balance === 0;

                  // Get member breakdowns for this group (excluding current user)
                  const memberBreakdowns = balancesForGroup
                    .filter((b) => b.user_id !== user?.user_id && b.balance !== 0)
                    .slice(0, 2);

                  return (
                    <div key={g.group_id} className="py-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/groups/${g.group_id}/balances`}
                          className="flex items-center gap-3 group"
                        >
                          <div className="size-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shrink-0 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                            {groupIcon(g.icon)}
                          </div>
                          <div>
                            <h3 className="font-headline font-semibold text-sm text-zinc-900 dark:text-zinc-50 group-hover:underline">
                              {g.group_name}
                            </h3>
                            <div className="font-label text-xs text-zinc-500 dark:text-zinc-400">
                              {balancesForGroup.length || 1} members • Active cycle
                            </div>
                          </div>
                        </Link>
                        <div>
                          {isSettled ? (
                            <span className="inline-flex items-center gap-1 text-xs text-zinc-500 font-medium">
                              <CheckCircle className="size-3.5 text-emerald-500" />
                              <span>Settled ($0.00)</span>
                            </span>
                          ) : (
                            <span
                              className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border tabular-nums",
                                isNetPositive
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                                  : "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800"
                              )}
                            >
                              {isNetPositive
                                ? `+${formatCurrency(g.balance)} net`
                                : `-${formatCurrency(Math.abs(g.balance))} you owe`}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Nested member breakdown badges matching Stitch */}
                      {memberBreakdowns.length > 0 && (
                        <div className="pl-12 flex flex-wrap gap-1.5">
                          {memberBreakdowns.map((mb) => {
                            const owes = mb.balance < 0;
                            return (
                              <span
                                key={mb.user_id}
                                className="inline-flex items-center gap-1 text-[11px] font-medium bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded"
                              >
                                <span
                                  className={cn(
                                    "size-1.5 rounded-full",
                                    owes ? "bg-emerald-500" : "bg-rose-500"
                                  )}
                                />
                                {mb.name || "Member"}: {formatCurrency(Math.abs(mb.balance))}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Action Callout matching Stitch */}
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Balances auto-sync across all devices</span>
            <RotateCw className="size-3.5 text-zinc-400" />
          </div>
        </section>
      </div>

      {/* 4. Bottom Panel: Suggested Settlements (Smart Debt Simplification) matching Stitch */}
      <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center">
              <Sparkles className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline font-semibold text-base text-zinc-900 dark:text-zinc-50">
                  Suggested settlements
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                  {suggestedSettlements.length}{" "}
                  {suggestedSettlements.length === 1 ? "transaction" : "transactions"} recommended to clear all debts
                </span>
              </div>
              <p className="font-body text-xs text-zinc-500 dark:text-zinc-400">
                Smart Debt Simplification computes the minimum transactions needed across your circles.
              </p>
            </div>
          </div>
          {/* Toggle Switch */}
          <div className="flex items-center gap-2">
            <span className="font-label text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Simplify debts
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={simplifyDebts}
              onClick={() => setSimplifyDebts(!simplifyDebts)}
              className={cn(
                "w-9 h-5 rounded-full relative p-0.5 transition-colors focus:outline-none",
                simplifyDebts ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-300 dark:bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "block size-4 rounded-full bg-white dark:bg-zinc-900 transition-transform",
                  simplifyDebts ? "translate-x-4" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>

        {/* Action Rows */}
        {suggestedSettlements.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-500">
            All debts are settled! No transactions recommended.
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 mt-2">
            {suggestedSettlements.map((st) => (
              <div
                key={st.userId}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "size-8 rounded-full flex items-center justify-center shrink-0",
                      st.isOwed
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                    )}
                  >
                    {st.isOwed ? (
                      <ArrowDownLeft className="size-4" />
                    ) : (
                      <ArrowUpRight className="size-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {st.isOwed ? (
                        <>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-50">{st.name}</span> will pay you{" "}
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                            {formatCurrency(st.amount)}
                          </span>{" "}
                          directly to settle <span className="text-zinc-600 dark:text-zinc-400 font-normal">{st.group}</span>
                        </>
                      ) : (
                        <>
                          Pay <span className="font-semibold text-zinc-900 dark:text-zinc-50">{st.name}</span>{" "}
                          <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                            {formatCurrency(st.amount)}
                          </span>{" "}
                          directly to settle <span className="text-zinc-600 dark:text-zinc-400 font-normal">{st.group}</span>
                        </>
                      )}
                    </p>
                    <p className="font-label text-xs text-zinc-400">
                      Eliminates circular micro-splits between you and peers
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/groups"
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Record payment
                  </Link>
                  <Link
                    href="/groups"
                    className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>Settle {formatCurrency(st.amount)}</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
