import { z } from "zod";

export const createLocalLeaderboardSchema = z
  .object({
    puzzle_id: z.string().uuid("Invalid puzzle ID"),
    progress_percentage: z
      .number()
      .min(0, "Progress must be at least 0%")
      .max(100, "Progress cannot exceed 100%"),
    spent_time_ms: z.number().int().min(0, "Time spent must be non-negative"),
    user_id: z.string().uuid("Invalid user ID").optional().nullable(),
    name: z
      .string()
      .min(1, "Name is required for guest players")
      .max(100, "Name must be 100 characters or less")
      .optional()
      .nullable(),
    difficulty_level: z
      .string()
      .max(50, "Difficulty level must be 50 characters or less")
      .optional()
      .nullable(),
  })
  .refine((data) => data.user_id || data.name, {
    message: "Either user_id or name must be provided",
    path: ["user_id"],
  });

export type CreateLocalLeaderboardInput = z.infer<
  typeof createLocalLeaderboardSchema
>;
