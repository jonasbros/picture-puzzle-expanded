-- Create game_sessions table
CREATE TABLE game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE SET NULL,
  initial_state TEXT NOT NULL,
  current_state TEXT NOT NULL,
  time_remaining_ms INTEGER NOT NULL,
  move_change INTEGER DEFAULT 0 NOT NULL,
  is_finished BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own game sessions" ON game_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own game sessions" ON game_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game sessions" ON game_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER game_sessions_updated_at
  BEFORE UPDATE ON game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add indexes
CREATE INDEX game_sessions_user_id_idx ON game_sessions(user_id);
CREATE INDEX game_sessions_image_id_idx ON game_sessions(image_id);
CREATE INDEX game_sessions_tournament_id_idx ON game_sessions(tournament_id);
CREATE INDEX game_sessions_is_finished_idx ON game_sessions(is_finished);
CREATE INDEX game_sessions_created_at_idx ON game_sessions(created_at);