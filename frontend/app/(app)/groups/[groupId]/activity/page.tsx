"use client";

import { use } from "react";
import { useGroupActivity } from "@/hooks/useActivity";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import {
  Skeleton,
  EmptyState,
  ErrorState,
  Button,
} from "@/components/ui";
import { ListTree } from "lucide-react";

interface ActivityPageProps {
  params: Promise<{ groupId: string }>;
}

export default function ActivityPage({ params }: ActivityPageProps) {
  const { groupId } = use(params);

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

  const activities = data?.pages.flatMap((page) => page.activities) ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-h3 font-semibold text-text-primary">Activity</h3>
        <p className="text-body-sm text-text-muted mt-1">
          Recent group activity like new expenses, payments, and member changes.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 pl-4">
              <Skeleton variant="circle" className="h-10 w-10 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <ErrorState
          title="Failed to load activity"
          description={error?.message ?? "Something went wrong"}
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && activities.length === 0 && (
        <EmptyState
          icon={<ListTree />}
          title="No activity yet"
          description="Group activity will appear here as members add expenses, record payments, and manage the group."
        />
      )}

      {!isLoading && !isError && activities.length > 0 && (
        <ActivityFeed activities={activities} />
      )}

      {!isLoading && !isError && hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="secondary"
            size="md"
            loading={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
