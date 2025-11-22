export interface Puzzle {
  id: string;
  title: string;
  url: string;
  attribution: Record<string, string>;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}
