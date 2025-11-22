"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPuzzleService } from "@/lib/services/puzzle-service";
import { CreatePuzzleInput, UpdatePuzzleInput } from "@/lib/validations/puzzle";

export async function createPuzzleAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const puzzleService = createPuzzleService(supabase);

    const puzzleData: CreatePuzzleInput = {
      title: formData.get("title") as string,
      url: formData.get("url") as string,
      attribution: formData.get("attribution")
        ? JSON.parse(formData.get("attribution") as string)
        : {},
    };

    const puzzle = await puzzleService.createPuzzle(puzzleData);

    revalidatePath("/puzzles");

    return { success: true, data: puzzle };
  } catch (error) {
    console.error("Create puzzle error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create puzzle",
    };
  }
}

export async function updatePuzzleAction(id: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const puzzleService = createPuzzleService(supabase);

    const updateData: UpdatePuzzleInput = {};

    const title = formData.get("title") as string;
    const url = formData.get("url") as string;
    const attribution = formData.get("attribution") as string;

    if (title) updateData.title = title;
    if (url) updateData.url = url;
    if (attribution) updateData.attribution = JSON.parse(attribution);

    const puzzle = await puzzleService.updatePuzzle(id, updateData);

    revalidatePath("/puzzles");
    revalidatePath(`/puzzles/${id}`);

    return { success: true, data: puzzle };
  } catch (error) {
    console.error("Update puzzle error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update puzzle",
    };
  }
}

export async function deletePuzzleAction(id: string) {
  try {
    const supabase = await createClient();
    const puzzleService = createPuzzleService(supabase);

    await puzzleService.deletePuzzle(id);

    revalidatePath("/puzzles");

    return { success: true };
  } catch (error) {
    console.error("Delete puzzle error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete puzzle",
    };
  }
}

export async function createPuzzleAndRedirect(formData: FormData) {
  const result = await createPuzzleAction(formData);

  if (result.success) {
    redirect("/puzzles");
  } else {
    throw new Error(result.error);
  }
}

export async function searchPuzzlesAction(query: string) {
  try {
    const supabase = await createClient();
    const puzzleService = createPuzzleService(supabase);

    const puzzles = await puzzleService.searchPuzzles(query);

    return { success: true, data: puzzles };
  } catch (error) {
    console.error("Search puzzles error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to search puzzles",
    };
  }
}

export async function getDailyPuzzle() {
  try {
    const supabase = await createClient();
    const puzzleService = createPuzzleService(supabase);

    const puzzle = await puzzleService.getDailyPuzzle();

    return { success: true, data: puzzle };
  } catch (error) {
    console.error("Get daily puzzle error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get daily puzzle",
    };
  }
}

export async function getDailyPuzzleWithCountdown() {
  try {
    const supabase = await createClient();
    const puzzleService = createPuzzleService(supabase);

    const dailyPuzzle = await puzzleService.getDailyPuzzleWithCountdown();

    return { success: true, data: dailyPuzzle };
  } catch (error) {
    console.error("Get daily puzzle with countdown error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get daily puzzle with countdown",
    };
  }
}
