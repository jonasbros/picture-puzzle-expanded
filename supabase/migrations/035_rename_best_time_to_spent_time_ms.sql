-- Rename best_time to spent_time_ms in local_leaderboards table
ALTER TABLE local_leaderboards 
  RENAME COLUMN best_time TO spent_time_ms;

-- Update the existing indexes that reference the old column name
DROP INDEX IF EXISTS local_leaderboards_best_time_idx;
CREATE INDEX local_leaderboards_spent_time_ms_idx ON local_leaderboards(spent_time_ms);

DROP INDEX IF EXISTS local_leaderboards_puzzle_time_idx;
CREATE INDEX local_leaderboards_puzzle_time_idx ON local_leaderboards(puzzle_id, spent_time_ms);

-- Update the column type to BIGINT while we're at it (to prevent overflow)
ALTER TABLE local_leaderboards 
  ALTER COLUMN spent_time_ms TYPE BIGINT;