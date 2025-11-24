// Updated leaderboard types to support both authenticated and guest users
export interface Leaderboard {
  id: string;
  user_id?: string | null; // Nullable for guest users
  name?: string | null; // Guest user name (arcade style)
  mmr: number;
  difficulty_level?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  // Joined user data (when user_id is present)
  user?: {
    username: string;
    avatar?: string | null;
  };
}

export interface LocalLeaderboard {
  id: string;
  user_id?: string | null; // Nullable for guest users
  name?: string | null; // Guest user name (arcade style)
  puzzle_id: string;
  spent_time_ms: number; // completion time in milliseconds
  progress_percentage: number;
  difficulty_level?: string | null;
  created_at: string;
  updated_at: string;
  // Joined user data (when user_id is present)
  user?: {
    username: string;
    avatar?: string | null;
  };
}

// Input types for creating leaderboard entries
export interface CreateLeaderboardInput {
  mmr: number;
  difficulty_level?: string;
  // Either user_id OR name must be provided, not both
  user_id?: string;
  name?: string;
}

export interface CreateLocalLeaderboardInput {
  puzzle_id: string;
  spent_time_ms: number;
  progress_percentage: number;
  difficulty_level?: string;
  // Either user_id OR name must be provided, not both
  user_id?: string;
  name?: string;
}

// Helper type for guest leaderboard entries
export interface GuestLeaderboardEntry {
  name: string;
  mmr: number;
  difficulty_level?: string;
}

export interface GuestLocalLeaderboardEntry {
  name: string;
  puzzle_id: string;
  spent_time_ms: number;
  progress_percentage: number;
  difficulty_level?: string;
}