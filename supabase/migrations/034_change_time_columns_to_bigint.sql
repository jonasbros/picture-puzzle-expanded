-- Change time columns from INTEGER to BIGINT to prevent overflow
-- INTEGER max: ~24.8 days, BIGINT max: ~292 million years

ALTER TABLE game_sessions 
  ALTER COLUMN time_spent_ms TYPE BIGINT;

-- Update any other time columns that might overflow
ALTER TABLE daily_stats 
  ALTER COLUMN average_time_ms TYPE BIGINT,
  ALTER COLUMN best_time_ms TYPE BIGINT,
  ALTER COLUMN total_time_ms TYPE BIGINT;

ALTER TABLE puzzle_analytics
  ALTER COLUMN average_completion_time_ms TYPE BIGINT,
  ALTER COLUMN fastest_completion_ms TYPE BIGINT,
  ALTER COLUMN slowest_completion_ms TYPE BIGINT,
  ALTER COLUMN total_time_ms TYPE BIGINT;

ALTER TABLE user_sessions
  ALTER COLUMN total_time_active_ms TYPE BIGINT,
  ALTER COLUMN total_time_idle_ms TYPE BIGINT;

ALTER TABLE user_statistics
  ALTER COLUMN average_completion_time_ms TYPE BIGINT,
  ALTER COLUMN total_time_played_ms TYPE BIGINT;