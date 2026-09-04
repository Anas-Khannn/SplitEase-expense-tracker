"use client";

import { Modal, Skeleton } from "@/components/ui";
import { useExpense } from "@/hooks/useExpenses";
import { useAuth } from "@/components/auth/AuthProvider";
import { ExpenseReactions } from "./ExpenseCard";
import { ReceiptText } from "lucide-react";
import type { Expense } from "@/types";

interface ViewExpenseModalProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
  expense: Expense | null;
}

function formatCurrency(amount: string): string {
  const value = Number(amount);
  if (Number.isNaN(value)) return amount;
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface DetailRowProps {
  label: string;
  value?: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground break-all text-right">
        {value ?? "—"}
      </dd>
    </div>
  );
}

export function ViewExpenseModal({
  open,
  onClose,
  groupId,
  expense,
}: ViewExpenseModalProps) {
  const { user } = useAuth();
  const expenseId = expense?.expense_id;

  const { data: detail, isLoading } = useExpense(groupId, expenseId ?? "");

  const selected = detail ?? expense;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Expense details"
      description={selected?.description ?? "Loading expense details…"}
    >
      <div className="space-y-4">
        {isLoading && !selected ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
            <div className="divide-y divide-border-default">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                <ReceiptText className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {selected?.description || "Untitled expense"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(selected?.expense_date ?? "") || "No date"}
                </p>
              </div>
            </div>

            <dl className="mt-4 divide-y divide-border-default rounded-lg border border-border-default bg-background px-4">
              <DetailRow label="Amount" value={formatCurrency(selected?.amount ?? "")} />
              <DetailRow label="Paid by" value={selected?.payer?.name} />
              <DetailRow
                label="Created"
                value={formatDateTime(selected?.created_at ?? "") || undefined}
              />
              <DetailRow
                label="Last updated"
                value={formatDateTime(selected?.updated_at ?? "") || undefined}
              />
            </dl>

            <div className="mt-4">
              <h4 className="text-sm font-semibold text-foreground">
                Split between
              </h4>
              <ul className="mt-2 divide-y divide-border-default rounded-lg border border-border-default bg-background">
                {(selected?.splits ?? []).map((split) => (
                  <li
                    key={split.expense_split_id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <span className="truncate text-sm text-foreground">
                      {split.user.name}
                    </span>
                    <span className="shrink-0 text-sm text-foreground tabular-nums">
                      {formatCurrency(String(split.share_amount))}
                    </span>
                  </li>
                ))}
                {(selected?.splits?.length ?? 0) === 0 && (
                  <li className="px-4 py-3 text-sm text-muted-foreground">
                    No split information available.
                  </li>
                )}
              </ul>
            </div>

            {selected && (
              <div className="mt-4">
                <ExpenseReactions
                  expenseId={selected.expense_id}
                  currentUserId={user?.user_id}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}