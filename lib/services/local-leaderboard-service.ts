import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/supabase";
import {
  LocalLeaderboardRepository,
  ILocalLeaderboardRepository,
} from "@/lib/repositories/local-leaderboard-repository";
import {
  createLocalLeaderboardSchema,
  CreateLocalLeaderboardInput,
} from "@/lib/validations/local-leaderboard";

type LocalLeaderboard =
  Database["public"]["Tables"]["local_leaderboards"]["Row"];

export interface ILocalLeaderboardService {
  createEntry(data: CreateLocalLeaderboardInput): Promise<LocalLeaderboard>;
  getByPuzzleId(puzzleId: string): Promise<LocalLeaderboard[]>;
}

export class LocalLeaderboardService implements ILocalLeaderboardService {
  private repository: ILocalLeaderboardRepository;
  private supabase: SupabaseClient<Database>;

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
    this.repository = new LocalLeaderboardRepository(supabase);
  }

  async createEntry(
    data: CreateLocalLeaderboardInput
  ): Promise<LocalLeaderboard> {
    const validatedData = createLocalLeaderboardSchema.parse(data);

    // Business logic: Verify puzzle exists
    const { data: puzzle, error: puzzleError } = await this.supabase
      .from("puzzles")
      .select("id")
      .eq("id", validatedData.puzzle_id)
      .is("deleted_at", null)
      .single();

    if (puzzleError || !puzzle) {
      throw new Error("Puzzle not found");
    }

    // Business logic: If user_id provided, verify user exists
    if (validatedData.user_id) {
      const { data: user, error: userError } = await this.supabase
        .from("users")
        .select("id")
        .eq("id", validatedData.user_id)
        .is("deleted_at", null)
        .single();

      if (userError || !user) {
        throw new Error("User not found");
      }
    }

    return await this.repository.create(validatedData);
  }

  async getByPuzzleId(puzzleId: string): Promise<LocalLeaderboard[]> {
    return await this.repository.getByPuzzleId(puzzleId);
  }
}

// Factory function for easy instantiation
export function createLocalLeaderboardService(
  supabase: SupabaseClient<Database>
): ILocalLeaderboardService {
  return new LocalLeaderboardService(supabase);
}
