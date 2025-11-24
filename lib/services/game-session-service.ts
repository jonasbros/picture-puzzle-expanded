import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/supabase";
import { GameSessionRepository } from "@/lib/repositories/game-session-repository";
import {
  CreateGameSessionInput,
  UpdateGameSessionInput,
  GameSessionFilters,
  UpdateProgressInput,
  CompleteSessionInput,
  createGameSessionSchema,
  updateGameSessionSchema,
  updateProgressSchema,
  completeSessionSchema,
} from "@/lib/validations/game-session";

type GameSession = Database["public"]["Tables"]["game_sessions"]["Row"];

/**
 * Service layer for game session business logic
 * Implements business rules and validates data before repository operations
 */
export class GameSessionService {
  private repository: GameSessionRepository;

  constructor(supabase: SupabaseClient<Database>) {
    this.repository = new GameSessionRepository(supabase);
  }

  /**
   * Get game session by ID
   */
  async getById(id: string): Promise<GameSession | null> {
    if (!id) throw new Error("Game session ID is required");
    return this.repository.getById(id);
  }

  /**
   * Get all game sessions for a user
   */
  async getByUserId(userId: string): Promise<GameSession[]> {
    if (!userId) throw new Error("User ID is required");
    return this.repository.getByUserId(userId);
  }

  /**
   * Get user's current active session for a puzzle
   */
  async getCurrentSession(userId: string, puzzleId: string): Promise<GameSession | null> {
    if (!userId) throw new Error("User ID is required");
    if (!puzzleId) throw new Error("Puzzle ID is required");
    return this.repository.getCurrentSession(userId, puzzleId);
  }

  /**
   * Start a new game session or resume existing one
   */
  async startSession(input: CreateGameSessionInput): Promise<GameSession> {
    // Validate input
    const validatedInput = createGameSessionSchema.parse(input);

    // Check if user already has an active session for this puzzle
    const existingSession = await this.repository.getCurrentSession(
      validatedInput.user_id,
      validatedInput.puzzle_id
    );

    if (existingSession) {
      // Return existing session instead of creating a new one
      return existingSession;
    }

    // Create new session
    return this.repository.create(validatedInput);
  }

  /**
   * Update game session progress during gameplay
   */
  async updateProgress(
    sessionId: string,
    input: UpdateProgressInput
  ): Promise<GameSession> {
    if (!sessionId) throw new Error("Session ID is required");

    // Validate input
    const validatedInput = updateProgressSchema.parse(input);

    // Get current session to verify it exists and is not finished
    const currentSession = await this.repository.getById(sessionId);
    if (!currentSession) {
      throw new Error("Game session not found");
    }

    if (currentSession.is_finished) {
      throw new Error("Cannot update a finished game session");
    }

    // Update the session
    return this.repository.update(sessionId, validatedInput);
  }

  /**
   * Complete a game session
   */
  async completeSession(
    sessionId: string,
    input: CompleteSessionInput
  ): Promise<GameSession> {
    if (!sessionId) throw new Error("Session ID is required");

    // Validate input
    const validatedInput = completeSessionSchema.parse(input);

    // Get current session to verify it exists
    const currentSession = await this.repository.getById(sessionId);
    if (!currentSession) {
      throw new Error("Game session not found");
    }

    if (currentSession.is_finished) {
      throw new Error("Game session is already completed");
    }

    // Mark session as finished and update final data
    const updateData = {
      ...validatedInput,
      is_finished: true,
    };

    return this.repository.update(sessionId, updateData);
  }

  /**
   * Update game session with validation
   */
  async update(sessionId: string, input: UpdateGameSessionInput): Promise<GameSession> {
    if (!sessionId) throw new Error("Session ID is required");

    // Validate input
    const validatedInput = updateGameSessionSchema.parse(input);

    // Check if session exists
    const existingSession = await this.repository.getById(sessionId);
    if (!existingSession) {
      throw new Error("Game session not found");
    }

    return this.repository.update(sessionId, validatedInput);
  }

  /**
   * Delete a game session (soft delete)
   */
  async delete(sessionId: string): Promise<void> {
    if (!sessionId) throw new Error("Session ID is required");

    const existingSession = await this.repository.getById(sessionId);
    if (!existingSession) {
      throw new Error("Game session not found");
    }

    return this.repository.delete(sessionId);
  }

  /**
   * Get completed sessions with filters
   */
  async getCompletedSessions(
    userId: string,
    filters?: Omit<GameSessionFilters, "user_id">
  ): Promise<GameSession[]> {
    if (!userId) throw new Error("User ID is required");

    return this.repository.getCompletedSessions(userId, filters);
  }

  /**
   * Get puzzle leaderboard
   */
  async getPuzzleLeaderboard(puzzleId: string, limit: number = 10) {
    if (!puzzleId) throw new Error("Puzzle ID is required");
    if (limit < 1 || limit > 100) {
      throw new Error("Limit must be between 1 and 100");
    }

    return this.repository.getPuzzleLeaderboard(puzzleId, limit);
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string) {
    if (!userId) throw new Error("User ID is required");
    return this.repository.getUserStats(userId);
  }

  /**
   * Abandon a game session (mark as finished with current progress)
   */
  async abandonSession(sessionId: string): Promise<GameSession> {
    if (!sessionId) throw new Error("Session ID is required");

    const currentSession = await this.repository.getById(sessionId);
    if (!currentSession) {
      throw new Error("Game session not found");
    }

    if (currentSession.is_finished) {
      throw new Error("Game session is already finished");
    }

    // Mark as finished without completing the puzzle
    return this.repository.update(sessionId, {
      is_finished: true,
    });
  }

  /**
   * Calculate completion percentage based on correct piece positions
   */
  calculateCompletionPercentage(
    currentPositions: string,
    totalPieces: number
  ): number {
    try {
      const positions = JSON.parse(currentPositions);
      if (!Array.isArray(positions)) return 0;

      const correctPieces = positions.filter(
        (pos, index) => pos === index + 1
      ).length;

      return Math.round((correctPieces / totalPieces) * 100);
    } catch {
      return 0;
    }
  }

  /**
   * Validate piece positions format
   */
  validatePiecePositions(positions: string): boolean {
    try {
      const parsed = JSON.parse(positions);
      return Array.isArray(parsed) && parsed.every(pos => 
        typeof pos === "number" && pos > 0
      );
    } catch {
      return false;
    }
  }
}