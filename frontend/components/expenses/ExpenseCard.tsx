"use client";

import {
  Card,
  CardContent,
  Badge,
  IconButton,
  Button,
} from "@/components/ui";
import { useExpenseReactions } from "@/hooks/useReactions";
import {
  useAddExpenseReaction,
  useRemoveExpenseReaction,
} from "@/hooks/mutations";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Expense, ReactionType } from "@/types";

const REACTION_OPTIONS: ReactionType[] = ["👍", "😂", "😮", "❤️", "😢"];

interface ExpenseReactionsProps {
  expenseId: string;
  currentUserId?: string;
  compact?: boolean;
}

function ExpenseReactions({
  expenseId,
  currentUserId,
  compact = false,
}: ExpenseReactionsProps) {
  const { data: reactions = [] } = useExpenseReactions(expenseId);
  const addReaction = useAddExpenseReaction();
  const removeReaction = useRemoveExpenseReaction();

  const myReaction = reactions.find((r) => r.user_id === currentUserId);
  const busy = addReaction.isPending || removeReaction.isPending;

  const handleReaction = (reaction: ReactionType) => {
    if (busy) return;
    if (!myReaction) {
      addReaction.mutate({ expenseId, reaction });
    } else if (myReaction.reaction === reaction) {
      removeReaction.mutate(expenseId);
    } else {
      removeReaction.mutate(expenseId, {
        onSuccess: () => addReaction.mutate({ expenseId, reaction }),
      });
    }
  };

  return (
    <div
      className={
        compact
          ? "flex flex-wrap items-center gap-1"
          : "mt-3 flex flex-wrap items-center gap-1 border-t border-border-default pt-3"
      }
      aria-label="Add a reaction"
    >
      {REACTION_OPTIONS.map((reaction) => {
        const count = reactions.filter((r) => r.reaction === reaction).length;
        const active = myReaction?.reaction === reaction;
        return (
          <Button
            key={reaction}
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() => handleReaction(reaction)}
            className={cn("gap-1", active && "bg-primary-100 text-primary-600")}
            aria-pressed={active}
          >
            <span aria-hidden="true">{reaction}</span>
            {count > 0 && <span className="text-xs">{count}</span>}
          </Button>
        );
      })}
    </div>
  );
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

function getSplitLabel(expense: Expense): string {
  const participantNames = expense.splits
    .map((s) => s.user.name)
    .filter(Boolean);
  return participantNames.length
    ? participantNames.join(", ")
    : `${expense.splits.length} participant${expense.splits.length === 1 ? "" : "s"}`;
}

interface ExpenseCardProps {
  expense: Expense;
  currentUserId?: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function ExpenseCard({
  expense,
  currentUserId,
  onEdit,
  onDelete,
}: ExpenseCardProps) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-text-primary">
              {formatCurrency(expense.amount)}
            </span>
            <Badge variant="neutral">
              {formatDate(expense.expense_date) || "No date"}
            </Badge>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <IconButton
              icon={<Pencil />}
              aria-label={`Edit expense ${expense.description}`}
              size="sm"
              onClick={onEdit}
            />
            <IconButton
              icon={<Trash2 />}
              aria-label={`Delete expense ${expense.description}`}
              variant="danger"
              size="sm"
              onClick={onDelete}
            />
          </div>
        </div>

        <p className="mt-2 text-sm font-medium text-text-primary">
          {expense.description || "Untitled expense"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Paid by {expense.payer?.name ?? "Unknown"} · {getSplitLabel(expense)}
        </p>

        <ExpenseReactions
          expenseId={expense.expense_id}
          currentUserId={currentUserId}
        />
      </CardContent>
    </Card>
  );
}

interface ExpenseTableRowProps {
  expense: Expense;
  currentUserId?: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function ExpenseTableRow({
  expense,
  currentUserId,
  onEdit,
  onDelete,
}: ExpenseTableRowProps) {
  const splitLabel = getSplitLabel(expense);

  return (
    <tr className="transition-colors duration-150 hover:bg-surface-alt/60 focus-within:bg-surface-alt/60">
      <td className="min-w-44 px-4 py-3">
          <p className="truncate text-sm font-medium text-text-primary max-w-48">
          {expense.description || "Untitled expense"}
        </p>
      </td>
      <td className="px-4 py-3">
        <span className="whitespace-nowrap text-sm text-text-secondary">
          {expense.payer?.name ?? "Unknown"}
        </span>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-text-secondary">
        {expense.payer?.name ?? "Unknown"}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-text-secondary">
        {formatDate(expense.expense_date) || "No date"}
      </td>
      <td className="min-w-40 max-w-56 px-4 py-3">
        <p
          className="truncate text-sm text-text-secondary"
          title={splitLabel}
        >
          {splitLabel}
        </p>
      </td>
      <td className="px-4 py-3">
        <ExpenseReactions
          expenseId={expense.expense_id}
          currentUserId={currentUserId}
          compact
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <IconButton
            icon={<Pencil />}
            aria-label={`Edit expense ${expense.description}`}
            size="sm"
            onClick={onEdit}
          />
          <IconButton
            icon={<Trash2 />}
            aria-label={`Delete expense ${expense.description}`}
            variant="danger"
            size="sm"
            onClick={onDelete}
          />
        </div>
      </td>
    </tr>
  );
}