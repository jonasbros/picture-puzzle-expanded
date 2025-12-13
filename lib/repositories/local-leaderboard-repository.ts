import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/supabase";
import { CreateLocalLeaderboardInput } from "@/lib/validations/local-leaderboard";

type LocalLeaderboard =
  Database["public"]["Tables"]["local_leaderboards"]["Row"];

export interface ILocalLeaderboardRepository {
  create(data: CreateLocalLeaderboardInput): Promise<LocalLeaderboard>;
}

export class LocalLeaderboardRepository implements ILocalLeaderboardRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async create(data: CreateLocalLeaderboardInput): Promise<LocalLeaderboard> {
    const { data: leaderboardEntry, error } = await this.supabase
      .from("local_leaderboards")
      .insert({
        puzzle_id: data.puzzle_id,
        progress_percentage: data.progress_percentage,
        spent_time_ms: data.spent_time_ms,
        user_id: data.user_id || null,
        name: data.name || null,
        difficulty_level: data.difficulty_level || null,
      })
      .select()
      .single();

    if (error) throw error;
    return leaderboardEntry;
  }
}
