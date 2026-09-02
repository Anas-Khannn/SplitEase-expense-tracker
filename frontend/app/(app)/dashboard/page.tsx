"use client";

import Link from "next/link";
import { useDashboardSummary } from "@/hooks/useDashboard";
import { useGroups } from "@/hooks/useGroups";
import { useAllActivity } from "@/hooks/useAllActivity";
import { useAllExpenses } from "@/hooks/useAllExpenses";
import { ActivityItem } from "@/components/activity/ActivityItem";
import {
  Card,
  CardHeader,
  CardContent,
  Skeleton,
  EmptyState,
  ErrorState,
  Button,
} from "@/components/ui";
import { groupIcon } from "@/lib/utils/group-icons";
import { DollarSign, TrendingUp, TrendingDown, Plus, ArrowRight, Wallet, Users, Activity as ActivityIcon, ReceiptText } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Activity, ActivityAction, Expense, GroupListItem } from "@/types";

const ACTIVITY_ALIASES: Record<string, ActivityAction> = {
  created_group: "GROUP_CREATED",
  added_expense: "EXPENSE_CREATED",
  updated_expense: "EXPENSE_UPDATED",
  deleted_expense: "EXPENSE_DELETED",
  made_payment: "PAYMENT_CREATED",
  added_member: "MEMBER_ADDED",
  removed_member: "MEMBER_REMOVED",
};

function normalizeActivity(activity: Activity): Activity {
  const action = ACTIVITY_ALIASES[activity.action] ?? activity.action;
  return action === activity.action ? activity : { ...activity, action };
}

function collectRecentActivity(
  groups: GroupListItem[] | undefined,
  groupQueries: ReturnType<typeof useAllActivity>,
  limit = 6
): { activities: Activity[]; groupNames: Record<string, string> } {
  const groupNames: Record<string, string> = {};
  for (const group of groups ?? []) {
    groupNames[group.group_id] = group.name;
  }

  const activities: Activity[] = [];
  for (const query of groupQueries) {
    for (const item of query.data ?? []) {
      activities.push(item);
    }
  }

  activities.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return { activities: activities.slice(0, limit), groupNames };
}

function collectRecentExpenses(
  groups: GroupListItem[] | undefined,
  expenseQueries: ReturnType<typeof useAllExpenses>,
  limit = 5
): { expenses: Expense[]; groupNames: Record<string, string> } {
  const groupNames: Record<string, string> = {};
  for (const group of groups ?? []) {
    groupNames[group.group_id] = group.name;
  }

  const expenses: Expense[] = [];
  for (const query of expenseQueries) {
    for (const item of query.data ?? []) {
      expenses.push(item);
    }
  }

  expenses.sort(
    (a, b) =>
      new Date(b.expense_date).getTime() -
      new Date(a.expense_date).getTime()
  );

  return { expenses: expenses.slice(0, limit), groupNames };
}

