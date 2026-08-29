"use client";

import { ExpenseCard } from "./ExpenseCard";
import { EmptyState, Button } from "@/components/ui";
import { ReceiptText, Plus, FilterX, X } from "lucide-react";
import type { Expense } from "@/types";

interface ExpenseListProps {
  expenses: Expense[];
  currentUserId?: string;
  onAddExpense: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  isFiltered?: boolean;
  onClearFilters?: () => void;
}

export function ExpenseList({
  expenses,
  currentUserId,
  onAddExpense,
  onEdit,
  onDelete,
  isFiltered = false,
  onClearFilters,
}: ExpenseListProps) {
  if (expenses.length === 0) {
    if (isFiltered) {
      return (
        <EmptyState
          icon={<FilterX />}
          title="No expenses match your filters"
          description="Try adjusting or clearing the filters to see more expenses."
          action={
            onClearFilters && (
              <Button
                variant="secondary"
                size="md"
                icon={<X />}
                onClick={onClearFilters}
              >
                Clear filters
              </Button>
            )
          }
        />
      );
    }

    return (
      <EmptyState
        icon={<ReceiptText />}
        title="No expenses yet"
        description="Add your first expense to start splitting costs with the group."
        action={
          <Button
            variant="primary"
            size="md"
            icon={<Plus />}
            onClick={onAddExpense}
          >
            Add expense
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <ExpenseCard
          key={expense.expense_id}
          expense={expense}
          currentUserId={currentUserId}
          onEdit={() => onEdit(expense)}
          onDelete={() => onDelete(expense)}
        />
      ))}
    </div>
  );
}
