import { z } from "zod";

export const addMemberSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, "Enter an email or username (at least 3 characters)")
    .max(150, "Email or username must be 150 characters or less"),
});

export type AddMemberFormData = z.output<typeof addMemberSchema>;