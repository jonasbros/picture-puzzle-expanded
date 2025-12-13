import { z } from "zod";

/**
 * Validation schemas for game session operations
 */

export const createGameSessionSchema = z.object({
  user_id: z.string().uuid("Invalid user ID"),
  puzzle_id: z.string().uuid("Invalid puzzle ID"),
  tournament_id: z.string().uuid("Invalid tournament ID").optional(),
  piece_positions: z.string().min(1, "Piece positions are required"),
  time_spent_ms: z.number().int().min(0, "Time spent must be non-negative"),
  completion_percentage: z.number().min(0).max(100).default(0),
  mmr_change: z.number().int().default(0),
  mmr_before: z.number().int().optional(),
  mmr_after: z.number().int().optional(),
  is_finished: z.boolean().default(false),
  difficulty_level: z.enum(["easy", "medium", "hard"]).optional(),
});

export const updateGameSessionSchema = z.object({
  piece_positions: z.string().min(1, "Piece positions are required").optional(),
  time_spent_ms: z
    .number()
    .int()
    .min(0, "Time spent must be non-negative")
    .optional(),
  completion_percentage: z.number().min(0).max(100).optional(),
  mmr_change: z.number().int().optional(),
  mmr_before: z.number().int().optional(),
  mmr_after: z.number().int().optional(),
  is_finished: z.boolean().optional(),
  difficulty_level: z.enum(["easy", "medium", "hard"]).optional(),
  tournament_id: z.string().uuid("Invalid tournament ID").optional(),
});

export const gameSessionFiltersSchema = z.object({
  user_id: z.string().uuid().optional(),
  puzzle_id: z.string().uuid().optional(),
  tournament_id: z.string().uuid().optional(),
  is_finished: z.boolean().optional(),
  difficulty_level: z.enum(["easy", "medium", "hard"]).optional(),
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
  min_completion: z.number().min(0).max(100).optional(),
  max_time_ms: z.number().int().min(0).optional(),
});

export const gameSessionIdSchema = z.object({
  id: z.string().uuid("Invalid game session ID"),
});

// Progress update schema for real-time updates during gameplay
export const updateProgressSchema = z.object({
  piece_positions: z.string().min(1, "Piece positions are required"),
  time_spent_ms: z.number().int().min(0, "Time spent must be non-negative"),
  completion_percentage: z.number().min(0).max(100),
});

// Completion schema for finishing a puzzle
export const completeSessionSchema = z.object({
  piece_positions: z.string().min(1, "Piece positions are required"),
  time_spent_ms: z.number().int().min(0, "Time spent must be non-negative"),
  completion_percentage: z.number().min(0).max(100),
  mmr_change: z.number().int().optional(),
  mmr_before: z.number().int().optional(),
  mmr_after: z.number().int().optional(),
});

// Type exports
export type CreateGameSessionInput = z.infer<typeof createGameSessionSchema>;
export type UpdateGameSessionInput = z.infer<typeof updateGameSessionSchema>;
export type GameSessionFilters = z.infer<typeof gameSessionFiltersSchema>;
export type GameSessionId = z.infer<typeof gameSessionIdSchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
export type CompleteSessionInput = z.infer<typeof completeSessionSchema>;
