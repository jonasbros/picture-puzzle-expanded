-- Create friendships table
CREATE TABLE friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create friend_requests table
CREATE TABLE friend_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for friendships
CREATE POLICY "Users can view their own friendships" ON friendships
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "Users can create friendships" ON friendships
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "Users can delete their own friendships" ON friendships
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR friend_id = auth.uid());

-- Create RLS policies for friend_requests
CREATE POLICY "Users can view requests they sent or received" ON friend_requests
  FOR SELECT TO authenticated
  USING (requester_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can create friend requests" ON friend_requests
  FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update requests they received" ON friend_requests
  FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid());

-- Add constraints
ALTER TABLE friendships ADD CONSTRAINT friendships_no_self_friend CHECK (user_id != friend_id);
ALTER TABLE friendships ADD CONSTRAINT friendships_unique UNIQUE (user_id, friend_id);

ALTER TABLE friend_requests ADD CONSTRAINT friend_requests_no_self_request CHECK (requester_id != recipient_id);
ALTER TABLE friend_requests ADD CONSTRAINT friend_requests_unique UNIQUE (requester_id, recipient_id);

-- Create updated_at trigger for friend_requests
CREATE TRIGGER friend_requests_updated_at
  BEFORE UPDATE ON friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add indexes
CREATE INDEX friendships_user_id_idx ON friendships(user_id);
CREATE INDEX friendships_friend_id_idx ON friendships(friend_id);
CREATE INDEX friend_requests_requester_idx ON friend_requests(requester_id);
CREATE INDEX friend_requests_recipient_idx ON friend_requests(recipient_id);
CREATE INDEX friend_requests_status_idx ON friend_requests(status);

-- Function to automatically create friendship when request is accepted
CREATE OR REPLACE FUNCTION handle_friend_request_accepted()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed to 'accepted', create friendship
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Insert friendship (both directions)
    INSERT INTO friendships (user_id, friend_id) VALUES 
      (NEW.requester_id, NEW.recipient_id),
      (NEW.recipient_id, NEW.requester_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic friendship creation
CREATE TRIGGER friend_request_accepted
  AFTER UPDATE ON friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_friend_request_accepted();