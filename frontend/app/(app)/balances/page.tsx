"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useGroups } from "@/hooks/useGroups";
import { useAllGroupBalances } from "@/hooks/useAllGroupBalances";
import { BalanceList } from "@/components/balances/BalanceList";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Skeleton,
  EmptyState,
  ErrorState,
} from "@/components/ui";
import { ArrowRight, Plus, Wallet } from "lucide-react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { Balance, GroupListItem } from "@/types";

function GroupBalanceCard({
  group,
  currentUserId,
  query,
}: {
  group: GroupListItem;
  currentUserId?: string;
  query: UseQueryResult<Balance[], Error>;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-h3" aria-hidden="true">
              {group.icon ?? "📁"}
            </span>
            <h3 className="truncate text-body font-semibold text-text-primary">
              {group.name}
            </h3>
          </div>
          <Link
            href={`/groups/${group.group_id}/balances`}
            className="inline-flex items-center gap-1 rounded-radius-sm text-body-sm font-medium text-primary-500 transition-colors duration-150 hover:text-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            View balances
            <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {query.isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton variant="circle" className="h-8 w-8" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        )}

        {query.isError && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-radius-md bg-danger-100/40 px-4 py-3">
            <p className="text-body-sm text-danger-500">
              Failed to load balances for this group.
            </p>
            <Button variant="secondary" size="sm" onClick={() => query.refetch()}>
              Retry
            </Button>
          </div>
        )}

        {!query.isLoading &&
          !query.isError &&
          query.data &&
          query.data.length === 0 && (
            <p className="text-body-sm text-text-muted">
              No outstanding balances in this group.
            </p>
          )}

        {!query.isLoading &&
          !query.isError &&
          query.data &&
          query.data.length > 0 && (
            <BalanceList balances={query.data} currentUserId={currentUserId} />
          )}
      </CardContent>
    </Card>
  );
}

export default function BalancesPage() {
  const { user } = useAuth();
  const {
    data: groups,
    isLoading: groupsLoading,
    isError: groupsError,
    error: groupsErrorMsg,
    refetch: refetchGroups,
  } = useGroups();

  const groupQueries = useAllGroupBalances(groups);

  const isLoading = groupsLoading || groupQueries.some((q) => q.isLoading);
  const isError = groupsError || groupQueries.some((q) => q.isError);
  const hasGroups = (groups?.length ?? 0) > 0;

  const handleRetry = () => {
    refetchGroups();
    groupQueries.forEach((q) => q.refetch());
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-h2 font-bold text-text-primary">Balances</h2>
        <p className="mt-1 text-body-sm text-text-muted">
          Your balances across all groups.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {[1, 2].map((j) => (
                    <div key={j} className="flex items-center gap-3">
                      <Skeleton variant="circle" className="h-8 w-8" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <ErrorState
          title="Failed to load balances"
          description={groupsErrorMsg?.message ?? "Something went wrong"}
          onRetry={handleRetry}
        />
      )}

      {!isLoading && !isError && !hasGroups && (
        <EmptyState
          icon={<Wallet />}
          title="No groups yet"
          description="Join or create a group to see your balances here."
          action={
            <Link
              href="/groups"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-radius-md bg-primary-500 px-4 text-button font-semibold text-white transition-colors duration-150 hover:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 [&>svg]:size-[1em]"
            >
              <Plus aria-hidden="true" />
              Browse groups
            </Link>
          }
        />
      )}

      {!isLoading && !isError && hasGroups && (
        <div className="space-y-4">
          {(groups ?? []).map((group, index) => (
            <GroupBalanceCard
              key={group.group_id}
              group={group}
              currentUserId={user?.user_id}
              query={groupQueries[index]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
