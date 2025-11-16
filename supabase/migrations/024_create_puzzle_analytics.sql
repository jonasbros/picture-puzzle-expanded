-- Create puzzle_analytics table for tracking puzzle difficulty and performance
CREATE TABLE puzzle_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  puzzle_id UUID NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
  difficulty_level TEXT,
  total_attempts INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  total_time_ms BIGINT DEFAULT 0,
  average_completion_time_ms INTEGER,
  fastest_completion_ms INTEGER,
  slowest_completion_ms INTEGER,
  completion_rate DECIMAL(5,4), -- percentage as decimal (0.0-1.0)
  difficulty_rating DECIMAL(3,2), -- Auto-calculated difficulty (1.0-5.0)
  total_players INTEGER DEFAULT 0, -- Unique players who attempted
  last_updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE puzzle_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can view puzzle analytics" ON puzzle_analytics
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "System can manage puzzle analytics" ON puzzle_analytics
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Add unique constraint
ALTER TABLE puzzle_analytics ADD CONSTRAINT puzzle_analytics_puzzle_difficulty_unique UNIQUE (puzzle_id, difficulty_level);

-- Add indexes
CREATE INDEX puzzle_analytics_puzzle_id_idx ON puzzle_analytics(puzzle_id);
CREATE INDEX puzzle_analytics_difficulty_idx ON puzzle_analytics(difficulty_level);
CREATE INDEX puzzle_analytics_completion_rate_idx ON puzzle_analytics(completion_rate DESC);
CREATE INDEX puzzle_analytics_difficulty_rating_idx ON puzzle_analytics(difficulty_rating DESC);
CREATE INDEX puzzle_analytics_average_time_idx ON puzzle_analytics(average_completion_time_ms ASC);
CREATE INDEX puzzle_analytics_updated_idx ON puzzle_analytics(last_updated_at DESC);

-- Function to update puzzle analytics when game session completes
CREATE OR REPLACE FUNCTION update_puzzle_analytics()
RETURNS TRIGGER AS $$
DECLARE
  session_time_ms INTEGER;
BEGIN
  -- Only process completed games
  IF NEW.is_finished = true AND OLD.is_finished = false THEN
    -- Calculate session time (adjust based on your time tracking method)
    session_time_ms := NEW.time_remaining_ms;
    
    -- Insert or update puzzle analytics
    INSERT INTO puzzle_analytics (
      puzzle_id,
      difficulty_level,
      total_attempts,
      total_completions,
      total_time_ms,
      average_completion_time_ms,
      fastest_completion_ms,
      slowest_completion_ms,
      completion_rate,
      total_players
    )
    VALUES (
      NEW.puzzle_id,
      COALESCE(NEW.difficulty_level, 'unknown'),
      1,
      1,
      session_time_ms,
      session_time_ms,
      session_time_ms,
      session_time_ms,
      1.0,
      1
    )
    ON CONFLICT (puzzle_id, difficulty_level)
    DO UPDATE SET
      total_completions = puzzle_analytics.total_completions + 1,
      total_time_ms = puzzle_analytics.total_time_ms + session_time_ms,
      average_completion_time_ms = (puzzle_analytics.total_time_ms + session_time_ms) / (puzzle_analytics.total_completions + 1),
      fastest_completion_ms = LEAST(puzzle_analytics.fastest_completion_ms, session_time_ms),
      slowest_completion_ms = GREATEST(puzzle_analytics.slowest_completion_ms, session_time_ms),
      completion_rate = (puzzle_analytics.total_completions + 1.0) / puzzle_analytics.total_attempts,
      last_updated_at = now();
      
  -- Process when game is started (attempted but not completed)
  ELSIF NEW.user_id IS NOT NULL AND OLD.user_id IS NULL THEN
    INSERT INTO puzzle_analytics (
      puzzle_id,
      difficulty_level,
      total_attempts,
      total_completions,
      completion_rate,
      total_players
    )
    VALUES (
      NEW.puzzle_id,
      COALESCE(NEW.difficulty_level, 'unknown'),
      1,
      0,
      0.0,
      1
    )
    ON CONFLICT (puzzle_id, difficulty_level)
    DO UPDATE SET
      total_attempts = puzzle_analytics.total_attempts + 1,
      completion_rate = puzzle_analytics.total_completions::DECIMAL / (puzzle_analytics.total_attempts + 1),
      last_updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic puzzle analytics updates
CREATE TRIGGER game_session_puzzle_analytics
  AFTER UPDATE ON game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_puzzle_analytics();

-- Function to calculate difficulty ratings based on analytics
CREATE OR REPLACE FUNCTION calculate_difficulty_ratings()
RETURNS void AS $$
BEGIN
  UPDATE puzzle_analytics
  SET difficulty_rating = CASE
    WHEN completion_rate >= 0.9 THEN 1.0 -- Very Easy
    WHEN completion_rate >= 0.7 THEN 2.0 -- Easy
    WHEN completion_rate >= 0.5 THEN 3.0 -- Medium
    WHEN completion_rate >= 0.3 THEN 4.0 -- Hard
    ELSE 5.0 -- Very Hard
  END + 
  CASE
    WHEN average_completion_time_ms <= 30000 THEN 0.0 -- Very fast
    WHEN average_completion_time_ms <= 60000 THEN 0.2 -- Fast
    WHEN average_completion_time_ms <= 180000 THEN 0.0 -- Normal
    WHEN average_completion_time_ms <= 300000 THEN 0.3 -- Slow
    ELSE 0.5 -- Very slow
  END,
  last_updated_at = now()
  WHERE total_attempts >= 10; -- Only rate puzzles with enough data
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get puzzle recommendations based on user skill level
CREATE OR REPLACE FUNCTION get_recommended_puzzles(
  p_user_id UUID,
  p_difficulty_preference TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  puzzle_id UUID,
  difficulty_level TEXT,
  difficulty_rating DECIMAL,
  completion_rate DECIMAL,
  average_time_ms INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pa.puzzle_id,
    pa.difficulty_level,
    pa.difficulty_rating,
    pa.completion_rate,
    pa.average_completion_time_ms
  FROM puzzle_analytics pa
  LEFT JOIN game_sessions gs ON gs.puzzle_id = pa.puzzle_id AND gs.user_id = p_user_id
  WHERE gs.id IS NULL -- User hasn't attempted this puzzle
    AND (p_difficulty_preference IS NULL OR pa.difficulty_level = p_difficulty_preference)
    AND pa.total_attempts >= 5 -- Has enough data
  ORDER BY 
    CASE 
      WHEN pa.difficulty_rating BETWEEN 2.0 AND 4.0 THEN 1 -- Prefer medium difficulty
      ELSE 2
    END,
    pa.completion_rate DESC,
    RANDOM()
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;