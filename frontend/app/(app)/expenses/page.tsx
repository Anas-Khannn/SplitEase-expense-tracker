"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useGroups } from "@/hooks/useGroups";
import { useDashboardSummary } from "@/hooks/useDashboard";
import { useAllGroupMembers } from "@/hooks/useAllGroupMembers";
import { useAllExpenses } from "@/hooks/useAllExpenses";
import { ExpensesPageSkeleton } from "@/components/skeletons";
import { EmptyState, ErrorState, Button } from "@/components/ui";
import { GroupCard } from "@/components/groups/GroupCard";
import { CreateGroupModal } from "@/components/groups/CreateGroupModal";
import { ExpenseReactions } from "@/components/expenses/ExpenseReactions";
import {
  buildBalanceMap,
  filterGroups,
  formatCurrency,
  formatDate,
  getSplitLabel,
  type GroupTab,
} from "@/lib/selectors";
import {
  ReceiptText,
  Plus,
  Search,
  LayoutGrid,
  List,
  Users2,
  Receipt,
  ShoppingCart,
  Utensils,
  Wifi,
  Zap,
  Home,
  Plane,
  FileText,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Expense } from "@/types";

function getCategoryIcon(description: string = "") {
  const d = description.toLowerCase();
  if (d.includes("grocer") || d.includes("market") || d.includes("supermarket") || d.includes("snack")) return ShoppingCart;
  if (d.includes("dinner") || d.includes("lunch") || d.includes("bistro") || d.includes("food") || d.includes("coffee") || d.includes("restaurant")) return Utensils;
  if (d.includes("wifi") || d.includes("internet")) return Wifi;
  if (d.includes("electric") || d.includes("utilit") || d.includes("power") || d.includes("bill")) return Zap;
  if (d.includes("rent") || d.includes("apartment") || d.includes("house") || d.includes("cabin")) return Home;
  if (d.includes("flight") || d.includes("travel") || d.includes("trip") || d.includes("hotel")) return Plane;
  return FileText;
}

function getCategoryTag(description: string = ""): string {
  const d = description.toLowerCase();
  if (d.includes("rent") || d.includes("lease")) return "Fixed monthly";
  if (d.includes("wifi") || d.includes("electric") || d.includes("utilit") || d.includes("water") || d.includes("power")) return "Utilities";
  if (d.includes("grocer") || d.includes("market")) return "Groceries";
  if (d.includes("dinner") || d.includes("lunch") || d.includes("food")) return "Dining";
  if (d.includes("flight") || d.includes("trip") || d.includes("hotel")) return "Travel";
  return "General";
}

