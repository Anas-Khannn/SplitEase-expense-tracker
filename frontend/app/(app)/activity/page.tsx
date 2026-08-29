"use client";

import Link from "next/link";
import { useGroups } from "@/hooks/useGroups";
import { useAllActivity } from "@/hooks/useAllActivity";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { Card, Skeleton, EmptyState, ErrorState } from "@/components/ui";
import { ListTree, Plus } from "lucide-react";
import type { Activity, GroupListItem } from "@/types";

interface AggregatedActivity {
  activities: Activity[];
  groupNames: Record<string, string>;
}

function collectActivity(
  groups: GroupListItem[] | undefined,
  groupQueries: ReturnType<typeof useAllActivity>
): AggregatedActivity {
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

  return { activities, groupNames };
}

export default function ActivityPage() {
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-h2 font-bold text-text-primary">Activity</h2>
        <p className="mt-1 text-body-sm text-text-muted">
          Recent activity across all your groups — expenses, payments, and
          member changes.
        </p>
      </div>

      {isLoading && (
        <Card>
          <div className="space-y-5 p-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton variant="circle" className="h-10 w-10 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {!isLoading && isError && (
        <ErrorState
          title="Failed to load activity"
          description={groupsErrorMsg?.message ?? "Something went wrong"}
          onRetry={handleRetry}
        />
      )}

      {!isLoading && !isError && activities.length === 0 && (
        <EmptyState
          icon={<ListTree />}
          title="No activity yet"
          description="Activity from all your groups will appear here as members add expenses, record payments, and manage groups."
          action={
            (groups?.length ?? 0) === 0 ? (
              <Link
                href="/groups"
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-radius-md bg-primary-500 px-4 text-button font-semibold text-white transition-colors duration-150 hover:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 [&>svg]:size-[1em]"
              >
                <Plus aria-hidden="true" />
                Browse groups
              </Link>
            ) : undefined
          }
        />
      )}

      {!isLoading && !isError && activities.length > 0 && (
        <ActivityFeed activities={activities} groupNames={groupNames} />
      )}
    </div>
  );
}
