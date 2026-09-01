"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGroups } from "@/hooks/useGroups";
import { Card, CardContent, Skeleton, EmptyState, ErrorState, Button } from "@/components/ui";
import { groupIcon } from "@/lib/utils/group-icons";
import { ArrowRight, ReceiptText, Plus, Users } from "lucide-react";
import type { GroupListItem } from "@/types";

function redirectToGroup(router: { replace: (href: string) => void }, group: GroupListItem) {
  router.replace(`/groups/${group.group_id}/expenses`);
}

export default function ExpensesPage() {
  const router = useRouter();
  const redirected = useRef(false);

  const {
    data: groups,
    isLoading,
    isError,
    error,
    refetch,
  } = useGroups();

  useEffect(() => {
    if (isLoading || isError || redirected.current) return;
    if (groups && groups.length === 1) {
      redirected.current = true;
      redirectToGroup(router, groups[0]);
    }
  }, [groups, isLoading, isError, router]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Expenses</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track and manage group spending.
          </p>
        </div>
        {groups && groups.length > 1 && (
          <Button
            variant="primary"
            size="md"
            icon={<Plus />}
            onClick={() => document.getElementById("expenses-group-list")?.scrollIntoView({ behavior: "smooth", block: "start" })}
          >
            Add expense
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-full">
              <CardContent className="space-y-4 py-5">
                <div className="flex items-center gap-4">
                  <Skeleton variant="rect" className="h-12 w-12 shrink-0 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-5 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <ErrorState
          title="Failed to load your expenses"
          description={error?.message ?? "Something went wrong"}
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && groups && groups.length === 0 && (
        <EmptyState
          icon={<ReceiptText />}
          title="No groups yet"
          description="Expenses are tracked within groups. Create or join a group to start splitting costs."
          action={
            <Link
              href="/groups"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 [&>svg]:size-[1em]"
            >
              <Plus aria-hidden="true" />
              Browse groups
            </Link>
          }
        />
      )}

      {!isLoading && !isError && groups && groups.length > 1 && (
        <section
          id="expenses-group-list"
          aria-labelledby="expenses-group-title"
          className="space-y-4"
        >
          <div>
            <h2 id="expenses-group-title" className="text-lg font-semibold text-text-primary">
              Choose a group
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Select a group to view and manage its expenses.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <Link
                key={group.group_id}
                href={`/groups/${group.group_id}/expenses`}
                className="block rounded-radius-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              >
                <Card variant="interactive" className="h-full">
                  <CardContent className="flex h-full flex-col gap-4 py-5">
                    <div className="flex items-start gap-4">
                      <span
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary-100 text-lg"
                        aria-hidden="true"
                      >
                        {groupIcon(group.icon)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-text-primary">
                          {group.name}
                        </h3>
                        {group.description && (
                          <p className="mt-1 text-sm text-text-secondary line-clamp-2">
                            {group.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-border-default pt-4">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="h-4 w-4" aria-hidden="true" />
                        View expenses
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                        Open
                        <ArrowRight aria-hidden="true" size={16} />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