export default function ExpensesPage() {
  const { user } = useAuth();
  const [activeScope, setActiveScope] = useState<"feed" | "groups">("feed");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<GroupTab>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const {
    data: groups,
    isLoading: groupsLoading,
    isError: groupsError,
    error,
    refetch,
  } = useGroups();

  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const memberQueries = useAllGroupMembers(groups);
  const expenseQueries = useAllExpenses(groups);

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

  // Aggregate all expenses across groups
  const allExpenses = useMemo(() => {
    const list: (Expense & { groupName: string })[] = [];
    const groupNameMap: Record<string, string> = {};
    (groups ?? []).forEach((g) => {
      groupNameMap[g.group_id] = g.name;
    });

    expenseQueries.forEach((q, idx) => {
      const g = groups?.[idx];
      const items = q.data ?? [];
      items.forEach((item) => {
        list.push({
          ...item,
          groupName: groupNameMap[item.group_id] || g?.name || "Group",
        });
      });
    });

    list.sort(
      (a, b) =>
        new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime()
    );
    return list;
  }, [groups, expenseQueries]);

  const filteredExpenses = useMemo(() => {
    if (!searchQuery.trim()) return allExpenses;
    const q = searchQuery.toLowerCase();
    return allExpenses.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        e.groupName.toLowerCase().includes(q) ||
        (e.payer?.name && e.payer.name.toLowerCase().includes(q))
    );
  }, [allExpenses, searchQuery]);

  const expensesLoading = expenseQueries.some((q) => q.isLoading);
  const isLoading = groupsLoading || summaryLoading;

  return (
    <div className="space-y-6 pb-8">
      {/* 1. Header Section matching Stitch */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 gap-4 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Expenses
            </h1>
            <span className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200/70 dark:border-zinc-700">
              {activeScope === "feed" ? `${allExpenses.length} total recorded` : `${totalGroups} groups`}
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {activeScope === "feed"
              ? "Track, react to, and review itemized shared expenses across all your active groups."
              : "Select a group to manage members, record payments, and view detailed balance breakdowns."}
          </p>
        </div>

        {/* Action Controls: Scope Switcher & Search */}
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {/* Main Scope Switcher */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/90 p-1 rounded-lg border border-zinc-200/70 dark:border-zinc-700 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveScope("feed")}
              className={cn(
                "px-3 py-1.5 rounded transition-all cursor-pointer",
                activeScope === "feed"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 font-semibold shadow-2xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              )}
            >
              All Expenses ({allExpenses.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveScope("groups")}
              className={cn(
                "px-3 py-1.5 rounded transition-all cursor-pointer",
                activeScope === "groups"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 font-semibold shadow-2xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              )}
            >
              By Group ({totalGroups})
            </button>
          </div>

          {/* Search input with ⌘K */}
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeScope === "feed" ? "Search expenses..." : "Search groups..."}
              className="w-full pl-8 pr-10 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded shadow-2xs">
                ⌘K
              </kbd>
            </div>
          </div>

          {activeScope === "groups" && (
            <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg p-0.5 bg-white dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1 rounded transition-colors cursor-pointer",
                  viewMode === "grid"
                    ? "text-zinc-900 dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800"
                    : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                )}
                title="Grid view"
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1 rounded transition-colors cursor-pointer",
                  viewMode === "list"
                    ? "text-zinc-900 dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800"
                    : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                )}
                title="List view"
              >
                <List className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {isLoading && <ExpensesPageSkeleton />}

      {!isLoading && groupsError && (
        <ErrorState
          title="Failed to load your expenses"
          description={error?.message ?? "Something went wrong"}
          onRetry={refetch}
        />
      )}

      {/* 2. ALL EXPENSES FEED VIEW WITH EMOJI REACTIONS */}
      {!isLoading && !groupsError && activeScope === "feed" && (
        <div>
          {expensesLoading && allExpenses.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 animate-pulse" />
              ))}
            </div>
          ) : filteredExpenses.length === 0 ? (
            <EmptyState
              icon={<Receipt className="size-8 text-zinc-400" />}
              title="No expenses found"
              description={
                searchQuery
                  ? "No expenses matched your search criteria."
                  : "Start by logging an expense inside one of your groups."
              }
              action={
                totalGroups > 0 ? (
                  <Link href={`/groups/${groups?.[0]?.group_id}/expenses`}>
                    <Button variant="primary" size="md" className="gap-2">
                      <Plus className="size-4" />
                      Add expense
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    className="gap-2"
                    onClick={() => setCreateModalOpen(true)}
                  >
                    <Plus className="size-4" />
                    Create group
                  </Button>
                )
              }
            />
          ) : (
            <div className="space-y-3.5">
              {filteredExpenses.map((expense) => {
                const CategoryIcon = getCategoryIcon(expense.description);
                const tag = getCategoryTag(expense.description);
                const isPayer = expense.payer?.user_id === user?.user_id;
                const payerName = isPayer ? "You" : expense.payer?.name || "Member";
                const numericAmount = parseFloat(expense.amount) || 0;
                const splitLabel = getSplitLabel(expense);

                const mySplit = expense.splits?.find((s) => s.user_id === user?.user_id);
                const myShare = mySplit?.share_amount ?? (expense.splits?.length ? numericAmount / expense.splits.length : numericAmount / 2);

                return (
                  <div
                    key={expense.expense_id}
                    className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl p-4 sm:p-5 transition-all duration-150 shadow-2xs hover:shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Category Icon & Expense Details */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-200 flex items-center justify-center shrink-0">
                          <CategoryIcon className="size-4.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                              {expense.description || "Untitled expense"}
                            </h3>
                            <Link
                              href={`/groups/${expense.group_id}/expenses`}
                              className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded border border-zinc-200/70 dark:border-zinc-700 transition-colors"
                              title={`View in ${expense.groupName}`}
                            >
                              <span>{expense.groupName}</span>
                              <ArrowUpRight className="size-3 text-zinc-400" />
                            </Link>
                            <span className="text-[10px] font-medium px-1.5 py-0.2 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 rounded border border-zinc-200/50 dark:border-zinc-800">
                              {tag}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                            Paid by <strong className="font-medium text-zinc-700 dark:text-zinc-300">{payerName}</strong> · {formatDate(expense.expense_date)} · {splitLabel}
                          </p>
                        </div>
                      </div>

                      {/* Right: Amounts & Link */}
                      <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                        <div className="text-right">
                          {isPayer ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 tabular-nums">
                              You are owed +{formatCurrency(numericAmount - myShare)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60 tabular-nums">
                              You owe -{formatCurrency(myShare)}
                            </span>
                          )}
                          <p className="text-[11px] text-zinc-400 mt-0.5 text-right tabular-nums">
                            {formatCurrency(numericAmount)} Total bill
                          </p>
                        </div>

                        <Link
                          href={`/groups/${expense.group_id}/expenses`}
                          className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 transition-colors"
                        >
                          <span className="hidden sm:inline">Details</span>
                          <ArrowUpRight className="size-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Interactive Emoji Reactions matching Stitch */}
                    <ExpenseReactions
                      expenseId={expense.expense_id}
                      currentUserId={user?.user_id}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. BY GROUP DIRECTORY VIEW */}
      {!isLoading && !groupsError && activeScope === "groups" && (
        <>
          {/* Secondary Filter Tabs */}
          <div className="flex items-center gap-2 pb-2">
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/90 p-1 rounded-lg border border-zinc-200/70 dark:border-zinc-700 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={cn(
                  "px-3 py-1 rounded transition-all cursor-pointer",
                  activeTab === "all"
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 font-semibold shadow-2xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                All ({totalGroups})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("outstanding")}
                className={cn(
                  "px-3 py-1 rounded transition-all cursor-pointer",
                  activeTab === "outstanding"
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 font-semibold shadow-2xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("settled")}
                className={cn(
                  "px-3 py-1 rounded transition-all cursor-pointer",
                  activeTab === "settled"
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 font-semibold shadow-2xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                Settled ({settledCount})
              </button>
            </div>
          </div>

          {totalGroups === 0 ? (
            <EmptyState
              icon={<ReceiptText />}
              title="No groups yet"
              description="Expenses are tracked within groups. Create or join a group to start splitting costs."
              action={
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="size-4" />
                  <span>Create group</span>
                </button>
              }
            />
          ) : filteredGroups.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 py-12 text-center text-sm text-zinc-500">
              No groups match your search or filter criteria.
            </div>
          ) : (
            <div
              className={cn(
                "grid gap-5",
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              )}
            >
              {filteredGroups.map((group, idx) => {
                const query = memberQueries[idx];
                return (
                  <GroupCard
                    key={group.group_id}
                    group={group}
                    balance={hasBalances ? balances[group.group_id] : undefined}
                    members={query?.data}
                    membersLoading={query?.isLoading}
                  />
                );
              })}
            </div>
          )}

          {/* Quick Start / Create Group Banner matching Stitch */}
          <div className="mt-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-8 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 shadow-2xs shrink-0">
                <Users2 className="size-6" />
              </div>
              <div>
                <h4 className="font-headline text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  Planning a new trip or shared living space?
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Start a new group to manage shared costs effortlessly with real-time settlement tracking.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                className="px-4 py-2 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="size-4" />
                <span>Create group</span>
              </button>
            </div>
          </div>
        </>
      )}

      <CreateGroupModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
}
