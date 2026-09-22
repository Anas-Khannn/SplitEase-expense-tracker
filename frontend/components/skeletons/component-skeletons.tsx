"use client";

import {
  Card,
  CardContent,
  CardHeader,
  Skeleton,
} from "@/components/ui";
import { cn } from "@/lib/utils/cn";

function GroupCardSkeleton() {
  return (
    <Card variant="interactive" className="h-full">
      <CardContent className="flex h-full flex-col gap-4 py-5">
        <div className="flex items-start gap-4">
          <Skeleton variant="rect" className="h-12 w-12 shrink-0 rounded-radius-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border-default pt-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex -space-x-2">
              {[0, 1, 2].map((i) => (
                <Skeleton
                  key={i}
                  variant="circle"
                  className="h-8 w-8 border-2 border-surface"
                />
              ))}
            </div>
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-20 rounded-radius-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function GroupListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <GroupCardSkeleton key={index} />
      ))}
    </div>
  );
}

function ExpenseCardSkeleton() {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Skeleton variant="circle" className="h-9 w-9 shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-5 w-20 shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

type ExpenseListSkeletonFrame = "table" | "rows";

function ExpenseListSkeleton({
  count = 3,
  frame = "table",
}: {
  count?: number;
  frame?: ExpenseListSkeletonFrame;
}) {
  const headers = [
    "Description",
    "Amount",
    "Payer",
    "Date",
    "Split with",
    "Reactions",
    "",
  ];

  if (frame === "rows") {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="hidden sm:block">
        <div className="overflow-x-auto overflow-hidden rounded-radius-lg border border-border-default bg-card shadow-xs">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border-default bg-surface-alt/60">
                {headers.map((header, index) => (
                  <th
                    key={index}
                    scope="col"
                    className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {Array.from({ length: count }).map((_, index) => (
                <tr key={index}>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-40" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Skeleton variant="circle" className="h-6 w-6" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-12" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-6" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 sm:hidden">
        {Array.from({ length: count }).map((_, index) => (
          <ExpenseCardSkeleton key={index} />
        ))}
      </div>
    </>
  );
}

function BalanceListSkeleton({
  count = 3,
  embedded = false,
}: {
  count?: number;
  embedded?: boolean;
}) {
  const rows = (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn("flex items-center gap-3", !embedded && "px-4 py-3")}
        >
          <Skeleton variant="circle" className="h-8 w-8 shrink-0" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-4 w-20 shrink-0" />
        </div>
      ))}
    </>
  );

  if (embedded) {
    return <div className="space-y-3">{rows}</div>;
  }

  return (
    <ul className="divide-y divide-border-default overflow-hidden rounded-radius-lg border border-border-default bg-card shadow-xs">
      {rows}
    </ul>
  );
}

function BalanceCardSkeleton({ count = 2 }: { count?: number }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
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
  );
}

function ActivityItemSkeleton() {
  return (
    <div className="flex gap-3 pl-4">
      <Skeleton variant="circle" className="h-10 w-10 shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

function ActivityFeedSkeleton({
  count = 3,
  card = false,
  className,
}: {
  count?: number;
  card?: boolean;
  className?: string;
}) {
  return (
    <ol
      className={cn(
        card &&
          "rounded-radius-lg border border-border-default bg-card px-4 py-5 shadow-xs",
        !card && "space-y-5",
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <li key={index} className="relative">
          <ActivityItemSkeleton />
        </li>
      ))}
    </ol>
  );
}

function MemberListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <ul className="divide-y divide-border-default overflow-hidden rounded-radius-lg border border-border-default bg-card shadow-xs">
      {Array.from({ length: count }).map((_, index) => (
        <li key={index} className="flex items-center gap-3 px-4 py-3">
          <Skeleton variant="circle" className="h-8 w-8 shrink-0" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Skeleton className="h-8 w-16 rounded-radius-md" />
            <Skeleton className="h-8 w-8 rounded-radius-md" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function SummaryChartSkeleton({ height = 240 }: { height?: number }) {
  return (
    <Card className="min-w-0">
      <CardContent className="pb-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
        <Skeleton
          variant="rect"
          className="mt-4 w-full rounded-radius-lg"
          height={`${height}px`}
        />
      </CardContent>
    </Card>
  );
}

function SidebarSkeleton() {
  return (
    <div className="flex h-full flex-col gap-6 py-4">
      <div className="flex items-center gap-2.5 px-4">
        <Skeleton variant="rect" className="h-8 w-8 rounded-radius-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="space-y-6 px-4">
        {[0, 1].map((group) => (
          <div key={group} className="space-y-3">
            <Skeleton className="h-3 w-16" />
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} className="h-8 w-full rounded-radius-md" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="flex items-center justify-between gap-6 px-4 py-2 sm:px-6">
      <div className="flex items-center gap-4">
        <Skeleton variant="rect" className="h-8 w-8 rounded-radius-md" />
        <Skeleton className="hidden h-4 w-40 sm:block" />
      </div>
      <Skeleton variant="circle" className="h-9 w-9" />
    </div>
  );
}

export {
  GroupCardSkeleton,
  GroupListSkeleton,
  ExpenseCardSkeleton,
  ExpenseListSkeleton,
  BalanceListSkeleton,
  BalanceCardSkeleton,
  ActivityItemSkeleton,
  ActivityFeedSkeleton,
  MemberListSkeleton,
  SummaryChartSkeleton,
  SidebarSkeleton,
  HeaderSkeleton,
};