import { z } from "zod";

export const createUserSchema = z.object({
  email: z.email("Invalid email address").nullable().optional(),
  username: z
    .string()
    .min(1, "Username is required")
    .max(50, "Username must be 50 characters or less"),
  is_guest: z.boolean().optional().default(false),
  username_duplicate: z.number().int().min(0).default(0).optional(),
  avatar: z.url("Invalid avatar URL").nullable().optional(),
  preferences: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
