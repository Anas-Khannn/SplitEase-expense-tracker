"use client";

import { ActivityItem } from "./ActivityItem";
import type { Activity } from "@/types";

interface ActivityFeedProps {
  activities: Activity[];
  groupNames?: Record<string, string>;
}

export function ActivityFeed({ activities, groupNames }: ActivityFeedProps) {
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
