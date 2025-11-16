-- Create tournament_puzzles junction table
CREATE TABLE tournament_puzzles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  puzzle_id UUID NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE tournament_puzzles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view tournament puzzles" ON tournament_puzzles
  FOR SELECT TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER tournament_puzzles_updated_at
  BEFORE UPDATE ON tournament_puzzles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add indexes
CREATE INDEX tournament_puzzles_puzzle_id_idx ON tournament_puzzles(puzzle_id);
CREATE INDEX tournament_puzzles_tournament_id_idx ON tournament_puzzles(tournament_id);
CREATE UNIQUE INDEX tournament_puzzles_puzzle_tournament_unique ON tournament_puzzles(puzzle_id, tournament_id);