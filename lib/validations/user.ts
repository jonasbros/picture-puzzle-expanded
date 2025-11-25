import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  username: z.string().min(1, "Username is required").max(50, "Username must be 50 characters or less"),
  is_guest: z.boolean().optional().default(false),
  username_duplicate: z.number().int().min(0).optional().default(0),
  avatar: z.string().url("Invalid avatar URL").optional().nullable(),
  preferences: z.record(z.unknown()).optional().nullable(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;