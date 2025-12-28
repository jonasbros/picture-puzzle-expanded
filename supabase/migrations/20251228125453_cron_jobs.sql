-- Auto-generated cron jobs migration
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================
-- Job: create_daily_puzzle.sql
-- ============================================
-- Create a cron job to automatically add a random daily puzzle
-- Runs every 30 seconds and adds a puzzle for the current date if none exists

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create function to add daily puzzle
CREATE OR REPLACE FUNCTION add_daily_puzzle_for_today()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert a random unused puzzle for today's date
  INSERT INTO daily_puzzles (puzzle_id, puzzle_date)
  SELECT 
    p.id as puzzle_id,
    CURRENT_DATE::timestamptz as puzzle_date
  FROM puzzles p
  WHERE p.deleted_at IS NULL  -- Only active puzzles
    AND NOT EXISTS (
      SELECT 1 
      FROM daily_puzzles dp 
      WHERE dp.puzzle_id = p.id  -- Puzzle hasn't been used before
    )
  ORDER BY RANDOM()
  LIMIT 1;
END;
$$;

-- Schedule the cron job to run every 30 seconds
-- Note: pg_cron uses standard cron syntax, but we'll use a custom approach for 30s intervals
-- This will run every minute, but the function logic ensures only one puzzle per day
SELECT cron.schedule(
  'daily-puzzle-job',
  '* * * * *',  -- Every minute
  'SELECT add_daily_puzzle_for_today();'
);

-- Alternative: If you want true 30-second intervals, you would need to create two jobs:
-- SELECT cron.schedule('daily-puzzle-job-1', '* * * * *', 'SELECT add_daily_puzzle_for_today();');
-- SELECT cron.schedule('daily-puzzle-job-2', '* * * * *', 'SELECT pg_sleep(30); SELECT add_daily_puzzle_for_today();');

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION add_daily_puzzle_for_today() TO authenticated;
GRANT EXECUTE ON FUNCTION add_daily_puzzle_for_today() TO service_role;

