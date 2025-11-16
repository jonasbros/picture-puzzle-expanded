-- Create user_statistics table
CREATE TABLE user_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_puzzles_completed INTEGER DEFAULT 0,
  total_time_played_ms BIGINT DEFAULT 0,
  average_completion_time_ms INTEGER,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_tournaments_participated INTEGER DEFAULT 0,
  total_tournaments_won INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own statistics" ON user_statistics
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own statistics" ON user_statistics
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Add unique constraint on user_id
ALTER TABLE user_statistics ADD CONSTRAINT user_statistics_user_id_unique UNIQUE (user_id);

-- Create updated_at trigger
CREATE TRIGGER user_statistics_updated_at
  BEFORE UPDATE ON user_statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add indexes
CREATE INDEX user_statistics_user_id_idx ON user_statistics(user_id);
CREATE INDEX user_statistics_streak_idx ON user_statistics(current_streak DESC);
CREATE INDEX user_statistics_completed_idx ON user_statistics(total_puzzles_completed DESC);