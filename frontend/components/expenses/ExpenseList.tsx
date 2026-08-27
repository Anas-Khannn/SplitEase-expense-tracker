"use client";

import { ExpenseCard } from "./ExpenseCard";
import { EmptyState, Button } from "@/components/ui";
import { ReceiptText, Plus } from "lucide-react";
import type { Expense } from "@/types";

interface ExpenseListProps {
  expenses: Expense[];
  currentUserId?: string;
  onAddExpense: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function ExpenseList({
  expenses,
  currentUserId,
  onAddExpense,
  onEdit,
  onDelete,
}: ExpenseListProps) {
  if (expenses.length === 0) {
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
