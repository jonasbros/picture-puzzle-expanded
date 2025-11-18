-- Insert daily puzzles for the next week
WITH puzzle_ids AS (
  SELECT id FROM puzzles ORDER BY created_at LIMIT 4
)
INSERT INTO daily_puzzles (puzzle_id, puzzle_date)
SELECT 
  id,
  CURRENT_DATE + (row_number() OVER () - 1) * INTERVAL '1 day'
FROM puzzle_ids;