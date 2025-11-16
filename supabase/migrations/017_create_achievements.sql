-- Create achievements table
CREATE TABLE achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  requirements JSONB NOT NULL,
  points INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT false,
  category TEXT NOT NULL DEFAULT 'general', -- general, speed, streak, tournament, social
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create user_achievements table
CREATE TABLE user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  progress JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for achievements (readable by all authenticated users)
CREATE POLICY "Authenticated users can view achievements" ON achievements
  FOR SELECT TO authenticated
  USING (NOT is_hidden OR EXISTS (
    SELECT 1 FROM user_achievements 
    WHERE user_achievements.achievement_id = achievements.id 
    AND user_achievements.user_id = auth.uid()
  ));

-- Create RLS policies for user_achievements
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own achievements" ON user_achievements
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Add unique constraint to prevent duplicate achievements
ALTER TABLE user_achievements ADD CONSTRAINT user_achievements_unique UNIQUE (user_id, achievement_id);

-- Add indexes
CREATE INDEX achievements_category_idx ON achievements(category);
CREATE INDEX achievements_points_idx ON achievements(points DESC);
CREATE INDEX user_achievements_user_id_idx ON user_achievements(user_id);
CREATE INDEX user_achievements_earned_at_idx ON user_achievements(earned_at);
CREATE INDEX user_achievements_achievement_id_idx ON user_achievements(achievement_id);

-- Insert some example achievements
INSERT INTO achievements (name, description, requirements, points, category) VALUES
  ('First Puzzle', 'Complete your first puzzle', '{"puzzles_completed": 1}', 10, 'general'),
  ('Speed Demon', 'Complete a puzzle in under 30 seconds', '{"completion_time_ms": 30000}', 50, 'speed'),
  ('Perfect Week', 'Complete daily puzzles for 7 days in a row', '{"daily_streak": 7}', 100, 'streak'),
  ('Tournament Winner', 'Win your first tournament', '{"tournaments_won": 1}', 200, 'tournament'),
  ('Puzzle Master', 'Complete 100 puzzles', '{"puzzles_completed": 100}', 500, 'general');