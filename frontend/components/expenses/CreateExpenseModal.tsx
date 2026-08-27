"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Input, Textarea, Button } from "@/components/ui";
import { useCreateExpense } from "@/hooks/mutations";
import { useGroup } from "@/hooks/useGroups";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils/cn";
import {
  createExpenseSchema,
  type CreateExpenseFormData,
} from "@/lib/validation/expenseSchemas";

interface CreateExpenseModalProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
}

export function CreateExpenseModal({
  open,
  onClose,
  groupId,
}: CreateExpenseModalProps) {
  const createExpense = useCreateExpense();
  const { user } = useAuth();
  const { data: group } = useGroup(groupId);

  const members = group?.members ?? [];

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateExpenseFormData>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      amount: "",
      description: "",
      paid_by: "",
      participant_ids: [],
      expense_date: new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    if (open && user) {
      setValue("paid_by", user.user_id);
      setValue("participant_ids", [user.user_id]);
    }
  }, [open, user, setValue]);

  const onSubmit = (data: CreateExpenseFormData) => {
    createExpense.mutate(
      {
        groupId,
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
    if (createExpense.isPending) return;
    reset();
    onClose();
  };

  const selectClass =
    "h-10 w-full rounded-radius-md border border-border-default bg-surface px-3 text-body text-text-primary focus-visible:outline-2 focus-visible:outline-focus-ring disabled:opacity-50";

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add an expense"
      description="Record a shared expense and how it is split between members."
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
              disabled={createExpense.isPending}
              error={errors.amount?.message}
              {...register("amount")}
            />
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="expense-date"
                className="text-body-sm font-medium text-text-primary"
              >
                Date
              </label>
              <input
                id="expense-date"
                type="date"
                disabled={createExpense.isPending}
                className={cn(selectClass, "h-10")}
                {...register("expense_date")}
              />
              {errors.expense_date && (
                <p className="text-caption text-danger-500" role="alert">
                  {errors.expense_date.message}
                </p>
              )}
            </div>
          </div>

          <Textarea
            label="Description"
            placeholder="What was this expense for?"
            required
            disabled={createExpense.isPending}
            error={errors.description?.message}
            {...register("description")}
          />

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="expense-payer"
              className="text-body-sm font-medium text-text-primary"
            >
              Paid by
            </label>
            <select
              id="expense-payer"
              disabled={createExpense.isPending}
              className={selectClass}
              {...register("paid_by")}
            >
              <option value="">Select who paid</option>
              {members.map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {member.name}
                </option>
              ))}
            </select>
            {errors.paid_by && (
              <p className="text-caption text-danger-500" role="alert">
                {errors.paid_by.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-body-sm font-medium text-text-primary">
              Split between
            </span>
            <div className="divide-y divide-border-default overflow-hidden rounded-radius-md border border-border-default bg-surface">
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
                              createExpense.isPending && "opacity-50"
                            )}
                          >
                            <input
                              type="checkbox"
                              disabled={createExpense.isPending}
                              checked={checked}
                              onChange={(e) => {
                                const next = e.target.checked
                                  ? [...selected, member.user_id]
                                  : selected.filter((id) => id !== member.user_id);
                                field.onChange(next);
                              }}
                              className="h-4 w-4 accent-primary-500"
                            />
                            <span className="text-body text-text-primary">
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
              <p className="text-caption text-danger-500" role="alert">
                {errors.participant_ids.message}
              </p>
            )}
          </div>

          {createExpense.isError && (
            <p className="text-body-sm text-danger-500" role="alert">
              {createExpense.error instanceof Error
                ? createExpense.error.message
                : "Failed to create expense. Please try again."}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleClose}
            disabled={createExpense.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={createExpense.isPending}
          >
            Add expense
          </Button>
        </div>
      </form>
    </Modal>
  );
}
