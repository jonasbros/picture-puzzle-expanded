import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/supabase";

type GameSession = Database["public"]["Tables"]["game_sessions"]["Row"];
type CreateGameSessionInput = Database["public"]["Tables"]["game_sessions"]["Insert"];
type UpdateGameSessionInput = Database["public"]["Tables"]["game_sessions"]["Update"];

/**
 * Repository for game_sessions table operations
 * Implements data access layer following Repository pattern
 */
export class GameSessionRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Get game session by ID
   */
  async getById(id: string): Promise<GameSession | null> {
    const { data, error } = await this.supabase
      .from("game_sessions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get all game sessions for a user
   */
  async getByUserId(userId: string): Promise<GameSession[]> {
    const { data, error } = await this.supabase
      .from("game_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get all game sessions for a puzzle
   */
  async getByPuzzleId(puzzleId: string): Promise<GameSession[]> {
    const { data, error } = await this.supabase
      .from("game_sessions")
      .select("*")
      .eq("puzzle_id", puzzleId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get user's current (unfinished) session for a puzzle
   */
  async getCurrentSession(userId: string, puzzleId: string): Promise<GameSession | null> {
    const { data, error } = await this.supabase
      .from("game_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("puzzle_id", puzzleId)
      .eq("is_finished", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows returned
    return data || null;
  }

  /**
   * Get completed sessions for a user with optional filters
   */
  async getCompletedSessions(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      puzzleId?: string;
      tournamentId?: string;
    }
  ): Promise<GameSession[]> {
    let query = this.supabase
      .from("game_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_finished", true)
      .order("created_at", { ascending: false });

    if (options?.puzzleId) {
      query = query.eq("puzzle_id", options.puzzleId);
    }

    if (options?.tournamentId) {
      query = query.eq("tournament_id", options.tournamentId);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  /**
   * Create a new game session
   */
  async create(input: CreateGameSessionInput): Promise<GameSession> {
    const { data, error } = await this.supabase
      .from("game_sessions")
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update an existing game session
   */
  async update(id: string, input: UpdateGameSessionInput): Promise<GameSession> {
    const { data, error } = await this.supabase
      .from("game_sessions")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a game session (soft delete by setting deleted_at)
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("game_sessions")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  }

  /**
   * Hard delete a game session (permanent removal)
   */
  async hardDelete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("game_sessions")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  /**
   * Get leaderboard for a specific puzzle (best completion times)
   */
  async getPuzzleLeaderboard(
    puzzleId: string,
    limit: number = 10
  ): Promise<(GameSession & { user: { username: string; avatar: string | null } })[]> {
    const { data, error } = await this.supabase
      .from("game_sessions")
      .select(`
        *,
        user:users!inner(username, avatar)
      `)
      .eq("puzzle_id", puzzleId)
      .eq("is_finished", true)
      .eq("completion_percentage", 100)
      .order("time_spent_ms", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * Get user statistics for game sessions
   */
  async getUserStats(userId: string): Promise<{
    totalSessions: number;
    completedSessions: number;
    averageTime: number | null;
    bestTime: number | null;
  }> {
    const { data, error } = await this.supabase
      .from("game_sessions")
      .select("time_spent_ms, is_finished, completion_percentage")
      .eq("user_id", userId);

    if (error) throw error;

    const completedSessions = data.filter(session => 
      session.is_finished && session.completion_percentage === 100
    );

    const completionTimes = completedSessions.map(session => session.time_spent_ms);

    return {
      totalSessions: data.length,
      completedSessions: completedSessions.length,
      averageTime: completionTimes.length > 0 
        ? Math.round(completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length)
        : null,
      bestTime: completionTimes.length > 0 ? Math.min(...completionTimes) : null
    };
  }
}