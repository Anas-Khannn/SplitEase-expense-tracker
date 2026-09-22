"use client";

import { ActivityItem } from "./ActivityItem";
import { ActivityFeedSkeleton } from "@/components/skeletons";
import type { Activity } from "@/types";

interface ActivityFeedProps {
  activities: Activity[];
  groupNames?: Record<string, string>;
  isLoading?: boolean;
  skeletonCount?: number;
}

export function ActivityFeed({
  activities,
  groupNames,
  isLoading = false,
  skeletonCount = 3,
}: ActivityFeedProps) {
  if (isLoading) {
    return <ActivityFeedSkeleton count={skeletonCount} card />;
  }

  return (
    <ol className="space-y-5 rounded-radius-lg border border-border-default bg-card px-4 py-5 shadow-xs">
      {activities.map((activity, index) => (
        <li key={activity.activity_id} className="relative">
          {index < activities.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute left-[2.25rem] top-10 bottom-[-1.25rem] w-px -translate-x-px bg-border-default"
            />
          )}
          <ActivityItem
            activity={activity}
            groupName={groupNames?.[activity.group_id]}
          />
        </li>
      ))}
    </ol>
  );
}
