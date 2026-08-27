"use client";

import { use } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useGroupBalance } from "@/hooks/useBalances";
import { useGroup } from "@/hooks/useGroups";
import { BalanceList } from "@/components/balances/BalanceList";
import { SettleUpButton } from "@/components/balances/SettleUpButton";
import { Card, CardContent, Skeleton, EmptyState, ErrorState } from "@/components/ui";
import { Wallet } from "lucide-react";

interface BalancesPageProps {
  params: Promise<{ groupId: string }>;
}

export default function BalancesPage({ params }: BalancesPageProps) {
  const { groupId } = use(params);
  const { user } = useAuth();

  const {
    data: balances,
    isLoading,
    isError,
    error,
    refetch,
  } = useGroupBalance(groupId);

  const { data: group } = useGroup(groupId);
  const members = (group?.members ?? []).map((m) => ({
    user_id: m.user_id,
    name: m.name,
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-h3 font-semibold text-text-primary">Balances</h3>
          <p className="text-body-sm text-text-muted mt-1">
            Current balances owed between members and the group.
          </p>
        </div>
        <SettleUpButton groupId={groupId} members={members} />
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
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
      )}

      {isError && (
        <ErrorState
          title="Failed to load balances"
          description={error?.message ?? "Something went wrong"}
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && balances && balances.length === 0 && (
        <EmptyState
          icon={<Wallet />}
          title="No balances yet"
          description="There are no outstanding balances in this group right now."
        />
      )}

      {!isLoading && !isError && balances && balances.length > 0 && (
        <BalanceList balances={balances} currentUserId={user?.user_id} />
      )}
    </div>
  );
}
