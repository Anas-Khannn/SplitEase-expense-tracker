import { z } from "zod";

const amountField = z
  .string()
  .trim()
  .min(1, "Amount is required")
  .refine((v) => !Number.isNaN(Number(v)), "Enter a valid amount")
  .refine((v) => Number(v) > 0, "Amount must be greater than 0");

const noteField = z
  .string()
  .trim()
  .max(200, "Note must be 200 characters or less")
  .optional()
  .or(z.literal(""));

export const createPaymentSchema = z.object({
  paid_to: z.string().min(1, "Select who you are paying"),
  amount: amountField,
  note: noteField,
  payment_date: z.string().min(1, "Payment date is required"),
});

export type CreatePaymentFormData = z.output<typeof createPaymentSchema>;
