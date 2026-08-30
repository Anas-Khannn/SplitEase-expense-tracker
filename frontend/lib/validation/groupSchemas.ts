import { z } from "zod";

export const createGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Group name is required")
    .max(50, "Group name must be 50 characters or less"),
  icon: z
    .string()
    .trim()
    .max(100, "Icon must be 100 characters or less")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .max(200, "Description must be 200 characters or less")
    .optional()
    .or(z.literal("")),
});

export type CreateGroupFormData = z.output<typeof createGroupSchema>;
