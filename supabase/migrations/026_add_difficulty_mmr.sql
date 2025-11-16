-- Note: This migration should be run AFTER the initial migrations
-- Add difficulty-based MMR tracking to leaderboards

-- Check if columns already exist before adding
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leaderboards' AND column_name='difficulty_level') THEN
    ALTER TABLE leaderboards ADD COLUMN difficulty_level TEXT DEFAULT 'medium';
  END IF;
END $$;

-- Drop existing unique constraint if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='leaderboards_user_id_key') THEN
    ALTER TABLE leaderboards DROP CONSTRAINT leaderboards_user_id_key;
  END IF;
END $$;

-- Add new unique constraint
ALTER TABLE leaderboards ADD CONSTRAINT leaderboards_user_difficulty_unique UNIQUE (user_id, difficulty_level);

-- Add indexes for difficulty-based queries
CREATE INDEX IF NOT EXISTS leaderboards_difficulty_mmr_idx ON leaderboards(difficulty_level, mmr DESC);
CREATE INDEX IF NOT EXISTS leaderboards_difficulty_created_idx ON leaderboards(difficulty_level, created_at DESC);

-- Add difficulty to local leaderboards
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='local_leaderboards' AND column_name='difficulty_level') THEN
    ALTER TABLE local_leaderboards ADD COLUMN difficulty_level TEXT DEFAULT 'medium';
  END IF;
END $$;

-- Drop existing unique constraint if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='local_leaderboards_puzzle_user_unique') THEN
    ALTER TABLE local_leaderboards DROP CONSTRAINT local_leaderboards_puzzle_user_unique;
  END IF;
END $$;

-- Add new unique constraint
ALTER TABLE local_leaderboards ADD CONSTRAINT local_leaderboards_puzzle_user_difficulty_unique UNIQUE (puzzle_id, user_id, difficulty_level);

-- Add indexes for local leaderboards by difficulty
CREATE INDEX IF NOT EXISTS local_leaderboards_puzzle_difficulty_time_idx ON local_leaderboards(puzzle_id, difficulty_level, best_time);

-- Function to get leaderboard by difficulty
CREATE OR REPLACE FUNCTION get_leaderboard_by_difficulty(
  p_difficulty_level TEXT DEFAULT 'medium',
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  mmr INTEGER,
  rank_position BIGINT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.user_id,
    u.username,
    l.mmr,
    ROW_NUMBER() OVER (ORDER BY l.mmr DESC, l.created_at ASC) as rank_position,
    l.created_at
  FROM leaderboards l
  JOIN users u ON u.id = l.user_id
  WHERE l.difficulty_level = p_difficulty_level
    AND u.deleted_at IS NULL
  ORDER BY l.mmr DESC, l.created_at ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user rank in specific difficulty
CREATE OR REPLACE FUNCTION get_user_rank_by_difficulty(
  p_user_id UUID,
  p_difficulty_level TEXT DEFAULT 'medium'
)
RETURNS TABLE (
  rank_position BIGINT,
  total_players BIGINT,
  mmr INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked_players AS (
    SELECT 
      l.user_id,
      l.mmr,
      ROW_NUMBER() OVER (ORDER BY l.mmr DESC, l.created_at ASC) as rank_pos
    FROM leaderboards l
    JOIN users u ON u.id = l.user_id
    WHERE l.difficulty_level = p_difficulty_level
      AND u.deleted_at IS NULL
  )
  SELECT 
    rp.rank_pos,
    (SELECT COUNT(*) FROM ranked_players)::BIGINT as total_players,
    rp.mmr
  FROM ranked_players rp
  WHERE rp.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update MMR calculation function to handle difficulty
CREATE OR REPLACE FUNCTION update_mmr_for_difficulty()
RETURNS TRIGGER AS $$
DECLARE
  current_mmr INTEGER;
  mmr_change INTEGER;
  k_factor INTEGER := 32; -- Standard ELO K-factor
BEGIN
  -- Only process completed games with difficulty level
  IF NEW.is_finished = true AND OLD.is_finished = false AND NEW.difficulty_level IS NOT NULL THEN
    -- Get current MMR for this difficulty
    SELECT mmr INTO current_mmr
    FROM leaderboards
    WHERE user_id = NEW.user_id AND difficulty_level = NEW.difficulty_level;
    
    -- Initialize MMR if user doesn't have one for this difficulty
    IF current_mmr IS NULL THEN
      current_mmr := 1200; -- Starting MMR
      
      INSERT INTO leaderboards (user_id, mmr, difficulty_level)
      VALUES (NEW.user_id, current_mmr, NEW.difficulty_level)
      ON CONFLICT (user_id, difficulty_level) DO NOTHING;
    END IF;
    
    -- Calculate MMR change based on performance
    -- This is simplified - you'd want more complex logic based on:
    -- - Time taken vs average for this puzzle/difficulty
    -- - Completion percentage
    -- - Opponent MMR in tournaments
    mmr_change := CASE
      WHEN NEW.completion_percentage = 100.00 THEN
        CASE
          WHEN NEW.difficulty_level = 'easy' THEN 15
          WHEN NEW.difficulty_level = 'medium' THEN 25
          WHEN NEW.difficulty_level = 'hard' THEN 40
          ELSE 25
        END
      WHEN NEW.completion_percentage >= 75.00 THEN 10
      WHEN NEW.completion_percentage >= 50.00 THEN 5
      ELSE -10
    END;
    
    -- Update MMR in leaderboards
    UPDATE leaderboards
    SET mmr = current_mmr + mmr_change,
        updated_at = now()
    WHERE user_id = NEW.user_id AND difficulty_level = NEW.difficulty_level;
    
    -- Store MMR change in game session
    UPDATE game_sessions
    SET 
      mmr_before = current_mmr,
      mmr_after = current_mmr + mmr_change,
      mmr_change = mmr_change
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for difficulty-based MMR updates
DROP TRIGGER IF EXISTS update_mmr_on_completion ON game_sessions;
CREATE TRIGGER update_mmr_on_completion
  AFTER UPDATE ON game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_mmr_for_difficulty();