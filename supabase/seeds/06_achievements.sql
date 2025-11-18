-- Insert additional achievements (avoiding duplicates from migration)
INSERT INTO achievements (name, description, requirements, points, category) VALUES
('Puzzle Enthusiast', 'Complete 10 puzzles', '{"puzzles_completed": 10}', 50, 'general'),
('Lightning Fast', 'Complete a puzzle in under 10 seconds', '{"completion_time_ms": 10000}', 100, 'speed'),
('Daily Grind', 'Complete puzzles for 7 consecutive days', '{"daily_streak": 7}', 150, 'streak'),
('Monthly Champion', 'Complete puzzles for 30 consecutive days', '{"daily_streak": 30}', 500, 'streak'),
('Social Butterfly', 'Complete 5 puzzles with friends', '{"friend_puzzles": 5}', 75, 'social');