function formatExpenseCurrency(amount: string): string {
  const value = Number(amount);
  if (Number.isNaN(value)) return amount;
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function DashboardPage() {
  const {
    data: summary,
    isLoading,
    isError,
    error,
    refetch,
  } = useDashboardSummary();

  const {
    data: groups,
    isLoading: groupsLoading,
    isError: groupsError,
    refetch: refetchGroups,
  } = useGroups();

  const groupQueries = useAllActivity(groups);
  const { activities, groupNames } = collectRecentActivity(groups, groupQueries);

  const expenseQueries = useAllExpenses(groups);
  const { expenses, groupNames: expenseGroupNames } = collectRecentExpenses(
    groups,
    expenseQueries
  );

  const expensesLoading = groupsLoading || expenseQueries.some((q) => q.isLoading);
  const expensesError = groupsError || expenseQueries.some((q) => q.isError);

  const activityLoading = groupsLoading || groupQueries.some((q) => q.isLoading);
  const activityError = groupsError || groupQueries.some((q) => q.isError);

  const handleActivityRetry = () => {
    refetchGroups();
    groupQueries.forEach((q) => q.refetch());
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header with Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time financial summary, group balances, and recent activity across your expenses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/groups">
            <Button variant="secondary" size="sm" className="gap-2">
              <Users className="h-4 w-4" />
              Manage Groups
            </Button>
          </Link>
          <Link href="/balances">
            <Button variant="primary" size="sm" className="gap-2">
              <Wallet className="h-4 w-4" />
              View Balances
            </Button>
          </Link>
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-5 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-border bg-card shadow-xs rounded-xl p-6">
              <Skeleton className="h-4 w-28 mb-3" />
              <Skeleton className="h-9 w-40" />
            </Card>
          ))}
        </div>
      )}

      {isError && (
        <ErrorState
          title="Failed to load dashboard data"
          description={error?.message ?? "Please check your connection and try again."}
          onRetry={refetch}
        />
      )}

      {summary && (
        <>
          {/* KPI Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border border-border bg-card shadow-xs rounded-xl">
              <CardContent className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <p className="mt-4 truncate text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                  ${summary.total_owed.toFixed(2)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">You&apos;re owed</p>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card shadow-xs rounded-xl">
              <CardContent className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <p className="mt-4 truncate text-3xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
                  ${summary.total_owe.toFixed(2)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">You owe</p>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card shadow-xs rounded-xl">
              <CardContent className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <DollarSign className="h-5 w-5" />
                </div>
                <p
                  className={cn(
                    "mt-4 truncate text-3xl font-bold tracking-tight",
                    summary.net_balance >= 0
                      ? "text-foreground"
                      : "text-rose-600 dark:text-rose-400"
                  )}
                >
                  ${summary.net_balance.toFixed(2)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Net balance</p>
              </CardContent>
            </Card>
          </div>

          {/* Grid Layout for Groups and Activity */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Groups Card */}
            <Card className="border border-border bg-card shadow-xs rounded-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-base font-semibold text-foreground">Your Groups</h2>
                </div>
                <Link
                  href="/groups"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  View all groups
                  <ArrowRight size="14" />
                </Link>
              </CardHeader>
              <CardContent className="p-6">
                {summary.groups.length === 0 ? (
                  <EmptyState
                    className="py-12"
                    icon={<Plus />}
                    title="No groups yet"
                    description="Create your first group to start splitting expenses with friends or roommates."
                    action={
                      <Link href="/groups">
                        <Button variant="primary" size="sm" className="gap-2 mt-2">
                          <Plus className="h-4 w-4" />
                          Create group
                        </Button>
                      </Link>
                    }
                  />
                ) : (
                  <div className="space-y-3">
                    {summary.groups.map((group) => (
                      <Link
                        key={group.group_id}
                        href={`/groups/${group.group_id}/expenses`}
                        className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border/60 bg-background hover:bg-muted/50 transition-all duration-150 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-lg group-hover:scale-105 transition-transform">
                            {groupIcon(group.icon)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {group.group_name}
                            </p>
                            <p className="text-xs text-muted-foreground">Tap to view expenses & balances</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span
                            className={cn(
                              "text-sm font-semibold",
                              group.balance > 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : group.balance < 0
                                  ? "text-rose-600 dark:text-rose-400"
                                  : "text-muted-foreground"
                            )}
                          >
                            {group.balance > 0 ? "+" : ""}
                            {group.balance === 0 ? "$0.00" : `$${group.balance.toFixed(2)}`}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity Card */}
            <Card className="border border-border bg-card shadow-xs rounded-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
                <div className="flex items-center gap-2">
                  <ActivityIcon className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-base font-semibold text-foreground">Recent Activity</h2>
                </div>
                <Link
                  href="/activity"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  View full feed
                  <ArrowRight size="14" />
                </Link>
              </CardHeader>
              <CardContent className="p-6">
                {activityLoading && (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Skeleton variant="circle" className="h-10 w-10 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-28" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!activityLoading && activityError && (
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-lg">
                    <p className="text-xs text-destructive font-medium">
                      Failed to load recent activity.
                    </p>
                    <Button variant="secondary" size="sm" onClick={handleActivityRetry}>
                      Retry
                    </Button>
                  </div>
                )}

                {!activityLoading && !activityError && activities.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-sm text-muted-foreground">
                      No recent activity found. Actions across your groups will appear here.
                    </p>
                  </div>
                )}

                {!activityLoading && !activityError && activities.length > 0 && (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.activity_id} className="p-2 rounded-lg hover:bg-muted/40 transition-colors">
                        <ActivityItem
                          activity={normalizeActivity(activity)}
                          groupName={groupNames[activity.group_id]}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Expenses */}
          <Card className="border border-border bg-card shadow-xs rounded-xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
              <div className="flex items-center gap-2">
                <ReceiptText className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-base font-semibold text-foreground">Recent Expenses</h2>
              </div>
              <Link
                href="/expenses"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View all expenses
                <ArrowRight size="14" />
              </Link>
            </CardHeader>
            <CardContent className="p-6">
              {expensesLoading && (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                      <Skeleton className="h-5 w-20" />
                    </div>
                  ))}
                </div>
              )}

              {!expensesLoading && expensesError && (
                <div className="flex flex-wrap items-center justify-between gap-3 bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-lg">
                  <p className="text-xs text-destructive font-medium">
                    Failed to load recent expenses.
                  </p>
                  <Button variant="secondary" size="sm" onClick={handleActivityRetry}>
                    Retry
                  </Button>
                </div>
              )}

              {!expensesLoading && !expensesError && expenses.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    No expenses yet. Add an expense in a group and it will show up here.
                  </p>
                </div>
              )}

              {!expensesLoading && !expensesError && expenses.length > 0 && (
                <div>
                  {expenses.map((expense) => (
                    <Link
                      key={expense.expense_id}
                      href={`/groups/${expense.group_id}/expenses`}
                      className="flex items-center justify-between gap-4 border-b border-border/60 px-2 py-3 last:border-0 hover:bg-muted/40 transition-colors rounded-lg"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-lg">
                          {groupIcon(
                            groups?.find((g) => g.group_id === expense.group_id)?.icon ?? "users"
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {expense.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {expenseGroupNames[expense.group_id] ?? "Group"} · Paid by{" "}
                            {expense.payer.name || "someone"} ·{" "}
                            {new Date(expense.expense_date).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-sm font-semibold text-foreground">
                        {formatExpenseCurrency(expense.amount)}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
