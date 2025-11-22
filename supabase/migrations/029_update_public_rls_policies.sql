-- Update RLS policies to allow public read access for key tables

-- Puzzles - Allow public read access
DROP POLICY IF EXISTS "Authenticated users can view puzzles" ON puzzles;
CREATE POLICY "Public can view active puzzles" ON puzzles
  FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

-- Categories - Allow public read access  
DROP POLICY IF EXISTS "Authenticated users can view categories" ON categories;
CREATE POLICY "Public can view active categories" ON categories
  FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

-- Daily Puzzles - Allow public read access
DROP POLICY IF EXISTS "Authenticated users can view daily puzzles" ON daily_puzzles;
CREATE POLICY "Public can view daily puzzles" ON daily_puzzles
  FOR SELECT TO anon, authenticated
  USING (true);

-- Subscription Tiers - Allow public read access
DROP POLICY IF EXISTS "Authenticated users can view subscription tiers" ON subscription_tiers;
CREATE POLICY "Public can view subscription tiers" ON subscription_tiers
  FOR SELECT TO anon, authenticated
  USING (true);

-- Puzzle Analytics - Allow public read access (general stats only)
DROP POLICY IF EXISTS "Authenticated users can view puzzle analytics" ON puzzle_analytics;
CREATE POLICY "Public can view puzzle analytics" ON puzzle_analytics
  FOR SELECT TO anon, authenticated
  USING (true);

-- Tournaments - Allow public read access
DROP POLICY IF EXISTS "Anyone can view open tournaments" ON tournaments;
CREATE POLICY "Public can view open tournaments" ON tournaments
  FOR SELECT TO anon, authenticated
  USING (is_open = true AND deleted_at IS NULL);

-- Leaderboards - Allow public read access
DROP POLICY IF EXISTS "Authenticated users can view leaderboards" ON leaderboards;
CREATE POLICY "Public can view leaderboards" ON leaderboards
  FOR SELECT TO anon, authenticated
  USING (true);

-- Local Leaderboards - Allow public read access
DROP POLICY IF EXISTS "Authenticated users can view local leaderboards" ON local_leaderboards;
CREATE POLICY "Public can view local leaderboards" ON local_leaderboards
  FOR SELECT TO anon, authenticated
  USING (true);