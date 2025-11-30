-- Create game_sessions table
CREATE TABLE game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  puzzle_id UUID NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE SET NULL,
  piece_positions TEXT NOT NULL,
  time_spent_ms BIGINT NOT NULL,
  completion_percentage DECIMAL(5,2) DEFAULT 0.00,
  mmr_change INTEGER DEFAULT 0 NOT NULL,
  mmr_before INTEGER,
  mmr_after INTEGER,
  is_finished BOOLEAN DEFAULT false NOT NULL,
  difficulty_level TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for both anonymous and authenticated users
CREATE POLICY "Anonymous users can insert game sessions" ON game_sessions
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert their own game sessions" ON game_sessions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own game sessions" ON game_sessions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own game sessions" ON game_sessions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER game_sessions_updated_at
  BEFORE UPDATE ON game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add indexes
CREATE INDEX game_sessions_user_id_idx ON game_sessions(user_id);
CREATE INDEX game_sessions_puzzle_id_idx ON game_sessions(puzzle_id);
CREATE INDEX game_sessions_tournament_id_idx ON game_sessions(tournament_id);
CREATE INDEX game_sessions_is_finished_idx ON game_sessions(is_finished);
CREATE INDEX game_sessions_created_at_idx ON game_sessions(created_at);

-- Performance indexes
CREATE INDEX game_sessions_user_created_idx ON game_sessions(user_id, created_at);
CREATE INDEX game_sessions_puzzle_time_idx ON game_sessions(puzzle_id, time_spent_ms);
CREATE INDEX game_sessions_finished_mmr_idx ON game_sessions(is_finished, mmr_change);
CREATE INDEX game_sessions_completion_idx ON game_sessions(completion_percentage DESC);
CREATE INDEX game_sessions_difficulty_idx ON game_sessions(difficulty_level);