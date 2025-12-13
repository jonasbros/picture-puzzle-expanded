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

    // Business logic: Check for duplicate entries (same user/name for same puzzle)
    let duplicateQuery = this.supabase
      .from("local_leaderboards")
      .select("id")
      .eq("puzzle_id", validatedData.puzzle_id);

    if (validatedData.user_id) {
      duplicateQuery = duplicateQuery.eq("user_id", validatedData.user_id);
    } else if (validatedData.name) {
      duplicateQuery = duplicateQuery
        .eq("name", validatedData.name)
        .is("user_id", null);
    }

    const { data: existingEntry, error: duplicateError } =
      await duplicateQuery.single();

    if (existingEntry) {
      throw new Error(
        "An entry for this puzzle already exists for this user/name"
      );
    }

    // If error is not "no rows found", throw it
    if (duplicateError && duplicateError.code !== "PGRST116") {
      throw duplicateError;
    }

    return await this.repository.create(validatedData);
  }
}

// Factory function for easy instantiation
export function createLocalLeaderboardService(
  supabase: SupabaseClient<Database>
): ILocalLeaderboardService {
  return new LocalLeaderboardService(supabase);
}
