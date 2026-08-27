import { z } from "zod";

const amountField = z
  .string()
  .trim()
  .min(1, "Amount is required")
  .refine((v) => !Number.isNaN(Number(v)), "Enter a valid amount")
  .refine((v) => Number(v) > 0, "Amount must be greater than 0");

const participantIdsField = z
  .array(z.string().min(1, "Invalid participant"))
  .min(1, "Select at least one participant");

export const createExpenseSchema = z.object({
  amount: amountField,
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(200, "Description must be 200 characters or less"),
  paid_by: z.string().min(1, "Payer is required"),
  participant_ids: participantIdsField,
  expense_date: z.string().min(1, "Date is required"),
});

export type CreateExpenseFormData = z.output<typeof createExpenseSchema>;

export const updateExpenseSchema = createExpenseSchema;

export type UpdateExpenseFormData = z.output<typeof updateExpenseSchema>;
