"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createLocalLeaderboardService } from "@/lib/services/local-leaderboard-service";
import { CreateLocalLeaderboardInput } from "@/lib/validations/local-leaderboard";

export async function createLocalLeaderboardEntryAction(
  data: CreateLocalLeaderboardInput,
) {
  try {
    const supabase = await createClient();
    const localLeaderboardService = createLocalLeaderboardService(supabase);

    const entry = await localLeaderboardService.createEntry(data);

    revalidatePath(`/puzzle/${data.puzzle_id}`);
    revalidatePath("/puzzle/${data.puzzle_id}/leaderboards");

    return { success: true, data: entry };
  } catch (error) {
    console.error("Create local leaderboard entry error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create leaderboard entry",
    };
  }
}

export async function getByPuzzleId(puzzleId: string) {
  const supabase = await createClient();
  const localLeaderboardService = createLocalLeaderboardService(supabase);
  return await localLeaderboardService.getByPuzzleId(puzzleId);
}

export async function getAllAverageScores() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_all_leaderboard_averages", {
    limit_count: 100,
  });

  if (error) {
    throw error;
  }
  return data;
}

const LEADERBOARD_PREVIEW_LIMIT = 5;

export async function getLeaderboardPreview(page: number = 1) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_all_leaderboard_averages", {
      limit_count: 100,
    });

    if (error) throw error;

    const total = data?.length ?? 0;
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * LEADERBOARD_PREVIEW_LIMIT;
    const entries = (data ?? []).slice(offset, offset + LEADERBOARD_PREVIEW_LIMIT);

    return { success: true, data: entries, total };
  } catch (error) {
    console.error("Get leaderboard preview error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get leaderboard preview",
    };
  }
}
