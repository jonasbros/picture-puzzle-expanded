CREATE OR REPLACE FUNCTION get_all_leaderboard_averages(limit_count INT DEFAULT 100)
RETURNS TABLE (
  username TEXT,
  avg_spent_time_ms BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.username,
    FLOOR(AVG(ll.spent_time_ms))::BIGINT as avg_spent_time_ms
  FROM local_leaderboards ll
  JOIN users u ON ll.user_id = u.id
  GROUP BY u.username
  HAVING COUNT(*) >= 10
  ORDER BY avg_spent_time_ms ASC
  LIMIT limit_count;
END;
$$;