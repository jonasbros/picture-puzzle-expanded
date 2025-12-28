-- Remove unique constraint on puzzle_date from daily_puzzles table
-- This allows multiple puzzles to be assigned to the same date if needed

ALTER TABLE daily_puzzles 
DROP CONSTRAINT IF EXISTS daily_puzzles_puzzle_date_key;