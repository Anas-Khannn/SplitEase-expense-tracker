"use client";

import { Avatar, Badge } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import type { Balance } from "@/types";

interface BalanceListProps {
  balances: Balance[];
  currentUserId?: string;
}

function formatCurrency(value: number): string {
  if (Number.isNaN(value)) return "—";
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function statusLabel(status: Balance["status"]): string {
  switch (status) {
    case "OWED":
      return "The group owes";
    case "OWES":
      return "Owes the group";
    case "SETTLED":
      return "All settled";
    default:
      return status;
  }
}

export function BalanceList({ balances, currentUserId }: BalanceListProps) {
  return (
    <ul className="divide-y divide-border-default overflow-hidden rounded-radius-lg border border-border-default bg-card shadow-xs">
      {balances.map((balance) => {
        const isSelf = balance.user_id === currentUserId;
        const positive = balance.balance > 0;
        const settled = balance.status === "SETTLED";

        return (
          <li
            key={balance.user_id}
            className={cn(
              "flex items-center gap-3 px-4 py-3 min-w-0",
              isSelf && "bg-primary-100/40"
            )}
          >
            <Avatar
              name={balance.name}
              alt={balance.name || "Member"}
              size="md"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-medium text-text-primary">
                  {balance.name || balance.user_id}
                </p>
                {isSelf && <Badge variant="primary">You</Badge>}
                <Badge
                  variant={
                    settled
                      ? "neutral"
                      : positive
                        ? "success"
                        : "danger"
                  }
                >
                  {statusLabel(balance.status)}
                </Badge>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {balance.user_id}
              </p>
            </div>

            <div
              className={cn(
                "shrink-0 text-sm font-semibold tabular-nums",
                settled
                  ? "text-muted-foreground"
                  : positive
                    ? "text-success-500"
                    : "text-danger-500"
              )}
            >
              {settled
                ? formatCurrency(balance.balance)
                : positive
                  ? formatCurrency(balance.balance)
                  : `-${formatCurrency(Math.abs(balance.balance))}`}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
