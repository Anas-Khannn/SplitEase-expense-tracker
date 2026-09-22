"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useGroups } from "@/hooks/useGroups";
import { useAllActivity } from "@/hooks/useAllActivity";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { ActivityPageSkeleton } from "@/components/skeletons";
import { collectActivity } from "@/lib/selectors";
import { EmptyState, ErrorState, Button } from "@/components/ui";
import { History, Plus, Download, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ActivityCategoryFilter = "all" | "expenses" | "payments" | "members";

export default function ActivityPage() {
  const [filter, setFilter] = useState<ActivityCategoryFilter>("all");

  const {
    data: groups,
    isLoading: groupsLoading,
    isError: groupsError,
    error: groupsErrorMsg,
    refetch: refetchGroups,
  } = useGroups();

  const groupQueries = useAllActivity(groups);
  const { activities, groupNames } = collectActivity(groups, groupQueries);

  const isLoading = groupsLoading || groupQueries.some((q) => q.isLoading);
  const isError = groupsError || groupQueries.some((q) => q.isError);

  const handleRetry = () => {
    refetchGroups();
    groupQueries.forEach((q) => q.refetch());
  };

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      if (filter === "expenses") {
        return act.action.startsWith("EXPENSE_");
      }
      if (filter === "payments") {
        return act.action.startsWith("PAYMENT_");
      }
      if (filter === "members") {
        return act.action.startsWith("MEMBER_") || act.action === "GROUP_CREATED";
      }
      return true;
    });
  }, [activities, filter]);

  const handleExportCSV = () => {
    if (!filteredActivities.length) return;
    const rows = [["Date", "Group", "Action", "Description"]];
    filteredActivities.forEach((act) => {
      rows.push([
        new Date(act.created_at).toISOString(),
        groupNames[act.group_id] || "Unknown group",
        act.action,
        act.description || "Activity event",
      ]);
    });
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.map((val) => `"${val}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `splitease_activity_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* 1. Header Section matching Stitch */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/80 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-headline">
            Activity
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Recent chronological actions and audit history across your groups.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors shadow-2xs"
          >
            <Download className="size-3.5 text-muted-foreground" />
            <span>Export</span>
          </button>
          <Link
            href="/balances"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors shadow-xs"
          >
            <Sparkles className="size-3.5" />
            <span>Settle Up</span>
          </Link>
        </div>
      </div>

      {isLoading && <ActivityPageSkeleton />}

      {!isLoading && isError && (
        <ErrorState
          title="Failed to load activity"
          description={groupsErrorMsg?.message ?? "Something went wrong"}
          onRetry={handleRetry}
        />
      )}

      {!isLoading && !isError && activities.length === 0 && (
        <EmptyState
          className="py-16"
          icon={<History />}
          title="No activity yet"
          description="Activity from all your groups will appear here as members add expenses, record payments, and manage groups."
          action={
            (groups?.length ?? 0) === 0 ? (
              <Link href="/groups">
                <Button variant="primary" className="gap-2 mt-2">
                  <Plus className="size-4" />
                  Browse groups
                </Button>
              </Link>
            ) : undefined
          }
        />
      )}

      {!isLoading && !isError && activities.length > 0 && (
        <div className="space-y-6">
          {/* Segmented Filter Pills matching Stitch */}
          <div className="inline-flex rounded-lg bg-muted p-1 text-xs font-medium text-muted-foreground">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={cn(
                "rounded-md px-3 py-1.5 transition-all",
                filter === "all" ? "bg-background font-semibold text-foreground shadow-2xs" : "hover:text-foreground"
              )}
            >
              All activity ({activities.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("expenses")}
              className={cn(
                "rounded-md px-3 py-1.5 transition-all",
                filter === "expenses" ? "bg-background font-semibold text-foreground shadow-2xs" : "hover:text-foreground"
              )}
            >
              Expenses
            </button>
            <button
              type="button"
              onClick={() => setFilter("payments")}
              className={cn(
                "rounded-md px-3 py-1.5 transition-all",
                filter === "payments" ? "bg-background font-semibold text-foreground shadow-2xs" : "hover:text-foreground"
              )}
            >
              Payments & Settlements
            </button>
            <button
              type="button"
              onClick={() => setFilter("members")}
              className={cn(
                "rounded-md px-3 py-1.5 transition-all",
                filter === "members" ? "bg-background font-semibold text-foreground shadow-2xs" : "hover:text-foreground"
              )}
            >
              Member updates
            </button>
          </div>

          {/* Feed Container matching Stitch card */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-2xs">
            {filteredActivities.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No activity matches the selected category filter.
              </div>
            ) : (
              <ActivityFeed activities={filteredActivities} groupNames={groupNames} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
