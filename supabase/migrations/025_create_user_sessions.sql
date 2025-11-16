-- Create user_sessions table for tracking user behavior and session analytics
CREATE TABLE user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL, -- Browser session ID or generated session ID
  session_start TIMESTAMPTZ DEFAULT now() NOT NULL,
  session_end TIMESTAMPTZ,
  last_activity TIMESTAMPTZ DEFAULT now() NOT NULL,
  puzzles_attempted INTEGER DEFAULT 0,
  puzzles_completed INTEGER DEFAULT 0,
  total_time_active_ms BIGINT DEFAULT 0,
  total_time_idle_ms BIGINT DEFAULT 0,
  device_type TEXT, -- mobile, tablet, desktop
  browser_info JSONB DEFAULT '{}',
  ip_address INET,
  country_code TEXT,
  referrer_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own sessions" ON user_sessions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can manage user sessions" ON user_sessions
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE TRIGGER user_sessions_updated_at
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add indexes
CREATE INDEX user_sessions_user_id_idx ON user_sessions(user_id);
CREATE INDEX user_sessions_session_id_idx ON user_sessions(session_id);
CREATE INDEX user_sessions_active_idx ON user_sessions(is_active) WHERE is_active = true;
CREATE INDEX user_sessions_start_time_idx ON user_sessions(session_start DESC);
CREATE INDEX user_sessions_last_activity_idx ON user_sessions(last_activity DESC);
CREATE INDEX user_sessions_user_start_idx ON user_sessions(user_id, session_start DESC);
CREATE INDEX user_sessions_device_type_idx ON user_sessions(device_type);

-- Function to start or update a user session
CREATE OR REPLACE FUNCTION upsert_user_session(
  p_user_id UUID,
  p_session_id TEXT,
  p_device_type TEXT DEFAULT NULL,
  p_browser_info JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_country_code TEXT DEFAULT NULL,
  p_referrer_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  session_uuid UUID;
  existing_session_id UUID;
BEGIN
  -- Check for existing active session
  SELECT id INTO existing_session_id
  FROM user_sessions
  WHERE user_id = p_user_id 
    AND session_id = p_session_id
    AND is_active = true
  LIMIT 1;
  
  IF existing_session_id IS NOT NULL THEN
    -- Update existing session
    UPDATE user_sessions
    SET 
      last_activity = now(),
      updated_at = now()
    WHERE id = existing_session_id;
    
    RETURN existing_session_id;
  ELSE
    -- Create new session
    INSERT INTO user_sessions (
      user_id,
      session_id,
      device_type,
      browser_info,
      ip_address,
      country_code,
      referrer_url
    )
    VALUES (
      p_user_id,
      p_session_id,
      p_device_type,
      p_browser_info,
      p_ip_address,
      p_country_code,
      p_referrer_url
    )
    RETURNING id INTO session_uuid;
    
    RETURN session_uuid;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to end a user session
CREATE OR REPLACE FUNCTION end_user_session(
  p_user_id UUID,
  p_session_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  session_duration BIGINT;
BEGIN
  -- Calculate session duration and end session
  UPDATE user_sessions
  SET 
    session_end = now(),
    total_time_active_ms = EXTRACT(EPOCH FROM (now() - session_start)) * 1000,
    is_active = false,
    updated_at = now()
  WHERE user_id = p_user_id 
    AND session_id = p_session_id
    AND is_active = true;
    
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update session activity
CREATE OR REPLACE FUNCTION update_session_activity(
  p_user_id UUID,
  p_session_id TEXT,
  p_puzzle_attempted BOOLEAN DEFAULT false,
  p_puzzle_completed BOOLEAN DEFAULT false
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_sessions
  SET 
    last_activity = now(),
    puzzles_attempted = CASE WHEN p_puzzle_attempted THEN puzzles_attempted + 1 ELSE puzzles_attempted END,
    puzzles_completed = CASE WHEN p_puzzle_completed THEN puzzles_completed + 1 ELSE puzzles_completed END,
    updated_at = now()
  WHERE user_id = p_user_id 
    AND session_id = p_session_id
    AND is_active = true;
    
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically end inactive sessions
CREATE OR REPLACE FUNCTION cleanup_inactive_sessions()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- End sessions inactive for more than 30 minutes
  UPDATE user_sessions
  SET 
    session_end = last_activity + INTERVAL '30 minutes',
    total_time_active_ms = EXTRACT(EPOCH FROM (last_activity + INTERVAL '30 minutes' - session_start)) * 1000,
    is_active = false,
    updated_at = now()
  WHERE is_active = true
    AND last_activity < now() - INTERVAL '30 minutes';
    
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get session analytics
CREATE OR REPLACE FUNCTION get_session_analytics(
  p_user_id UUID DEFAULT NULL,
  p_days_back INTEGER DEFAULT 7
)
RETURNS TABLE (
  total_sessions BIGINT,
  avg_session_duration_ms BIGINT,
  total_time_spent_ms BIGINT,
  puzzles_per_session DECIMAL,
  completion_rate DECIMAL,
  most_active_device TEXT,
  most_active_hour INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_sessions,
    AVG(total_time_active_ms)::BIGINT as avg_session_duration_ms,
    SUM(total_time_active_ms)::BIGINT as total_time_spent_ms,
    AVG(puzzles_attempted)::DECIMAL as puzzles_per_session,
    CASE 
      WHEN SUM(puzzles_attempted) > 0 THEN SUM(puzzles_completed)::DECIMAL / SUM(puzzles_attempted)
      ELSE 0
    END as completion_rate,
    MODE() WITHIN GROUP (ORDER BY device_type) as most_active_device,
    MODE() WITHIN GROUP (ORDER BY EXTRACT(HOUR FROM session_start)) as most_active_hour
  FROM user_sessions
  WHERE (p_user_id IS NULL OR user_id = p_user_id)
    AND session_start >= now() - (p_days_back || ' days')::INTERVAL
    AND session_end IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;