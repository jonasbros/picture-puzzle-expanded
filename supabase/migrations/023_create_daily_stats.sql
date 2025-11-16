-- Create daily_stats table for user performance tracking
CREATE TABLE daily_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stat_date DATE NOT NULL,
  puzzles_completed INTEGER DEFAULT 0,
  puzzles_attempted INTEGER DEFAULT 0,
  total_time_ms BIGINT DEFAULT 0,
  best_time_ms INTEGER,
  average_time_ms INTEGER,
  streak_count INTEGER DEFAULT 0,
  perfect_completions INTEGER DEFAULT 0, -- Completed with 100%
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own daily stats" ON daily_stats
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can manage daily stats" ON daily_stats
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add unique constraint
ALTER TABLE daily_stats ADD CONSTRAINT daily_stats_user_date_unique UNIQUE (user_id, stat_date);

-- Create updated_at trigger
CREATE TRIGGER daily_stats_updated_at
  BEFORE UPDATE ON daily_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add indexes
CREATE INDEX daily_stats_user_id_idx ON daily_stats(user_id);
CREATE INDEX daily_stats_date_idx ON daily_stats(stat_date DESC);
CREATE INDEX daily_stats_user_date_idx ON daily_stats(user_id, stat_date DESC);
CREATE INDEX daily_stats_streak_idx ON daily_stats(streak_count DESC);
CREATE INDEX daily_stats_best_time_idx ON daily_stats(best_time_ms ASC) WHERE best_time_ms IS NOT NULL;

-- Function to update daily stats when game session completes
CREATE OR REPLACE FUNCTION update_daily_stats_on_completion()
RETURNS TRIGGER AS $$
DECLARE
  current_date DATE := CURRENT_DATE;
  session_time_ms INTEGER;
BEGIN
  -- Only process when game is finished
  IF NEW.is_finished = true AND OLD.is_finished = false THEN
    -- Calculate session time (assuming this is stored somewhere)
    session_time_ms := NEW.time_remaining_ms; -- Adjust based on your time tracking
    
    -- Insert or update daily stats
    INSERT INTO daily_stats (
      user_id, 
      stat_date, 
      puzzles_completed, 
      puzzles_attempted,
      total_time_ms,
      best_time_ms,
      perfect_completions
    )
    VALUES (
      NEW.user_id,
      current_date,
      1, -- completed
      1, -- attempted
      session_time_ms,
      session_time_ms,
      CASE WHEN NEW.completion_percentage = 100.00 THEN 1 ELSE 0 END
    )
    ON CONFLICT (user_id, stat_date)
    DO UPDATE SET
      puzzles_completed = daily_stats.puzzles_completed + 1,
      total_time_ms = daily_stats.total_time_ms + session_time_ms,
      best_time_ms = LEAST(daily_stats.best_time_ms, session_time_ms),
      perfect_completions = daily_stats.perfect_completions + CASE WHEN NEW.completion_percentage = 100.00 THEN 1 ELSE 0 END,
      average_time_ms = (daily_stats.total_time_ms + session_time_ms) / (daily_stats.puzzles_completed + 1),
      updated_at = now();
      
  -- Process when game is started (attempted)
  ELSIF NEW.user_id IS NOT NULL AND OLD.user_id IS NULL THEN
    INSERT INTO daily_stats (
      user_id,
      stat_date,
      puzzles_attempted
    )
    VALUES (
      NEW.user_id,
      current_date,
      1
    )
    ON CONFLICT (user_id, stat_date)
    DO UPDATE SET
      puzzles_attempted = daily_stats.puzzles_attempted + 1,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic daily stats updates
CREATE TRIGGER game_session_daily_stats
  AFTER UPDATE ON game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_stats_on_completion();

-- Function to calculate and update streak counts
CREATE OR REPLACE FUNCTION update_user_streaks()
RETURNS void AS $$
DECLARE
  user_record RECORD;
  current_streak INTEGER;
  streak_date DATE;
BEGIN
  -- Calculate streaks for all users
  FOR user_record IN SELECT DISTINCT user_id FROM daily_stats
  LOOP
    current_streak := 0;
    streak_date := CURRENT_DATE;
    
    -- Count consecutive days with completed puzzles
    WHILE EXISTS (
      SELECT 1 FROM daily_stats 
      WHERE user_id = user_record.user_id 
        AND stat_date = streak_date 
        AND puzzles_completed > 0
    ) LOOP
      current_streak := current_streak + 1;
      streak_date := streak_date - INTERVAL '1 day';
    END LOOP;
    
    -- Update today's streak count
    UPDATE daily_stats 
    SET streak_count = current_streak
    WHERE user_id = user_record.user_id 
      AND stat_date = CURRENT_DATE;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;