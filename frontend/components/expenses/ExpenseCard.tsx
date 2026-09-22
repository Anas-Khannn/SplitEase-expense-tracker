"use client";

import {
  Card,
  CardContent,
  Badge,
  IconButton,
} from "@/components/ui";
import { Pencil, Trash2, Eye } from "lucide-react";
import { formatCurrency, formatDate, getSplitLabel } from "@/lib/selectors";
import { ExpenseReactions } from "./ExpenseReactions";
import type { Expense } from "@/types";

interface ExpenseCardProps {
  expense: Expense;
  currentUserId?: string;
  onEdit: () => void;
  onDelete: () => void;
  onView?: () => void;
}

export { ExpenseReactions };

export function ExpenseCard({
  expense,
  currentUserId,
  onEdit,
  onDelete,
  onView,
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
            {onView && (
              <IconButton
                icon={<Eye />}
                aria-label={`View expense ${expense.description}`}
                size="sm"
                onClick={onView}
              />
            )}
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
  onView?: () => void;
}

export function ExpenseTableRow({
  expense,
  currentUserId,
  onEdit,
  onDelete,
  onView,
}: ExpenseTableRowProps) {
  const splitLabel = getSplitLabel(expense);

  return (
    <tr className="transition-colors duration-150 hover:bg-surface-alt/60 focus-within:bg-surface-alt/60">
      <td className="min-w-44 px-4 py-3">
          <p className="truncate text-sm font-medium text-text-primary max-w-48">
          {expense.description || "Untitled expense"}
        </p>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-text-primary num-tabular">
        {formatCurrency(expense.amount)}
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
          {onView && (
            <IconButton
              icon={<Eye />}
              aria-label={`View expense ${expense.description}`}
              size="sm"
              onClick={onView}
            />
          )}
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