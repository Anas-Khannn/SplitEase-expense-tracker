"use client";

import { Card, CardContent, CardHeader, Skeleton } from "@/components/ui";
import {
  GroupListSkeleton,
  BalanceCardSkeleton,
  ActivityFeedSkeleton,
  ExpenseListSkeleton,
  MemberListSkeleton,
  SummaryChartSkeleton,
} from "./component-skeletons";

function DashboardOverviewSkeleton() {
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <Card key={index} className="rounded-xl border border-border bg-card p-6 shadow-xs">
            <Skeleton className="mb-3 h-4 w-28" />
            <Skeleton className="h-9 w-40" />
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
          <CardHeader className="border-b border-border bg-muted/30 px-6 py-4">
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="p-6">
            <ActivityFeedSkeleton count={3} className="!space-y-4" />
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
          <CardHeader className="border-b border-border bg-muted/30 px-6 py-4">
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="p-6">
            <ActivityFeedSkeleton count={3} className="!space-y-4" />
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <CardHeader className="border-b border-border bg-muted/30 px-6 py-4">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="p-6">
          <ExpenseListSkeleton count={3} frame="rows" />
        </CardContent>
      </Card>
    </>
  );
}

function GroupsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <Card key={index}>
            <CardContent className="py-5">
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <GroupListSkeleton count={3} />
    </div>
  );
}

function ExpensesPageSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((index) => (
        <Card key={index} className="h-full">
          <CardContent className="space-y-4 py-5">
            <div className="flex items-center gap-4">
              <Skeleton variant="rect" className="h-12 w-12 shrink-0 rounded-radius-md" />
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
  );
}

function BalancesPageSkeleton() {
  return (
    <div className="space-y-4">
      <BalanceCardSkeleton />
      <BalanceCardSkeleton />
      <BalanceCardSkeleton />
    </div>
  );
}

function ActivityPageSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <ActivityFeedSkeleton count={3} />
      </CardContent>
    </Card>
  );
}

function GroupSummarySkeleton() {
  return (
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
        <SummaryChartSkeleton height={240} />
        <Card className="min-w-0">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-border-default">
              {[0, 1, 2].map((index) => (
                <div key={index} className="flex items-center gap-3 py-4">
                  <Skeleton variant="circle" className="h-8 w-8" />
                  <Skeleton className="h-4 w-32 flex-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function GroupExpensesSkeleton() {
  return <ExpenseListSkeleton count={3} />;
}

function GroupBalancesSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((index) => (
        <Card key={index}>
          <CardContent className="py-3">
            <div className="flex items-center gap-3">
              <Skeleton variant="circle" className="h-10 w-10" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-5 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function GroupMembersSkeleton() {
  return <MemberListSkeleton count={3} />;
}

function GroupActivitySkeleton() {
  return <ActivityFeedSkeleton count={3} />;
}

function ProfilePageSkeleton() {
  return (
    <>
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-3">
            <Skeleton variant="circle" className="h-16 w-16" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-8" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function SettingsPageSkeleton() {
  return (
    <>
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <Skeleton variant="circle" className="h-12 w-12" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </CardContent>
      </Card>
      {[0, 1, 2].map((index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </>
  );
}

function AuthCardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <Skeleton className="mx-auto h-6 w-40" />
        <Skeleton className="mx-auto mt-2 h-4 w-56" />
      </div>
      <Skeleton className="h-11 w-full rounded-radius-lg" />
      <Skeleton className="h-4 w-24 mx-auto" />
      <div className="space-y-3">
        <Skeleton className="h-11 w-full rounded-radius-lg" />
        <Skeleton className="h-11 w-full rounded-radius-lg" />
        <Skeleton className="h-11 w-full rounded-radius-lg" />
      </div>
    </div>
  );
}

export {
  DashboardOverviewSkeleton,
  GroupsPageSkeleton,
  ExpensesPageSkeleton,
  BalancesPageSkeleton,
  ActivityPageSkeleton,
  GroupSummarySkeleton,
  GroupExpensesSkeleton,
  GroupBalancesSkeleton,
  GroupMembersSkeleton,
  GroupActivitySkeleton,
  ProfilePageSkeleton,
  SettingsPageSkeleton,
  AuthCardSkeleton,
};