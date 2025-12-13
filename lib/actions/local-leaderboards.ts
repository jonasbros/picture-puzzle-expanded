'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createLocalLeaderboardService } from '@/lib/services/local-leaderboard-service';
import { CreateLocalLeaderboardInput } from '@/lib/validations/local-leaderboard';

export async function createLocalLeaderboardEntryAction(
  data: CreateLocalLeaderboardInput
) {
  try {
    const supabase = await createClient();
    const localLeaderboardService = createLocalLeaderboardService(supabase);

    const entry = await localLeaderboardService.createEntry(data);

    revalidatePath(`/puzzle/${data.puzzle_id}`);
    revalidatePath('/puzzle/${data.puzzle_id}/leaderboards');

    return { success: true, data: entry };
  } catch (error) {
    console.error('Create local leaderboard entry error:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to create leaderboard entry',
    };
  }
}

export async function getByPuzzleId(puzzleId: string) {
  const supabase = await createClient();
  const localLeaderboardService = createLocalLeaderboardService(supabase);
  return await localLeaderboardService.getByPuzzleId(puzzleId);
}
