import { z } from "zod";

export const addMemberSchema = z.object({
  userId: z
    .string()
    .trim()
    .min(1, "User ID is required")
    .max(100, "User ID must be 100 characters or less"),
});

export type AddMemberFormData = z.output<typeof addMemberSchema>;
