-- Create leaderboards table
CREATE TABLE leaderboards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  top_time INTEGER NOT NULL, -- in milliseconds
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view leaderboards" ON leaderboards
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own leaderboard entries" ON leaderboards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leaderboard entries" ON leaderboards
  FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER leaderboards_updated_at
  BEFORE UPDATE ON leaderboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add indexes
CREATE INDEX leaderboards_user_id_idx ON leaderboards(user_id);
CREATE INDEX leaderboards_top_time_idx ON leaderboards(top_time);
CREATE INDEX leaderboards_created_at_idx ON leaderboards(created_at);