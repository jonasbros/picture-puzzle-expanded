-- Additional performance indexes for social features

-- Friendships compound indexes
CREATE INDEX friendships_user_created_idx ON friendships(user_id, created_at DESC);
CREATE INDEX friendships_friend_created_idx ON friendships(friend_id, created_at DESC);

-- Friend requests compound indexes  
CREATE INDEX friend_requests_recipient_status_idx ON friend_requests(recipient_id, status);
CREATE INDEX friend_requests_requester_status_idx ON friend_requests(requester_id, status);
CREATE INDEX friend_requests_status_created_idx ON friend_requests(status, created_at DESC);

-- Notifications compound indexes
CREATE INDEX notifications_user_type_idx ON notifications(user_id, type);
CREATE INDEX notifications_user_created_idx ON notifications(user_id, created_at DESC);
CREATE INDEX notifications_type_created_idx ON notifications(type, created_at DESC);

-- Tournament invites compound indexes
CREATE INDEX tournament_invites_tournament_status_idx ON tournament_invites(tournament_id, status);
CREATE INDEX tournament_invites_invitee_status_idx ON tournament_invites(invitee_id, status);
CREATE INDEX tournament_invites_status_expires_idx ON tournament_invites(status, expires_at) WHERE status = 'pending';
CREATE INDEX tournament_invites_created_idx ON tournament_invites(created_at DESC);