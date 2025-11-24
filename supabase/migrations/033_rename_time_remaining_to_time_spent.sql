-- Rename time_remaining_ms to time_spent_ms in game_sessions table
ALTER TABLE game_sessions 
  RENAME COLUMN time_remaining_ms TO time_spent_ms;

-- Update the existing index that references the old column name
DROP INDEX IF EXISTS game_sessions_puzzle_time_idx;
CREATE INDEX game_sessions_puzzle_time_idx ON game_sessions(puzzle_id, time_spent_ms);