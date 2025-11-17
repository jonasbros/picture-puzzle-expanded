-- Create tournament_invites table
CREATE TABLE tournament_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  message TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE tournament_invites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view invites they sent or received" ON tournament_invites
  FOR SELECT TO authenticated
  USING (inviter_id = auth.uid() OR invitee_id = auth.uid());

CREATE POLICY "Tournament creators can send invites" ON tournament_invites
  FOR INSERT TO authenticated
  WITH CHECK (
    inviter_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM tournaments 
      WHERE id = tournament_id AND organizer_id = auth.uid()
    )
  );

CREATE POLICY "Invitees can update their invites" ON tournament_invites
  FOR UPDATE TO authenticated
  USING (invitee_id = auth.uid());

-- Add constraints
ALTER TABLE tournament_invites ADD CONSTRAINT tournament_invites_no_self_invite CHECK (inviter_id != invitee_id);
ALTER TABLE tournament_invites ADD CONSTRAINT tournament_invites_unique UNIQUE (tournament_id, invitee_id);

-- Create updated_at trigger
CREATE TRIGGER tournament_invites_updated_at
  BEFORE UPDATE ON tournament_invites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add indexes
CREATE INDEX tournament_invites_tournament_id_idx ON tournament_invites(tournament_id);
CREATE INDEX tournament_invites_inviter_id_idx ON tournament_invites(inviter_id);
CREATE INDEX tournament_invites_invitee_id_idx ON tournament_invites(invitee_id);
CREATE INDEX tournament_invites_status_idx ON tournament_invites(status);
CREATE INDEX tournament_invites_expires_at_idx ON tournament_invites(expires_at);

-- Performance indexes
CREATE INDEX tournament_invites_tournament_status_idx ON tournament_invites(tournament_id, status);
CREATE INDEX tournament_invites_invitee_status_idx ON tournament_invites(invitee_id, status);
CREATE INDEX tournament_invites_status_expires_idx ON tournament_invites(status, expires_at) WHERE status = 'pending';
CREATE INDEX tournament_invites_created_idx ON tournament_invites(created_at DESC);

-- Function to handle tournament invite acceptance
CREATE OR REPLACE FUNCTION handle_tournament_invite_accepted()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed to 'accepted', add user to tournament participants
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Check if tournament is still open and has space
    IF EXISTS (
      SELECT 1 FROM tournaments 
      WHERE id = NEW.tournament_id 
        AND is_open = true 
        AND (
          max_player_count IS NULL OR
          (SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = NEW.tournament_id) < max_player_count
        )
    ) THEN
      -- Add participant if not already exists
      INSERT INTO tournament_participants (tournament_id, user_id)
      VALUES (NEW.tournament_id, NEW.invitee_id)
      ON CONFLICT (tournament_id, user_id) DO NOTHING;
      
      -- Create notification for successful join
      PERFORM create_notification(
        NEW.invitee_id,
        'tournament_result',
        'Tournament Joined!',
        'You have successfully joined the tournament.',
        jsonb_build_object('tournament_id', NEW.tournament_id),
        '/tournaments/' || NEW.tournament_id
      );
    ELSE
      -- Tournament is full or closed, update status
      NEW.status = 'expired';
      
      -- Create notification for failed join
      PERFORM create_notification(
        NEW.invitee_id,
        'tournament_result',
        'Tournament Full',
        'Sorry, the tournament is now full or closed.',
        jsonb_build_object('tournament_id', NEW.tournament_id)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tournament invite acceptance
CREATE TRIGGER tournament_invite_accepted
  AFTER UPDATE ON tournament_invites
  FOR EACH ROW
  EXECUTE FUNCTION handle_tournament_invite_accepted();

-- Function to create tournament invite with notification
CREATE OR REPLACE FUNCTION create_tournament_invite(
  p_tournament_id UUID,
  p_invitee_id UUID,
  p_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  invite_id UUID;
  tournament_name TEXT;
  inviter_username TEXT;
BEGIN
  -- Get tournament and inviter info
  SELECT t.name, u.username 
  INTO tournament_name, inviter_username
  FROM tournaments t, users u
  WHERE t.id = p_tournament_id 
    AND u.id = auth.uid();
  
  -- Create the invite
  INSERT INTO tournament_invites (tournament_id, inviter_id, invitee_id, message)
  VALUES (p_tournament_id, auth.uid(), p_invitee_id, p_message)
  RETURNING id INTO invite_id;
  
  -- Create notification
  PERFORM create_notification(
    p_invitee_id,
    'tournament_invite',
    'Tournament Invitation',
    inviter_username || ' invited you to join "' || tournament_name || '"',
    jsonb_build_object(
      'tournament_id', p_tournament_id,
      'invite_id', invite_id,
      'inviter_id', auth.uid()
    ),
    '/tournaments/' || p_tournament_id || '/invite/' || invite_id,
    (now() + INTERVAL '7 days')
  );
  
  RETURN invite_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to expire old tournament invites
CREATE OR REPLACE FUNCTION expire_tournament_invites()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE tournament_invites 
  SET status = 'expired' 
  WHERE status = 'pending' 
    AND expires_at < now();
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;