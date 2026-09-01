"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Input, Textarea, Button } from "@/components/ui";
import { useUpdateExpense } from "@/hooks/mutations";
import { useGroup } from "@/hooks/useGroups";
import { cn } from "@/lib/utils/cn";
import {
  updateExpenseSchema,
  type UpdateExpenseFormData,
} from "@/lib/validation/expenseSchemas";
import type { Expense } from "@/types";

interface EditExpenseModalProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
  expense: Expense | null;
}

export function EditExpenseModal({
  open,
  onClose,
  groupId,
  expense,
}: EditExpenseModalProps) {
  const updateExpense = useUpdateExpense();
  const { data: group } = useGroup(groupId);

  const members = group?.members ?? [];

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateExpenseFormData>({
    resolver: zodResolver(updateExpenseSchema),
    defaultValues: {
      amount: "",
      description: "",
      paid_by: "",
      participant_ids: [],
      expense_date: "",
    },
  });

  useEffect(() => {
    if (open && expense) {
      reset({
        amount: expense.amount,
        description: expense.description,
        paid_by: expense.paid_by,
        participant_ids: expense.splits.map((s) => s.user_id),
        expense_date: expense.expense_date.slice(0, 10),
      });
    }
  }, [open, expense, reset]);

  const onSubmit = (data: UpdateExpenseFormData) => {
    if (!expense) return;
    updateExpense.mutate(
      {
        groupId,
        expenseId: expense.expense_id,
        data: {
          amount: Number(data.amount),
          description: data.description,
          paid_by: data.paid_by,
          participant_ids: data.participant_ids,
          expense_date: data.expense_date,
        },
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    if (updateExpense.isPending) return;
    reset();
    onClose();
  };

  const selectClass =
    "h-10 w-full rounded-md border border-border-default bg-card px-3 text-sm text-text-primary focus-visible:outline-2 focus-visible:outline-focus-ring disabled:opacity-50";

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Edit expense"
      description="Update the expense details below."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              required
              disabled={updateExpense.isPending}
              error={errors.amount?.message}
              {...register("amount")}
            />
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-expense-date"
                className="text-sm font-medium text-text-primary"
              >
                Date
              </label>
              <input
                id="edit-expense-date"
                type="date"
                disabled={updateExpense.isPending}
                className={cn(selectClass, "h-10")}
                {...register("expense_date")}
              />
              {errors.expense_date && (
                <p className="text-xs text-danger-500" role="alert">
                  {errors.expense_date.message}
                </p>
              )}
            </div>
          </div>

          <Textarea
            label="Description"
            placeholder="What was this expense for?"
            required
            disabled={updateExpense.isPending}
            error={errors.description?.message}
            {...register("description")}
          />

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="edit-expense-payer"
              className="text-sm font-medium text-text-primary"
            >
              Paid by
            </label>
            <select
              id="edit-expense-payer"
              disabled={updateExpense.isPending}
              className={selectClass}
              {...register("paid_by")}
            >
              {members.map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {member.name}
                </option>
              ))}
            </select>
            {errors.paid_by && (
              <p className="text-xs text-danger-500" role="alert">
                {errors.paid_by.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-primary">
              Split between
            </span>
            <div className="divide-y divide-border-default overflow-hidden rounded-md border border-border-default bg-card">
              <Controller
                control={control}
                name="participant_ids"
                render={({ field }) => {
                  const selected = field.value ?? [];
                  return (
                    <>
                      {members.map((member) => {
                        const checked = selected.includes(member.user_id);
                        return (
                          <label
                            key={member.user_id}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 px-3 py-2.5",
                              updateExpense.isPending && "opacity-50"
                            )}
                          >
                            <input
                              type="checkbox"
                              disabled={updateExpense.isPending}
                              checked={checked}
                              onChange={(e) => {
                                const next = e.target.checked
                                  ? [...selected, member.user_id]
                                  : selected.filter((id) => id !== member.user_id);
                                field.onChange(next);
                              }}
                              className="h-4 w-4 accent-primary-500"
                            />
                            <span className="text-sm text-text-primary">
                              {member.name}
                            </span>
                          </label>
                        );
                      })}
                    </>
                  );
                }}
              />
            </div>
            {errors.participant_ids && (
              <p className="text-xs text-danger-500" role="alert">
                {errors.participant_ids.message}
              </p>
            )}
          </div>

          {updateExpense.isError && (
            <p className="text-sm text-danger-500" role="alert">
              {updateExpense.error instanceof Error
                ? updateExpense.error.message
                : "Failed to update expense. Please try again."}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleClose}
            disabled={updateExpense.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={updateExpense.isPending}
          >
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
