-- Create local_leaderboards table
CREATE TABLE local_leaderboards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  puzzle_id UUID NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
  spent_time_ms BIGINT NOT NULL, -- completion time in milliseconds
  progress_percentage SMALLINT NOT NULL CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  difficulty_level TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.local_leaderboards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for both anonymous and authenticated users
CREATE POLICY "Anonymous users can insert leaderboard entries" ON local_leaderboards
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert their own leaderboard entries" ON local_leaderboards
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view local leaderboards" ON local_leaderboards
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Users can update their own local leaderboard entries" ON local_leaderboards
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER local_leaderboards_updated_at
  BEFORE UPDATE ON local_leaderboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add indexes
CREATE INDEX local_leaderboards_user_id_idx ON local_leaderboards(user_id);
CREATE INDEX local_leaderboards_puzzle_id_idx ON local_leaderboards(puzzle_id);
CREATE INDEX local_leaderboards_spent_time_idx ON local_leaderboards(spent_time_ms);
CREATE INDEX local_leaderboards_difficulty_idx ON local_leaderboards(difficulty_level);
CREATE UNIQUE INDEX local_leaderboards_user_puzzle_unique ON local_leaderboards(user_id, puzzle_id);

-- Performance indexes
CREATE INDEX local_leaderboards_puzzle_time_idx ON local_leaderboards(puzzle_id, spent_time_ms);