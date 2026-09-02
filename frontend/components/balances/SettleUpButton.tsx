"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Input, Textarea, Button } from "@/components/ui";
import { useCreatePayment } from "@/hooks/mutations";
import { cn } from "@/lib/utils/cn";
import {
  createPaymentSchema,
  type CreatePaymentFormData,
} from "@/lib/validation/paymentSchemas";
import { HandCoins } from "lucide-react";

type MemberOption = { user_id: string; name: string };

interface SettleUpButtonProps {
  groupId: string;
  members: MemberOption[];
  toUserId?: string;
}

export function SettleUpButton({
  groupId,
  members,
  toUserId,
}: SettleUpButtonProps) {
  const createPayment = useCreatePayment();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreatePaymentFormData>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      paid_to: "",
      amount: "",
      note: "",
      payment_date: new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    if (open && toUserId) {
      setValue("paid_to", toUserId);
    }
  }, [open, toUserId, setValue]);

  const onSubmit = (data: CreatePaymentFormData) => {
    createPayment.mutate(
      {
        groupId,
        data: {
          paid_to: data.paid_to,
          amount: Number(data.amount),
          note: data.note || undefined,
          payment_date: data.payment_date,
        },
      },
      {
        onSuccess: () => {
          reset();
          setOpen(false);
        },
      }
    );
  };

  const handleClose = () => {
    if (createPayment.isPending) return;
    reset();
    setOpen(false);
  };

  const selectClass =
    "h-10 w-full rounded-md border border-border-default bg-card px-3 text-sm text-text-primary focus-visible:outline-2 focus-visible:outline-focus-ring disabled:opacity-50";

  return (
    <>
      <Button
        variant="primary"
        size="md"
        icon={<HandCoins />}
        onClick={() => setOpen(true)}
      >
        Settle up
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        title="Settle up"
        description="Record a payment you made to settle a balance with a member."
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="settle-paid-to"
                className="text-sm font-medium text-text-primary"
              >
                Paid to
              </label>
              <select
                id="settle-paid-to"
                disabled={createPayment.isPending}
                className={selectClass}
                {...register("paid_to")}
              >
                <option value="">Select a member</option>
                {members.map((member) => (
                  <option key={member.user_id} value={member.user_id}>
                    {member.name || member.user_id}
                  </option>
                ))}
              </select>
              {errors.paid_to && (
                <p className="text-xs text-danger-500" role="alert">
                  {errors.paid_to.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
                disabled={createPayment.isPending}
                error={errors.amount?.message}
                {...register("amount")}
              />
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="settle-date"
                className="text-sm font-medium text-text-primary"
              >
                  Payment date
                </label>
                <input
                  id="settle-date"
                  type="date"
                  disabled={createPayment.isPending}
                  className={cn(selectClass, "h-10")}
                  {...register("payment_date")}
                />
                {errors.payment_date && (
                <p className="text-xs text-danger-500" role="alert">
                  {errors.payment_date.message}
                  </p>
                )}
              </div>
            </div>

            <Textarea
              label="Note (optional)"
              placeholder="Optional note about this payment"
              disabled={createPayment.isPending}
              error={errors.note?.message}
              {...register("note")}
            />

            {createPayment.isError && (
              <p className="text-sm text-danger-500" role="alert">
                {createPayment.error instanceof Error
                  ? createPayment.error.message
                  : "Failed to record payment. Please try again."}
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleClose}
              disabled={createPayment.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={createPayment.isPending}
            >
              Record payment
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
