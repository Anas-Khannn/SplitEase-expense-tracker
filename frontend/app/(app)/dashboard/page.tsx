"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useDashboardSummary } from "@/hooks/useDashboard";
import { Card, CardContent, CardHeader, Skeleton, EmptyState, ErrorState } from "@/components/ui";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: summary, isLoading, isError, error } = useDashboardSummary();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-h2 font-bold text-text-primary">
          Welcome back, {user?.name?.split(" ")[0] ?? "there"}
        </h2>
        <p className="text-body-sm text-text-muted mt-1">
          Here&apos;s your expense overview
        </p>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-5">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isError && (
        <ErrorState
          title="Failed to load dashboard"
          description={error?.message ?? "Something went wrong"}
        />
      )}

      {summary && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-radius-md bg-success-100">
                    <TrendingUp className="h-5 w-5 text-success-500" />
                  </div>
                  <div>
                    <p className="text-caption text-text-muted">You&apos;re owed</p>
                    <p className="text-h3 font-bold text-success-500">
                      ${summary.total_owed.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-radius-md bg-danger-100">
                    <TrendingDown className="h-5 w-5 text-danger-500" />
                  </div>
                  <div>
                    <p className="text-caption text-text-muted">You owe</p>
                    <p className="text-h3 font-bold text-danger-500">
                      ${summary.total_owe.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-radius-md bg-primary-100">
                    <DollarSign className="h-5 w-5 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-caption text-text-muted">Net balance</p>
                    <p className="text-h3 font-bold text-text-primary">
                      ${summary.net_balance.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {summary.groups.length === 0 ? (
            <EmptyState
              title="No groups yet"
              description="Create a group to start splitting expenses with friends"
            />
          ) : (
            <Card>
              <CardHeader>
                <h3 className="text-h3 font-semibold text-text-primary">Your Groups</h3>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border-default">
                  {summary.groups.map((group) => (
                    <div
                      key={group.group_id}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-h3">{group.icon ?? "📁"}</span>
                        <span className="text-body font-medium text-text-primary">
                          {group.group_name}
                        </span>
                      </div>
                      <span
                        className={`text-body-sm font-semibold ${
                          group.balance >= 0
                            ? "text-success-500"
                            : "text-danger-500"
                        }`}
                      >
                        {group.balance >= 0 ? "+" : ""}${group.balance.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
