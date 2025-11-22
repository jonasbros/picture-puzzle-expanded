-- Update daily_puzzles.puzzle_date to TIMESTAMPTZ for countdown functionality

-- First, update existing data to include specific time (e.g., midnight UTC)
UPDATE daily_puzzles 
SET puzzle_date = puzzle_date::date + TIME '00:00:00';

-- Alter the column type from DATE to TIMESTAMPTZ
ALTER TABLE daily_puzzles 
ALTER COLUMN puzzle_date TYPE TIMESTAMPTZ 
USING puzzle_date::timestamptz;

-- Update the index to reflect the new column type
DROP INDEX IF EXISTS daily_puzzles_puzzle_date_idx;
CREATE INDEX daily_puzzles_puzzle_date_idx ON daily_puzzles(puzzle_date);

-- Update the performance index as well
DROP INDEX IF EXISTS daily_puzzles_date_desc_idx;
CREATE INDEX daily_puzzles_date_desc_idx ON daily_puzzles(puzzle_date DESC);