-- Disable RLS on game_sessions table to allow unauthenticated users to create game sessions

-- Drop all existing policies on game_sessions table
DROP POLICY IF EXISTS "Users can view their own game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Users can create their own game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Users can update their own game sessions" ON game_sessions;

-- Disable RLS to allow unauthenticated user access
ALTER TABLE game_sessions DISABLE ROW LEVEL SECURITY;

-- Add comment explaining the temporary fix
COMMENT ON TABLE game_sessions IS 'RLS temporarily disabled to allow unauthenticated users to create game sessions';