-- Insert daily puzzles for the next week with specific times
WITH puzzle_ids AS (
  SELECT id FROM puzzles ORDER BY created_at LIMIT 1
)
INSERT INTO daily_puzzles (puzzle_id, puzzle_date)
SELECT 
  id,
  -- Set daily puzzles to release at midnight UTC
  date_trunc('day', NOW()) + (row_number() OVER () - 1) * INTERVAL '1 day'
FROM puzzle_ids;