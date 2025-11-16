-- Create tournaments table
CREATE TABLE tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  max_player_count INTEGER NOT NULL,
  min_participant_mmr INTEGER DEFAULT 0,
  max_participant_mmr INTEGER,
  bracket JSONB DEFAULT '{}',
  format TEXT NOT NULL,
  is_open BOOLEAN DEFAULT true NOT NULL,
  is_subscribed_only BOOLEAN DEFAULT false NOT NULL,
  closes_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view open tournaments" ON tournaments
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Organizers can create tournaments" ON tournaments
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their tournaments" ON tournaments
  FOR UPDATE USING (auth.uid() = organizer_id);

-- Create updated_at trigger
CREATE TRIGGER tournaments_updated_at
  BEFORE UPDATE ON tournaments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add indexes
CREATE INDEX tournaments_organizer_id_idx ON tournaments(organizer_id);
CREATE INDEX tournaments_name_idx ON tournaments(name);
CREATE INDEX tournaments_is_open_idx ON tournaments(is_open);
CREATE INDEX tournaments_closes_at_idx ON tournaments(closes_at);
CREATE INDEX tournaments_created_at_idx ON tournaments(created_at);