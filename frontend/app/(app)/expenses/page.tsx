"use client";

import Link from "next/link";
import { useGroups } from "@/hooks/useGroups";
import { useAllExpenses } from "@/hooks/useAllExpenses";
import { Card, CardContent, Skeleton, EmptyState, ErrorState } from "@/components/ui";
import { ArrowRight, ReceiptText, Plus } from "lucide-react";
import type { Expense, GroupListItem } from "@/types";

interface AggregatedExpenses {
  expenses: Expense[];
  groupNames: Record<string, string>;
}

function collectExpenses(
  groups: GroupListItem[] | undefined,
  groupQueries: ReturnType<typeof useAllExpenses>
): AggregatedExpenses {
  const groupNames: Record<string, string> = {};
  for (const group of groups ?? []) {
    groupNames[group.group_id] = group.name;
  }

  const expenses: Expense[] = [];
  for (const query of groupQueries) {
    for (const item of query.data ?? []) {
      expenses.push(item);
    }
  }

  expenses.sort(
    (a, b) =>
      new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime()
  );

  return { expenses, groupNames };
}

function formatAmount(amount: string) {
  const num = Number(amount);
  if (Number.isNaN(num)) return amount;
  return num.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ExpensesPage() {
  const {
    data: groups,
    isLoading: groupsLoading,
    isError: groupsError,
    error: groupsErrorMsg,
    refetch: refetchGroups,
  } = useGroups();

  const groupQueries = useAllExpenses(groups);
  const { expenses, groupNames } = collectExpenses(groups, groupQueries);

  const isLoading = groupsLoading || groupQueries.some((q) => q.isLoading);
  const isError = groupsError || groupQueries.some((q) => q.isError);

  const handleRetry = () => {
    refetchGroups();
    groupQueries.forEach((q) => q.refetch());
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-h2 font-bold text-text-primary">Expenses</h2>
        <p className="mt-1 text-body-sm text-text-muted">
          Your expenses across all groups.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-4">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-40 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <ErrorState
          title="Failed to load expenses"
          description={groupsErrorMsg?.message ?? "Something went wrong"}
          onRetry={handleRetry}
        />
      )}

      {!isLoading && !isError && expenses.length === 0 && (
        <EmptyState
          icon={<ReceiptText />}
          title="No expenses yet"
          description="Expenses from all your groups will appear here as members add them."
          action={
            (groups?.length ?? 0) === 0 ? (
              <Link
                href="/groups"
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-radius-md bg-primary-500 px-4 text-button font-semibold text-white transition-colors duration-150 hover:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 [&>svg]:size-[1em]"
              >
                <Plus aria-hidden="true" />
                Browse groups
              </Link>
            ) : (
              <Link
                href={`/groups/${groups?.[0]?.group_id}/expenses`}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-radius-md bg-primary-500 px-4 text-button font-semibold text-white transition-colors duration-150 hover:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 [&>svg]:size-[1em]"
              >
                <Plus aria-hidden="true" />
                Add expense
              </Link>
            )
          }
        />
      )}

      {!isLoading && !isError && expenses.length > 0 && (
        <div className="space-y-3">
          {expenses.map((expense) => {
            const groupName = groupNames[expense.group_id] ?? "Group";
            return (
              <Card key={expense.expense_id}>
                <CardContent className="flex flex-wrap items-center gap-4 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body font-semibold text-text-primary">
                      {expense.description}
                    </p>
                    <p className="mt-1 text-body-sm text-text-secondary">
                      {groupName} · paid by {expense.payer.name}
                    </p>
                    <p className="mt-0.5 text-caption text-text-muted">
                      {formatDate(expense.expense_date)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-body font-semibold text-text-primary">
                      {formatAmount(expense.amount)}
                    </span>
                    <Link
                      href={`/groups/${expense.group_id}/expenses`}
                      className="inline-flex items-center gap-1 rounded-radius-sm text-body-sm font-medium text-primary-500 transition-colors duration-150 hover:text-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                      aria-label={`Open ${groupName} expenses`}
                    >
                      View group
                      <ArrowRight aria-hidden="true" size={16} />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
