-- Performance indexes for game sessions
CREATE INDEX game_sessions_user_created_idx ON game_sessions(user_id, created_at);
CREATE INDEX game_sessions_puzzle_time_idx ON game_sessions(puzzle_id, time_remaining_ms);
CREATE INDEX game_sessions_finished_mmr_idx ON game_sessions(is_finished, mmr_change);
CREATE INDEX game_sessions_completion_idx ON game_sessions(completion_percentage DESC);
CREATE INDEX game_sessions_difficulty_idx ON game_sessions(difficulty);

-- Performance indexes for tournaments
CREATE INDEX tournaments_status_date_idx ON tournaments(is_open, created_at);
CREATE INDEX tournament_participants_tournament_mmr_idx ON tournament_participants(tournament_id, total_mmr_gained);
CREATE INDEX tournament_participants_user_idx ON tournament_participants(user_id);

-- Performance indexes for leaderboards
CREATE INDEX local_leaderboards_puzzle_time_idx ON local_leaderboards(puzzle_id, best_time);
CREATE INDEX leaderboards_mmr_created_idx ON leaderboards(mmr DESC, created_at);
CREATE INDEX leaderboards_user_mmr_idx ON leaderboards(user_id, mmr DESC);

-- Performance indexes for puzzles and categories
CREATE INDEX puzzles_deleted_at_idx ON puzzles(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX puzzle_categories_puzzle_idx ON puzzle_categories(puzzle_id);
CREATE INDEX puzzle_categories_category_idx ON puzzle_categories(category_id);

-- Performance indexes for daily puzzles
CREATE INDEX daily_puzzles_date_desc_idx ON daily_puzzles(puzzle_date DESC);

-- Performance indexes for subscriptions
CREATE INDEX subscriptions_user_active_idx ON subscriptions(user_id, is_active);
CREATE INDEX subscriptions_expires_idx ON subscriptions(expires_at) WHERE expires_at IS NOT NULL;

-- Performance indexes for user roles
CREATE INDEX user_roles_user_idx ON user_roles(user_id);
CREATE INDEX user_roles_role_idx ON user_roles(role_id);