export interface Puzzle {
  id: string;
  title: string;
  url: string;
  attribution: Record<string, string>;
  slug?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface DailyPuzzle {
  id: string;
  puzzle_id: string;
  puzzle_date: string; // TIMESTAMPTZ as ISO string
  created_at: string;
  puzzle?: Puzzle; // Joined puzzle data
}

export interface SinglePuzzleResponse {
  success: boolean;
  data?: Puzzle;
  error?: string;
}

export type Piece = {
  id: string;
  position: number;
  currentPosition: number;
};
