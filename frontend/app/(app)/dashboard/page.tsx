"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useDashboardSummary } from "@/hooks/useDashboard";
import { useGroups } from "@/hooks/useGroups";
import { useAllActivity } from "@/hooks/useAllActivity";
import { useAllGroupExpenses } from "@/hooks/useAllGroupExpenses";
import {
  DashboardOverviewSkeleton,
  ActivityFeedSkeleton,
} from "@/components/skeletons";
import {
  EmptyState,
  ErrorState,
  Button,
} from "@/components/ui";
import { CreateGroupModal } from "@/components/groups/CreateGroupModal";
import { groupIcon } from "@/lib/utils/group-icons";
import {
  collectRecentActivity,
  collectRecentExpenses,
  formatCurrency,
  formatDate,
  getSplitLabel,
} from "@/lib/selectors";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  ChevronRight,
  Plus,
  Receipt,
  Download,
  Filter,
  Search,
  ShoppingCart,
  Utensils,
  Wifi,
  Zap,
  Home,
  Plane,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Expense, Activity } from "@/types";

type ActivityFilter = "all" | "expenses" | "settles";

function getExpenseCategoryIcon(description: string = "") {
  const d = description.toLowerCase();
  if (d.includes("grocer") || d.includes("market") || d.includes("supermarket") || d.includes("snack")) {
    return ShoppingCart;
  }
  if (d.includes("dinner") || d.includes("lunch") || d.includes("bistro") || d.includes("food") || d.includes("restaurant") || d.includes("coffee") || d.includes("cafe") || d.includes("drink")) {
    return Utensils;
  }
  if (d.includes("wifi") || d.includes("internet") || d.includes("broadband")) {
    return Wifi;
  }
  if (d.includes("electric") || d.includes("utilit") || d.includes("power") || d.includes("gas")) {
    return Zap;
  }
  if (d.includes("rent") || d.includes("apartment") || d.includes("cabin") || d.includes("house")) {
    return Home;
  }
  if (d.includes("flight") || d.includes("travel") || d.includes("paris") || d.includes("hotel") || d.includes("trip") || d.includes("eurostar")) {
    return Plane;
  }
  return FileText;
}

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColorClass(initials: string): string {
  const code = (initials.charCodeAt(0) || 0) + (initials.charCodeAt(1) || 0);
  const palettes = [
    "bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    "bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    "bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    "bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  ];
  return palettes[code % palettes.length];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("all");
  const [expenseSearch, setExpenseSearch] = useState("");

  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
    error: summaryErrorMsg,
    refetch: refetchSummary,
  } = useDashboardSummary();

  const {
    data: groups,
    isLoading: groupsLoading,
  } = useGroups();

  const groupQueries = useAllActivity(groups);
  const { activities, groupNames } = useMemo(
    () => collectRecentActivity(groups, groupQueries, 10),
    [groups, groupQueries]
  );

  const expenseQueries = useAllGroupExpenses(groups);
  const { expenses: recentExpenses, groupNames: expenseGroupNames } = useMemo(
    () => collectRecentExpenses(groups, expenseQueries, 8),
    [groups, expenseQueries]
  );

  const activityLoading = groupsLoading || groupQueries.some((q) => q.isLoading);

  const currentBillingCycle = useMemo(() => {
    const now = new Date();
    return now.toLocaleString("en-US", { month: "long", year: "numeric" });
  }, []);

  const totalOwed = summary?.total_owed ?? 0;
  const totalOwe = summary?.total_owe ?? 0;
  const netBalance = summary?.net_balance ?? 0;
  const groupCount = summary?.groups?.length ?? groups?.length ?? 0;

  // Filter activities based on segmented control
  const filteredActivities = useMemo(() => {
    if (activityFilter === "all") return activities;
    if (activityFilter === "expenses") {
      return activities.filter((a) =>
        a.action.includes("EXPENSE") || a.description.toLowerCase().includes("expense") || a.description.toLowerCase().includes("added")
      );
    }
    if (activityFilter === "settles") {
      return activities.filter((a) =>
        a.action.includes("PAYMENT") || a.description.toLowerCase().includes("settled") || a.description.toLowerCase().includes("payment")
      );
    }
    return activities;
  }, [activities, activityFilter]);

  // Filter expenses based on table search
  const filteredExpenses = useMemo(() => {
    if (!expenseSearch.trim()) return recentExpenses;
    const q = expenseSearch.toLowerCase();
    return recentExpenses.filter((e) => {
      const gName = expenseGroupNames[e.group_id] || "";
      const pName = e.payer?.name || "";
      return (
        e.description.toLowerCase().includes(q) ||
        gName.toLowerCase().includes(q) ||
        pName.toLowerCase().includes(q)
      );
    });
  }, [recentExpenses, expenseGroupNames, expenseSearch]);

  const handleExportCSV = () => {
    if (!recentExpenses.length) return;
    const headers = ["Description", "Group", "Paid By", "Date", "Amount"];
    const rows = recentExpenses.map((e) => [
      `"${(e.description || "Untitled").replace(/"/g, '""')}"`,
      `"${(expenseGroupNames[e.group_id] || "").replace(/"/g, '""')}"`,
      `"${(e.payer?.name || "Unknown").replace(/"/g, '""')}"`,
      e.expense_date,
      e.amount,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SplitEase_Expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isLoading = summaryLoading;

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full pb-8">
      {/* 1. Welcome Hero Banner matching Stitch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-headline">
            Dashboard Overview
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {user
              ? `Welcome back, ${user.name.split(" ")[0]}. Here's what's happening across your groups today.`
              : "Here's what's happening across your groups today."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Current billing cycle</span>
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700">
            {currentBillingCycle}
          </span>
        </div>
      </div>

      {isLoading && <DashboardOverviewSkeleton />}

      {summaryError && (
        <ErrorState
          title="Failed to load dashboard data"
          description={summaryErrorMsg?.message ?? "Please check your connection and try again."}
          onRetry={refetchSummary}
        />
      )}

      {!isLoading && !summaryError && summary && (
        <>
          {/* 2. THREE KPI STAT CARDS */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: You're owed */}
            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-label">
                  You&apos;re owed
                </span>
                <div className="w-8 h-8 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="size-4.5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
                  +{formatCurrency(totalOwed)}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>
                    {totalOwed > 0
                      ? `Incoming balance across ${groupCount} ${groupCount === 1 ? "group" : "groups"}`
                      : "No one currently owes you"}
                  </span>
                </p>
              </div>
            </div>

            {/* Card 2: You owe */}
            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-label">
                  You owe
                </span>
                <div className="w-8 h-8 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <TrendingDown className="size-4.5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
                    -{formatCurrency(totalOwe)}
                  </div>
                  {totalOwe > 0 && (
                    <Link
                      href="/balances"
                      className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/40 px-2.5 py-1 rounded border border-rose-200 dark:border-rose-900/60 transition-colors duration-150"
                    >
                      Pay back →
                    </Link>
                  )}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>
                    {totalOwe > 0
                      ? "Pending payments due across your groups"
                      : "No pending payments due"}
                  </span>
                </p>
              </div>
            </div>

            {/* Card 3: Net balance */}
            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-label">
                  Net balance
                </span>
                <div className="w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                  <Wallet className="size-4.5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 tabular-nums">
                    {netBalance >= 0 ? `+${formatCurrency(netBalance)}` : `-${formatCurrency(Math.abs(netBalance))}`}
                  </div>
                  <span
                    className={cn(
                      "text-[11px] font-medium px-2 py-0.5 rounded border",
                      netBalance >= 0
                        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/80"
                        : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/80"
                    )}
                  >
                    {netBalance >= 0 ? "Overall positive" : "Deficit"}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-zinc-400" />
                  <span>Settled cleanly across {groupCount} active {groupCount === 1 ? "group" : "groups"}</span>
                </p>
              </div>
            </div>
          </section>

          {/* 3. TWO-COLUMN GRID: GROUPS & RECENT ACTIVITY */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Your Groups */}
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 font-headline">
                      Your Groups
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Active balances and shared budgets
                    </p>
                  </div>
                  <Link
                    href="/groups"
                    className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 transition-colors"
                  >
                    <span>See all ({summary.groups.length})</span>
                    <ChevronRight className="size-3.5" />
                  </Link>
                </div>

                {summary.groups.length === 0 ? (
                  <EmptyState
                    className="py-12"
                    icon={<Users className="size-8 text-zinc-400" />}
                    title="No groups yet"
                    description="Create your first group to start sharing and tracking expenses."
                    action={
                      <Button
                        variant="primary"
                        size="sm"
                        className="gap-2 mt-2"
                        onClick={() => setCreateGroupOpen(true)}
                      >
                        <Plus className="size-4" />
                        Create group
                      </Button>
                    }
                  />
                ) : (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 mt-1">
                    {summary.groups.slice(0, 5).map((group) => {
                      const isOwed = group.balance > 0;
                      const isOwe = group.balance < 0;
                      const isSettled = group.balance === 0;

                      return (
                        <Link
                          key={group.group_id}
                          href={`/groups/${group.group_id}/expenses`}
                          className="py-3.5 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 px-2 rounded-md transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center border border-zinc-200/60 dark:border-zinc-700/60 shrink-0">
                              {groupIcon(group.icon)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                                {group.group_name}
                              </div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                Active shared budget
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0 pl-3">
                            {isOwed && (
                              <>
                                <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                  +{formatCurrency(group.balance)}
                                </div>
                                <div className="text-[11px] text-zinc-400">you are owed</div>
                              </>
                            )}
                            {isOwe && (
                              <>
                                <div className="text-sm font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                                  -{formatCurrency(Math.abs(group.balance))}
                                </div>
                                <div className="text-[11px] text-zinc-400">you owe</div>
                              </>
                            )}
                            {isSettled && (
                              <span className="inline-block text-xs font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                $0.00 Settled
                              </span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Create New Group Trigger matching Stitch */}
              <button
                onClick={() => setCreateGroupOpen(true)}
                className="mt-4 w-full py-2.5 px-4 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-xs font-medium flex items-center justify-center gap-2 transition-colors duration-150 cursor-pointer"
                type="button"
              >
                <Plus className="size-4 text-zinc-400" />
                <span>+ Create new group</span>
              </button>
            </div>

            {/* Right Column: Recent Activity */}
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 font-headline">
                      Recent Activity
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Live updates and member settlements
                    </p>
                  </div>
                  {/* Filter Chips matching Stitch */}
                  <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <button
                      onClick={() => setActivityFilter("all")}
                      className={cn(
                        "text-xs font-medium px-2.5 py-1 rounded-md transition-colors",
                        activityFilter === "all"
                          ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                          : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                      )}
                      type="button"
                    >
                      All
                    </button>
                    <button
                      onClick={() => setActivityFilter("expenses")}
                      className={cn(
                        "text-xs font-medium px-2.5 py-1 rounded-md transition-colors",
                        activityFilter === "expenses"
                          ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                          : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                      )}
                      type="button"
                    >
                      Expenses
                    </button>
                    <button
                      onClick={() => setActivityFilter("settles")}
                      className={cn(
                        "text-xs font-medium px-2.5 py-1 rounded-md transition-colors",
                        activityFilter === "settles"
                          ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                          : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                      )}
                      type="button"
                    >
                      Settles
                    </button>
                  </div>
                </div>

                {activityLoading && (
                  <div className="pt-4">
                    <ActivityFeedSkeleton count={3} />
                  </div>
                )}

                {!activityLoading && filteredActivities.length === 0 && (
                  <EmptyState
                    className="py-12"
                    icon={<Receipt className="size-8 text-zinc-400" />}
                    title="No recent activity"
                    description="When expenses or payments are recorded, they will show up here."
                  />
                )}

                {!activityLoading && filteredActivities.length > 0 && (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 mt-1">
                    {filteredActivities.slice(0, 5).map((activity: Activity) => {
                      const actorName = activity.user?.name || "Someone";
                      const initials = getInitials(actorName);
                      const colorClass = getAvatarColorClass(initials);
                      const groupName = groupNames[activity.group_id] || "Group";
                      const isSettlement = activity.action.includes("PAYMENT") || activity.description.toLowerCase().includes("settled");

                      return (
                        <div
                          key={activity.activity_id}
                          className="py-3.5 flex items-start justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 px-2 rounded-md transition-colors"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center shrink-0 border",
                                colorClass
                              )}
                            >
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs text-zinc-700 dark:text-zinc-300">
                                <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                                  {actorName}
                                </strong>{" "}
                                {activity.description ? (
                                  <span>{activity.description}</span>
                                ) : (
                                  <span>performed an update</span>
                                )}{" "}
                                in{" "}
                                <span className="text-zinc-600 dark:text-zinc-400 font-medium">
                                  {groupName}
                                </span>
                              </div>
                              <div className="text-[11px] text-zinc-400 mt-0.5">
                                {activity.created_at ? formatDate(activity.created_at) : "Recently"}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 pl-3">
                            {isSettlement ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
                                Settled
                              </span>
                            ) : (
                              <span className="text-xs text-zinc-400">
                                <CheckCircle2 className="size-3.5 text-zinc-400" />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Link matching Stitch */}
              <Link
                href="/activity"
                className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 inline-flex items-center justify-center gap-1 transition-colors"
              >
                <span>View all activity logs</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>
          </section>

          {/* 4. FULL-WIDTH RECENT EXPENSES TABLE matching Stitch */}
          <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-xs">
            {/* Table Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 font-headline">
                  Recent Expenses
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Complete itemized log across all participating groups
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {/* Search inside table */}
                <div className="relative">
                  <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={expenseSearch}
                    onChange={(e) => setExpenseSearch(e.target.value)}
                    placeholder="Filter rows..."
                    className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs rounded-md pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 w-40 sm:w-48"
                  />
                </div>
                {/* Category Dropdown Indicator */}
                <div className="relative">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium py-1.5 px-3 rounded-md transition-colors"
                  >
                    <Filter className="size-3 text-zinc-400" />
                    <span>Category: All</span>
                  </button>
                </div>
                {/* Export CSV Button */}
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium py-1.5 px-3 rounded-md transition-colors cursor-pointer"
                >
                  <Download className="size-3.5 text-zinc-500" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Table Canvas */}
            {filteredExpenses.length === 0 ? (
              <div className="py-12 text-center">
                <Receipt className="mx-auto size-8 text-zinc-300 dark:text-zinc-700" />
                <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  No recent expenses
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Logged expenses from any of your groups will appear here in chronological order.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 font-label">
                      <th className="py-3 px-3" scope="col">Description</th>
                      <th className="py-3 px-3" scope="col">Group</th>
                      <th className="py-3 px-3" scope="col">Paid by</th>
                      <th className="py-3 px-3" scope="col">Date</th>
                      <th className="py-3 px-3" scope="col">Split Mode</th>
                      <th className="py-3 px-3 text-right" scope="col">Total Amount</th>
                      <th className="py-3 px-3 text-right" scope="col">Your Share</th>
                      <th className="py-3 px-2 text-right" scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
                    {filteredExpenses.map((expense: Expense) => {
                      const CategoryIcon = getExpenseCategoryIcon(expense.description);
                      const groupName = expenseGroupNames[expense.group_id] || "General";
                      const isPayer = expense.payer?.user_id === user?.user_id;
                      const payerName = isPayer ? "You" : expense.payer?.name || "Member";
                      const payerInitials = getInitials(payerName);
                      const splitLabel = getSplitLabel(expense);
                      const numericAmount = parseFloat(expense.amount) || 0;

                      // Calculate user share
                      const mySplit = expense.splits?.find((s) => s.user_id === user?.user_id);
                      const myShare = mySplit?.share_amount ?? (expense.splits?.length ? numericAmount / expense.splits.length : numericAmount / 2);

                      return (
                        <tr
                          key={expense.expense_id}
                          className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors"
                        >
                          {/* Description + Category Icon */}
                          <td className="py-3.5 px-3 font-medium text-zinc-900 dark:text-zinc-100">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center shrink-0">
                                <CategoryIcon className="size-3.5" />
                              </div>
                              <span className="truncate max-w-50 font-medium">
                                {expense.description || "Untitled expense"}
                              </span>
                            </div>
                          </td>

                          {/* Group Pill Badge */}
                          <td className="py-3.5 px-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80">
                              {groupName}
                            </span>
                          </td>

                          {/* Paid by Avatar + Name */}
                          <td className="py-3.5 px-3 text-zinc-600 dark:text-zinc-400">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] flex items-center justify-center font-medium shrink-0">
                                {payerInitials}
                              </div>
                              <span className="truncate max-w-28">{payerName}</span>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-3 text-zinc-500 whitespace-nowrap">
                            {formatDate(expense.expense_date)}
                          </td>

                          {/* Split Mode */}
                          <td className="py-3.5 px-3 text-zinc-500 truncate max-w-28" title={splitLabel}>
                            {splitLabel}
                          </td>

                          {/* Total Amount */}
                          <td className="py-3.5 px-3 text-right font-medium text-zinc-900 dark:text-zinc-100 tabular-nums">
                            {formatCurrency(numericAmount)}
                          </td>

                          {/* Your Share */}
                          <td className="py-3.5 px-3 text-right tabular-nums">
                            {isPayer ? (
                              <>
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                  +{formatCurrency(numericAmount - myShare)}
                                </span>
                                <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 block">
                                  get back
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="font-semibold text-rose-600 dark:text-rose-400">
                                  -{formatCurrency(myShare)}
                                </span>
                                <span className="text-[10px] text-rose-600/70 dark:text-rose-400/70 block">
                                  you owe
                                </span>
                              </>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-2 text-right">
                            <Link
                              href={`/groups/${expense.group_id}/expenses`}
                              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded inline-flex items-center justify-center"
                              title="View group expenses"
                            >
                              <ChevronRight className="size-4" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      <CreateGroupModal
        open={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
      />
    </div>
  );
}
