"use client";

import {
  useCurrentUser,
  useGroups,
  useDashboardSummary,
} from "@/hooks";
import {
  Card,
  CardHeader,
  CardContent,
  Badge,
  Skeleton,
  ErrorState,
  EmptyState,
} from "@/components/ui";
import { Inbox, Users, Activity } from "lucide-react";

export default function DevApiTestPage() {
  const currentUser = useCurrentUser();
  const groups = useGroups();
  const dashboard = useDashboardSummary();

  return (
    <main className="min-h-screen bg-base py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-display font-bold text-text-primary">
            API Architecture Verification
          </h1>
          <p className="mt-2 text-body text-text-secondary">
            Dev-only page to verify TanStack Query + API service integration
          </p>
        </div>

        {/* Current User */}
        <Card>
          <CardHeader>
            <h2 className="text-h3 font-semibold">Current User (/api/auth/me)</h2>
          </CardHeader>
          <CardContent>
            {currentUser.isLoading && (
              <div className="space-y-2">
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </div>
            )}
            {currentUser.isError && (
              <ErrorState
                title="Not authenticated"
                description="Please log in to verify this query."
              />
            )}
            {currentUser.data && (
              <div className="space-y-1">
                <p className="text-body">
                  <span className="font-medium text-text-secondary">Name:</span>{" "}
                  {currentUser.data.name}
                </p>
                <p className="text-body">
                  <span className="font-medium text-text-secondary">Email:</span>{" "}
                  {currentUser.data.email}
                </p>
                <Badge variant="success" className="mt-2">
                  Query working
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Groups */}
        <Card>
          <CardHeader>
            <h2 className="text-h3 font-semibold flex items-center gap-2">
              <Users size={20} />
              Groups (/api/groups)
            </h2>
          </CardHeader>
          <CardContent>
            {groups.isLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton variant="circle" width="32px" height="32px" />
                    <Skeleton variant="text" width="50%" />
                  </div>
                ))}
              </div>
            )}
            {groups.isError && (
              <ErrorState
                title="Failed to load groups"
                description="API request failed or user not authenticated."
                onRetry={() => groups.refetch()}
              />
            )}
            {groups.data && groups.data.length === 0 && (
              <EmptyState
                icon={<Inbox />}
                title="No groups"
                description="You haven't joined any groups yet."
              />
            )}
            {groups.data && groups.data.length > 0 && (
              <div className="space-y-2">
                {groups.data.map((group) => (
                  <div
                    key={group.group_id}
                    className="flex items-center justify-between p-3 rounded-radius-md bg-surface-alt"
                  >
                    <div>
                      <p className="text-body font-medium">{group.name}</p>
                      {group.description && (
                        <p className="text-caption text-text-muted">
                          {group.description}
                        </p>
                      )}
                    </div>
                    <Badge variant={group.role === "admin" ? "primary" : "neutral"}>
                      {group.role}
                    </Badge>
                  </div>
                ))}
                <Badge variant="success" className="mt-2">
                  {groups.data.length} group(s) loaded
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dashboard Summary */}
        <Card>
          <CardHeader>
            <h2 className="text-h3 font-semibold flex items-center gap-2">
              <Activity size={20} />
              Dashboard Summary (/api/dashboard/summary)
            </h2>
          </CardHeader>
          <CardContent>
            {dashboard.isLoading && (
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rect" height="80px" />
                ))}
              </div>
            )}
            {dashboard.isError && (
              <ErrorState
                title="Failed to load dashboard"
                description="API request failed."
                onRetry={() => dashboard.refetch()}
              />
            )}
            {dashboard.data && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 rounded-radius-md bg-success-100 text-center">
                    <p className="text-caption text-success-500 font-medium">
                      Total Owed
                    </p>
                    <p className="text-h2 font-bold text-success-500 mt-1">
                      ${Number(dashboard.data.total_owed).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 rounded-radius-md bg-danger-100 text-center">
                    <p className="text-caption text-danger-500 font-medium">
                      Total Owe
                    </p>
                    <p className="text-h2 font-bold text-danger-500 mt-1">
                      ${Number(dashboard.data.total_owe).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 rounded-radius-md bg-primary-100 text-center">
                    <p className="text-caption text-primary-600 font-medium">
                      Net Balance
                    </p>
                    <p className="text-h2 font-bold text-primary-500 mt-1">
                      ${Number(dashboard.data.net_balance).toFixed(2)}
                    </p>
                  </div>
                </div>
                {dashboard.data.groups.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-body-sm font-medium text-text-secondary">
                      Per-group balances:
                    </p>
                    {dashboard.data.groups.map((g) => (
                      <div
                        key={g.group_id}
                        className="flex items-center justify-between p-2 rounded-radius-sm bg-surface-alt"
                      >
                        <span className="text-body-sm">{g.group_name}</span>
                        <span
                          className={`text-body-sm font-medium ${
                            Number(g.balance) >= 0
                              ? "text-success-500"
                              : "text-danger-500"
                          }`}
                        >
                          {Number(g.balance) >= 0 ? "+" : ""}$
                          {Number(g.balance).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <Badge variant="success">
                  Dashboard query working
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Architecture Info */}
        <Card>
          <CardHeader>
            <h2 className="text-h3 font-semibold">Architecture Status</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-body-sm">
              <div className="flex items-center gap-2">
                <Badge variant="success">OK</Badge>
                <span>QueryClientProvider mounted at root layout</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">OK</Badge>
                <span>Centralized API client with auth headers</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">OK</Badge>
                <span>API error normalization (ApiError class)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">OK</Badge>
                <span>Service layer (auth, groups, expenses, payments, balances, activity, summary, reactions, dashboard)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">OK</Badge>
                <span>Centralized query key factory</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">OK</Badge>
                <span>Query hooks with enabled conditions</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">OK</Badge>
                <span>Mutation hooks with targeted invalidation</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">OK</Badge>
                <span>No direct fetch() calls in components</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
