"use client";

import { use } from "react";
import { useGroupSummary } from "@/hooks/useSummary";
import { SummaryChart } from "@/components/balances/SummaryChart";
import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  EmptyState,
  ErrorState,
  Skeleton,
} from "@/components/ui";
import { Receipt, Wallet } from "lucide-react";

interface SummaryPageProps {
  params: Promise<{ groupId: string }>;
}

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function SummaryPage({ params }: SummaryPageProps) {
  const { groupId } = use(params);

  const {
    data: summary,
    isLoading,
    isError,
    error,
    refetch,
  } = useGroupSummary(groupId);

  const contributions = (summary?.contributions ?? []).map((contribution) => ({
    ...contribution,
    name: contribution.name || contribution.user_id,
  }));

  const hasData = contributions.length > 0;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-h3 font-semibold text-text-primary">Group Summary</h3>
        <p className="text-body-sm text-text-muted mt-1">
          An overview of this group&apos;s spending and what each member has
          paid.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-5">
          <Card>
            <CardContent className="py-5">
              <div className="flex items-center gap-3">
                <Skeleton variant="circle" className="h-10 w-10" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-36" />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-5 lg:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="py-5">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton variant="rect" className="mt-4 h-48 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {isError && (
        <ErrorState
          title="Failed to load summary"
          description={error?.message ?? "Something went wrong"}
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && summary && !hasData && (
        <EmptyState
          icon={<Receipt />}
          title="No spending yet"
          description="Once members add expenses, this page will show the group's total spending and each member's contribution."
        />
      )}

      {!isLoading && !isError && summary && hasData && (
        <>
          <Card>
            <CardContent className="py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-radius-md bg-primary-100">
                  <Wallet className="h-5 w-5 text-primary-500" />
                </div>
                <div>
                  <p className="text-caption text-text-muted">Total spending</p>
                  <p className="text-h3 font-bold text-text-primary tabular-nums">
                    {formatCurrency(summary.total_spending)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            <SummaryChart
              contributions={contributions}
              totalSpending={summary.total_spending}
            />

            <Card className="min-w-0">
              <CardHeader>
                <h3 className="text-h3 font-semibold text-text-primary">
                  Contributions
                </h3>
                <p className="text-body-sm text-text-muted mt-1">
                  Amount each member has paid.
                </p>
              </CardHeader>
              <ul className="divide-y divide-border-default">
                {contributions.map((contribution) => (
                  <li
                    key={contribution.user_id}
                    className="flex items-center gap-3 px-5 py-4"
                  >
                    <Avatar
                      name={contribution.name}
                      alt={contribution.name || "Member"}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body font-medium text-text-primary">
                        {contribution.name}
                      </p>
                    </div>
                    <span className="shrink-0 text-body font-semibold text-text-primary tabular-nums">
                      {formatCurrency(contribution.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
