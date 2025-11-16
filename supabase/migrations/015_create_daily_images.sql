-- Create daily_puzzles table
CREATE TABLE daily_puzzles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  puzzle_id UUID NOT NULL REFERENCES puzzles(id),
  puzzle_date DATE NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE daily_puzzles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can view daily puzzles" ON daily_puzzles
  FOR SELECT TO authenticated
  USING (true);

-- Add indexes
CREATE INDEX daily_puzzles_puzzle_date_idx ON daily_puzzles(puzzle_date);
CREATE INDEX daily_puzzles_puzzle_id_idx ON daily_puzzles(puzzle_id);