"use client";

import { useState, use, useMemo } from "react";
import { useGroupActivity } from "@/hooks/useActivity";
import { GroupActivitySkeleton } from "@/components/skeletons";
import {
  EmptyState,
  ErrorState,
  Button,
} from "@/components/ui";
import {
  Receipt,
  UserPlus,
  Users,
  HandCoins,
  History,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/selectors";
import type { Activity } from "@/types";

type GroupActivityFilter = "all" | "expenses" | "settlements" | "members";

interface ActivityPageProps {
  params: Promise<{ groupId: string }>;
}

function getActivityIcon(action: string) {
  if (action.includes("EXPENSE_CREATED") || action.includes("added_expense")) return Receipt;
  if (action.includes("EXPENSE_UPDATED")) return Pencil;
  if (action.includes("EXPENSE_DELETED")) return Trash2;
  if (action.includes("PAYMENT") || action.includes("made_payment")) return HandCoins;
  if (action.includes("MEMBER")) return UserPlus;
  return Users;
}

export default function ActivityPage({ params }: ActivityPageProps) {
  const { groupId } = use(params);
  const [filter, setFilter] = useState<GroupActivityFilter>("all");

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGroupActivity(groupId);

  const activities = useMemo(
    () => data?.pages.flatMap((page) => page.activities) ?? [],
    [data]
  );

  const filteredActivities = useMemo(() => {
    if (filter === "all") return activities;
    if (filter === "expenses") {
      return activities.filter((a) => a.action.includes("EXPENSE") || a.description.toLowerCase().includes("expense"));
    }
    if (filter === "settlements") {
      return activities.filter((a) => a.action.includes("PAYMENT") || a.description.toLowerCase().includes("settle") || a.description.toLowerCase().includes("payment"));
    }
    if (filter === "members") {
      return activities.filter((a) => a.action.includes("MEMBER") || a.action.includes("GROUP"));
    }
    return activities;
  }, [activities, filter]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header with title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-headline">
          Group Activity Feed
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Chronological audit trail of shared bills, member actions, and debt settlements.
        </p>
      </div>

      {/* 2. Subheader Filter Pill Bar matching Stitch */}
      <section className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer",
              filter === "all"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            )}
          >
            All activity
          </button>
          <button
            type="button"
            onClick={() => setFilter("expenses")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer",
              filter === "expenses"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            )}
          >
            Expenses
          </button>
          <button
            type="button"
            onClick={() => setFilter("settlements")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer",
              filter === "settlements"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            )}
          >
            Payments &amp; Settlements
          </button>
          <button
            type="button"
            onClick={() => setFilter("members")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer",
              filter === "members"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            )}
          >
            Member updates
          </button>
        </div>

        <div className="text-xs text-zinc-400 font-label">
          Showing <strong className="text-zinc-700 dark:text-zinc-300 font-semibold tabular-nums">{filteredActivities.length}</strong> events
        </div>
      </section>

      {isLoading && <GroupActivitySkeleton />}

      {isError && (
        <ErrorState
          title="Failed to load activity"
          description={error?.message ?? "Something went wrong"}
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && filteredActivities.length === 0 && (
        <EmptyState
          icon={<History className="size-8 text-zinc-400" />}
          title="No activity recorded"
          description="Activities such as new expenses, debt settlements, and member edits will be recorded here."
        />
      )}

      {!isLoading && !isError && filteredActivities.length > 0 && (
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800/60 shadow-xs">
          {filteredActivities.map((activity: Activity) => {
            const Icon = getActivityIcon(activity.action);
            const actorName = activity.user?.name || "Member";
            const isPayment = activity.action.includes("PAYMENT") || activity.description.toLowerCase().includes("settled");

            return (
              <div
                key={activity.activity_id}
                className="p-4 hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 transition-colors flex items-start gap-3.5 group"
              >
                <div className="size-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center shrink-0 border border-zinc-200/80 dark:border-zinc-700/80">
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-xs text-zinc-900 dark:text-zinc-100">
                      <strong className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {actorName}
                      </strong>{" "}
                      {activity.description}
                    </p>
                    {isPayment && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
                        Settled
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-zinc-400 font-label">
                      {activity.created_at ? formatDate(activity.created_at) : "Recently"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && !isError && hasNextPage && (
        <div className="flex justify-center pt-2">
          <Button
            variant="secondary"
            size="md"
            loading={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            Load more events
          </Button>
        </div>
      )}
    </div>
  );
}
