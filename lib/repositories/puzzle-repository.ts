import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/supabase";
import { Puzzle, DailyPuzzle } from "@/lib/types/puzzle";
import {
  CreatePuzzleInput,
  UpdatePuzzleInput,
  PuzzleFilters,
} from "@/lib/validations/puzzle";

export interface IPuzzleRepository {
  getAll(filters?: PuzzleFilters): Promise<Puzzle[]>;
  getById(id: string): Promise<Puzzle | null>;
  getBySlug(slug: string): Promise<Puzzle | null>;
  create(data: CreatePuzzleInput): Promise<Puzzle>;
  update(id: string, data: UpdatePuzzleInput): Promise<Puzzle>;
  delete(id: string): Promise<void>;
  search(query: string): Promise<Puzzle[]>;
  getDailyPuzzle(): Promise<Puzzle | null>;
  getDailyPuzzleWithCountdown(): Promise<DailyPuzzle | null>;
}

export class PuzzleRepository implements IPuzzleRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getAll(filters: PuzzleFilters = {}): Promise<Puzzle[]> {
    let query = this.supabase
      .from("puzzles")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (filters.title) {
      query = query.ilike("title", `%${filters.title}%`);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 10) - 1
      );
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Puzzle[];
  }

  async getById(id: string): Promise<Puzzle | null> {
    const { data, error } = await this.supabase
      .from("puzzles")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // No rows returned
      throw error;
    }

    return data as Puzzle;
  }

  async getBySlug(slug: string): Promise<Puzzle | null> {
    const { data, error } = await this.supabase
      .from("puzzles")
      .select("*")
      .eq("slug", slug)
      .is("deleted_at", null)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // No rows returned
      throw error;
    }

    return data as Puzzle;
  }

  async create(data: CreatePuzzleInput): Promise<Puzzle> {
    const { data: puzzle, error } = await this.supabase
      .from("puzzles")
      .insert({
        title: data.title,
        url: data.url,
        attribution: data.attribution || {},
        slug: "",
      })
      .select()
      .single();

    if (error) throw error;
    return puzzle as Puzzle;
  }

  async update(id: string, data: UpdatePuzzleInput): Promise<Puzzle> {
    const { data: puzzle, error } = await this.supabase
      .from("puzzles")
      .update({
        ...(data.title && { title: data.title }),
        ...(data.url && { url: data.url }),
        ...(data.attribution && { attribution: data.attribution }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .is("deleted_at", null)
      .select()
      .single();

    if (error) throw error;
    return puzzle as Puzzle;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("puzzles")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  }

  async search(query: string): Promise<Puzzle[]> {
    const { data, error } = await this.supabase
      .from("puzzles")
      .select("*")
      .or(`title.ilike.%${query}%`)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Puzzle[];
  }

  async getDailyPuzzle(): Promise<Puzzle | null> {
    const { data, error } = await this.supabase
      .from("daily_puzzles")
      .select(
        `
        puzzle_date,
        puzzles (
          id,
          title,
          url,
          attribution,
          slug,
          created_at,
          updated_at,
          deleted_at
        )
      `
      )
      .is("puzzles.deleted_at", null)
      .order("puzzle_date", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // No rows returned
      throw error;
    }

    // Extract puzzle data from the join
    return data?.puzzles as Puzzle;
  }

  async getDailyPuzzleWithCountdown(): Promise<DailyPuzzle | null> {
    const { data, error } = await this.supabase
      .from("daily_puzzles")
      .select(
        `
        id,
        puzzle_id,
        puzzle_date,
        created_at,
        puzzles (
          id,
          title,
          url,
          attribution,
          slug,
          created_at,
          updated_at,
          deleted_at
        )
      `
      )
      .is("puzzles.deleted_at", null)
      .order("puzzle_date", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // No rows returned
      throw error;
    }

    return {
      id: data.id,
      puzzle_id: data.puzzle_id,
      puzzle_date: data.puzzle_date,
      created_at: data.created_at,
      puzzle: data.puzzles as Puzzle,
    };
  }
}
