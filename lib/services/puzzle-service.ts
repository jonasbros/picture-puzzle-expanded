import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/supabase";
import {
  PuzzleRepository,
  IPuzzleRepository,
} from "@/lib/repositories/puzzle-repository";
import { Puzzle, DailyPuzzle } from "@/lib/types/puzzle";
import {
  createPuzzleSchema,
  updatePuzzleSchema,
  puzzleFiltersSchema,
  CreatePuzzleInput,
  UpdatePuzzleInput,
  PuzzleFilters,
} from "@/lib/validations/puzzle";

export interface IPuzzleService {
  getAllPuzzles(filters?: PuzzleFilters): Promise<Puzzle[]>;
  getPuzzleById(id: string): Promise<Puzzle | null>;
  createPuzzle(data: CreatePuzzleInput): Promise<Puzzle>;
  updatePuzzle(id: string, data: UpdatePuzzleInput): Promise<Puzzle>;
  deletePuzzle(id: string): Promise<void>;
  searchPuzzles(query: string): Promise<Puzzle[]>;
  getDailyPuzzle(): Promise<Puzzle | null>;
  getDailyPuzzleWithCountdown(): Promise<DailyPuzzle | null>;
  validatePuzzleExists(id: string): Promise<Puzzle>;
}

export class PuzzleService implements IPuzzleService {
  private repository: IPuzzleRepository;

  constructor(supabase: SupabaseClient<Database>) {
    this.repository = new PuzzleRepository(supabase);
  }

  async getAllPuzzles(filters: PuzzleFilters = {}): Promise<Puzzle[]> {
    const validatedFilters = puzzleFiltersSchema.parse(filters);
    return await this.repository.getAll(validatedFilters);
  }

  async getPuzzleById(id: string): Promise<Puzzle | null> {
    if (!id) throw new Error("Puzzle ID is required");
    return await this.repository.getById(id);
  }

  async createPuzzle(data: CreatePuzzleInput): Promise<Puzzle> {
    const validatedData = createPuzzleSchema.parse(data);

    // Business logic: Check for duplicate URLs
    const existingPuzzles = await this.repository.search(validatedData.url);
    if (existingPuzzles.some((p) => p.url === validatedData.url)) {
      throw new Error("A puzzle with this URL already exists");
    }

    return await this.repository.create(validatedData);
  }

  async updatePuzzle(id: string, data: UpdatePuzzleInput): Promise<Puzzle> {
    const validatedData = updatePuzzleSchema.parse(data);

    // Ensure puzzle exists
    await this.validatePuzzleExists(id);

    // Business logic: Check for duplicate URLs if URL is being updated
    if (validatedData.url) {
      const existingPuzzles = await this.repository.search(validatedData.url);
      const duplicates = existingPuzzles.filter(
        (p) => p.url === validatedData.url && p.id !== id
      );
      if (duplicates.length > 0) {
        throw new Error("A puzzle with this URL already exists");
      }
    }

    return await this.repository.update(id, validatedData);
  }

  async deletePuzzle(id: string): Promise<void> {
    // Ensure puzzle exists before deletion
    await this.validatePuzzleExists(id);

    // Business logic: Add any pre-deletion checks here
    // e.g., check if puzzle is used in active games/tournaments

    return await this.repository.delete(id);
  }

  async searchPuzzles(query: string): Promise<Puzzle[]> {
    if (!query.trim()) return [];
    if (query.length < 2)
      throw new Error("Search query must be at least 2 characters");

    return await this.repository.search(query.trim());
  }

  async getDailyPuzzle(): Promise<Puzzle | null> {
    return await this.repository.getDailyPuzzle();
  }

  async getDailyPuzzleWithCountdown(): Promise<DailyPuzzle | null> {
    return await this.repository.getDailyPuzzleWithCountdown();
  }

  async validatePuzzleExists(id: string): Promise<Puzzle> {
    const puzzle = await this.repository.getById(id);
    if (!puzzle) {
      throw new Error("Puzzle not found");
    }
    return puzzle;
  }
}

// Factory function for easy instantiation
export function createPuzzleService(
  supabase: SupabaseClient<Database>
): IPuzzleService {
  return new PuzzleService(supabase);
}
