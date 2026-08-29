"use client";

import Link from "next/link";
import { useDashboardSummary } from "@/hooks/useDashboard";
import { useGroups } from "@/hooks/useGroups";
import { useAllActivity } from "@/hooks/useAllActivity";
import { ActivityItem } from "@/components/activity/ActivityItem";
import {
  Card,
  CardHeader,
  CardContent,
  Skeleton,
  EmptyState,
  ErrorState,
} from "@/components/ui";
import { groupIcon } from "@/lib/utils/group-icons";
import { DollarSign, TrendingUp, TrendingDown, Plus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Activity, ActivityAction, GroupListItem } from "@/types";

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
  limit = 7
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

  const activityLoading = groupsLoading || groupQueries.some((q) => q.isLoading);
  const activityError = groupsError || groupQueries.some((q) => q.isError);

  const handleActivityRetry = () => {
    refetchGroups();
    groupQueries.forEach((q) => q.refetch());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 font-bold text-text-primary">Overview</h1>
        <p className="mt-1 text-body-sm text-text-muted">
          Track balances, groups, and recent activity at a glance.
        </p>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-5">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isError && (
        <ErrorState
          title="Failed to load dashboard"
          description={error?.message ?? "Something went wrong"}
          onRetry={refetch}
        />
      )}

      {summary && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-radius-md bg-success-100">
                    <TrendingUp className="h-5 w-5 text-success-500" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-caption text-text-muted">You&apos;re owed</p>
                    <p className="text-h3 font-bold text-success-500">
                      ${summary.total_owed.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-radius-md bg-danger-100">
                    <TrendingDown className="h-5 w-5 text-danger-500" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-caption text-text-muted">You owe</p>
                    <p className="text-h3 font-bold text-danger-500">
                      ${summary.total_owe.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-radius-md bg-primary-100">
                    <DollarSign className="h-5 w-5 text-primary-500" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-caption text-text-muted">Net balance</p>
                    <p className="text-h3 font-bold text-text-primary">
                      ${summary.net_balance.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-h3 font-semibold text-text-primary">
                  Your Groups
                </h2>
                <Link
                  href="/groups"
                  className="inline-flex items-center gap-1 rounded-radius-sm text-body-sm font-medium text-primary-500 transition-colors duration-150 hover:text-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                >
                  View all
                  <ArrowRight size="14" aria-hidden="true" />
                </Link>
              </CardHeader>
              <CardContent>
                {summary.groups.length === 0 ? (
                  <EmptyState
                    className="py-10"
                    icon={<Plus />}
                    title="No groups yet"
                    description="Create a group to start splitting expenses with friends."
                    action={
                      <Link
                        href="/groups"
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-radius-md bg-primary-500 px-4 text-button font-semibold text-white transition-colors duration-150 hover:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 [&>svg]:size-[1em]"
                      >
                        <Plus aria-hidden="true" />
                        Create group
                      </Link>
                    }
                  />
                ) : (
                  <ul className="divide-y divide-border-default" role="list">
                    {summary.groups.map((group) => (
                      <li key={group.group_id}>
                        <Link
                          href={`/groups/${group.group_id}/expenses`}
                          className="flex items-center justify-between gap-3 rounded-radius-md py-3 transition-colors duration-150 hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <span
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-radius-md bg-primary-100 text-h3"
                              aria-hidden="true"
                            >
                              {groupIcon(group.icon)}
                            </span>
                            <span className="truncate text-body font-medium text-text-primary">
                              {group.group_name}
                            </span>
                          </span>
                          <span
                            className={cn(
                              "shrink-0 text-body-sm font-semibold",
                              group.balance > 0
                                ? "text-success-500"
                                : group.balance < 0
                                  ? "text-danger-500"
                                  : "text-text-secondary"
                            )}
                          >
                            {group.balance > 0 ? "+" : ""}
                            {group.balance === 0 ? "$0.00" : `$${group.balance.toFixed(2)}`}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-h3 font-semibold text-text-primary">
                  Recent Activity
                </h2>
                <Link
                  href="/activity"
                  className="inline-flex items-center gap-1 rounded-radius-sm text-body-sm font-medium text-primary-500 transition-colors duration-150 hover:text-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                >
                  View all
                  <ArrowRight size="14" aria-hidden="true" />
                </Link>
              </CardHeader>
              <CardContent>
                {activityLoading && (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Skeleton variant="circle" className="h-10 w-10 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!activityLoading && activityError && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-radius-md bg-danger-100/40 px-4 py-3">
                    <p className="text-body-sm text-danger-500">
                      Failed to load recent activity.
                    </p>
                    <button
                      type="button"
                      onClick={handleActivityRetry}
                      className="rounded-radius-md px-3 py-1.5 text-button font-semibold text-primary-500 transition-colors duration-150 hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {!activityLoading && !activityError && activities.length === 0 && (
                  <p className="py-6 text-center text-body-sm text-text-muted">
                    No activity yet. Activity from all your groups will appear
                    here.
                  </p>
                )}

                {!activityLoading && !activityError && activities.length > 0 && (
                  <ul className="space-y-4" role="list">
                    {activities.map((activity) => (
                      <li key={activity.activity_id}>
                        <ActivityItem
                          activity={normalizeActivity(activity)}
                          groupName={groupNames[activity.group_id]}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}