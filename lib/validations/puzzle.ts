import { z } from "zod";

export const createPuzzleSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title too long"),
  url: z.url("Invalid URL format"),
  attribution: z.record(z.string(), z.string()).optional(),
});

export const updatePuzzleSchema = z.object({
  title: z
    .string()
    .min(2, "Title is required")
    .max(100, "Title too long")
    .optional(),
  url: z.url("Invalid URL format").optional(),
  attribution: z.record(z.string(), z.any()).optional(),
});

export const puzzleFiltersSchema = z.object({
  title: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

export type CreatePuzzleInput = z.infer<typeof createPuzzleSchema>;
export type UpdatePuzzleInput = z.infer<typeof updatePuzzleSchema>;
export type PuzzleFilters = z.infer<typeof puzzleFiltersSchema>;
