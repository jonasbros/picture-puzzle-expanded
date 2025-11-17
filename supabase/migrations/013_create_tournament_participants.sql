-- Create tournament_participants junction table
CREATE TABLE tournament_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  total_mmr_gained INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view tournament participants" ON tournament_participants
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can join tournaments" ON tournament_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave tournaments" ON tournament_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER tournament_participants_updated_at
  BEFORE UPDATE ON tournament_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add indexes
CREATE INDEX tournament_participants_user_id_idx ON tournament_participants(user_id);
CREATE INDEX tournament_participants_tournament_id_idx ON tournament_participants(tournament_id);
CREATE UNIQUE INDEX tournament_participants_user_tournament_unique ON tournament_participants(user_id, tournament_id)
  WHERE deleted_at IS NULL;

-- Performance indexes
CREATE INDEX tournament_participants_tournament_mmr_idx ON tournament_participants(tournament_id, total_mmr_gained);