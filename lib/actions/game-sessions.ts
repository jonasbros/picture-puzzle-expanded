"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/lib/types/supabase";
import { GameSessionService } from "@/lib/services/game-session-service";
import {
  CreateGameSessionInput,
  UpdateGameSessionInput,
  UpdateProgressInput,
  CompleteSessionInput,
  GameSessionFilters,
} from "@/lib/validations/game-session";

type GameSession = Database["public"]["Tables"]["game_sessions"]["Row"];

type ActionResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Server actions for game session operations
 * Following the established pattern from other actions in the codebase
 */

/**
 * Create a new game session
 */
export async function createGameSession(
  input: CreateGameSessionInput
): Promise<ActionResult<GameSession>> {
  try {
    const supabase = await createClient();
    const service = new GameSessionService(supabase);

    const session = await service.startSession(input);

    revalidatePath("/puzzle");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: session,
    };
  } catch (error) {
    console.error("Error creating game session:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create game session",
    };
  }
}

/**
 * Get game session by ID
 */
export async function getGameSession(
  id: string
): Promise<ActionResult<GameSession | null>> {
  try {
    const supabase = await createClient();
    const service = new GameSessionService(supabase);

    const session = await service.getById(id);

    if (!session) {
      return {
        success: false,
        error: "Game session not found",
      };
    }

    return {
      success: true,
      data: session,
    };
  } catch (error) {
    console.error("Error fetching game session:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch game session",
    };
  }
}

/**
 * Get current active session for a user and puzzle
 */
export async function getCurrentGameSession(
  userId: string,
  puzzleId: string
): Promise<ActionResult<GameSession | null>> {
  try {
    const supabase = await createClient();
    const service = new GameSessionService(supabase);

    const session = await service.getCurrentSession(userId, puzzleId);

    return {
      success: true,
      data: session,
    };
  } catch (error) {
    console.error("Error fetching current game session:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch current game session",
    };
  }
}

/**
 * Update game session progress during gameplay
 */
export async function updateGameSessionProgress(
  sessionId: string,
  input: UpdateProgressInput
): Promise<ActionResult<GameSession>> {
  try {
    const supabase = await createClient();
    const service = new GameSessionService(supabase);

    const session = await service.updateProgress(sessionId, input);

    return {
      success: true,
      data: session,
    };
  } catch (error) {
    console.error("Error updating game session progress:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update progress",
    };
  }
}

/**
 * Complete a game session
 */
export async function completeGameSession(
  sessionId: string,
  input: CompleteSessionInput
): Promise<ActionResult<GameSession>> {
  try {
    const supabase = await createClient();
    const service = new GameSessionService(supabase);

    const session = await service.completeSession(sessionId, input);

    revalidatePath("/puzzle");
    revalidatePath("/dashboard");
    revalidatePath("/leaderboard");

    return {
      success: true,
      data: session,
    };
  } catch (error) {
    console.error("Error completing game session:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to complete session",
    };
  }
}

/**
 * Update a game session
 */
export async function updateGameSession(
  sessionId: string,
  input: UpdateGameSessionInput
): Promise<ActionResult<GameSession>> {
  try {
    const supabase = await createClient();
    const service = new GameSessionService(supabase);

    const session = await service.update(sessionId, input);

    revalidatePath("/puzzle");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: session,
    };
  } catch (error) {
    console.error("Error updating game session:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update session",
    };
  }
}

/**
 * Delete a game session
 */
export async function deleteGameSession(
  sessionId: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const service = new GameSessionService(supabase);

    await service.delete(sessionId);

    revalidatePath("/puzzle");
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting game session:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete session",
    };
  }
}

/**
 * Abandon a game session
 */
export async function abandonGameSession(
  sessionId: string
): Promise<ActionResult<GameSession>> {
  try {
    const supabase = await createClient();
    const service = new GameSessionService(supabase);

    const session = await service.abandonSession(sessionId);

    revalidatePath("/puzzle");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: session,
    };
  } catch (error) {
    console.error("Error abandoning game session:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to abandon session",
    };
  }
}

/**
 * Get user's completed game sessions
 */
export async function getUserCompletedSessions(
  userId: string,
  options?: Omit<GameSessionFilters, "user_id">
): Promise<ActionResult<GameSession[]>> {
  try {
    const supabase = await createClient();
    const service = new GameSessionService(supabase);

    const sessions = await service.getCompletedSessions(userId, options);

    return {
      success: true,
      data: sessions,
    };
  } catch (error) {
    console.error("Error fetching completed sessions:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch completed sessions",
    };
  }
}

/**
 * Get puzzle leaderboard
 */
export async function getPuzzleLeaderboard(
  puzzleId: string,
  limit: number = 10
): Promise<
  ActionResult<
    (GameSession & { user: { username: string; avatar: string | null } })[]
  >
> {
  try {
    const supabase = await createClient();
    const service = new GameSessionService(supabase);

    const leaderboard = await service.getPuzzleLeaderboard(puzzleId, limit);

    return {
      success: true,
      data: leaderboard,
    };
  } catch (error) {
    console.error("Error fetching puzzle leaderboard:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch leaderboard",
    };
  }
}

/**
 * Get user game session statistics
 */
export async function getUserGameStats(userId: string): Promise<
  ActionResult<{
    totalSessions: number;
    completedSessions: number;
    averageTime: number | null;
    bestTime: number | null;
  }>
> {
  try {
    const supabase = await createClient();
    const service = new GameSessionService(supabase);

    const stats = await service.getUserStats(userId);

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch user statistics",
    };
  }
}
