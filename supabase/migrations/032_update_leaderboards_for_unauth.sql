-- Update leaderboards to support unauthenticated users
-- Make user_id nullable and add name field for guest users

-- Add name field for unauthenticated users
ALTER TABLE leaderboards 
ADD COLUMN name TEXT;

-- Make user_id nullable to allow guest entries
ALTER TABLE leaderboards 
ALTER COLUMN user_id DROP NOT NULL;

-- Add constraint to ensure either user_id or name is provided
ALTER TABLE leaderboards 
ADD CONSTRAINT leaderboards_user_or_name_check 
CHECK (
  (user_id IS NOT NULL AND name IS NULL) OR 
  (user_id IS NULL AND name IS NOT NULL)
);

-- Add length constraint for guest names (like arcade games)
ALTER TABLE leaderboards 
ADD CONSTRAINT leaderboards_name_length_check 
CHECK (name IS NULL OR (length(trim(name)) >= 1 AND length(trim(name)) <= 20));

-- Update local_leaderboards to support unauthenticated users
ALTER TABLE local_leaderboards 
ADD COLUMN name TEXT;

ALTER TABLE local_leaderboards 
ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE local_leaderboards 
ADD CONSTRAINT local_leaderboards_user_or_name_check 
CHECK (
  (user_id IS NOT NULL AND name IS NULL) OR 
  (user_id IS NULL AND name IS NOT NULL)
);

ALTER TABLE local_leaderboards 
ADD CONSTRAINT local_leaderboards_name_length_check 
CHECK (name IS NULL OR (length(trim(name)) >= 1 AND length(trim(name)) <= 20));

-- Update unique constraint for local leaderboards to handle both auth and unauth users
DROP INDEX local_leaderboards_user_puzzle_unique;

-- Create new unique constraint that handles both authenticated and guest users
-- For authenticated users: unique by user_id and puzzle_id
-- For guest users: allow multiple entries (they can compete with different names)
CREATE UNIQUE INDEX local_leaderboards_user_puzzle_unique 
ON local_leaderboards(user_id, puzzle_id) 
WHERE user_id IS NOT NULL;

-- Update RLS policies to allow public access for reading leaderboards
DROP POLICY "Anyone can view leaderboards" ON leaderboards;
DROP POLICY "Anyone can view local leaderboards" ON local_leaderboards;

CREATE POLICY "Anyone can view leaderboards" ON leaderboards
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Anyone can view local leaderboards" ON local_leaderboards
  FOR SELECT TO public  
  USING (true);

-- Allow unauthenticated users to insert leaderboard entries with names
CREATE POLICY "Guest users can insert leaderboard entries with names" ON leaderboards
  FOR INSERT TO public
  WITH CHECK (user_id IS NULL AND name IS NOT NULL);

CREATE POLICY "Guest users can insert local leaderboard entries with names" ON local_leaderboards
  FOR INSERT TO public
  WITH CHECK (user_id IS NULL AND name IS NOT NULL);

-- Keep existing policies for authenticated users
CREATE POLICY "Authenticated users can insert their own leaderboard entries" ON leaderboards
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND name IS NULL);

CREATE POLICY "Authenticated users can insert their own local leaderboard entries" ON local_leaderboards
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND name IS NULL);

-- Update policies for updates (only authenticated users can update their entries)
DROP POLICY "Users can update their own leaderboard entries" ON leaderboards;
DROP POLICY "Users can update their own local leaderboard entries" ON local_leaderboards;

CREATE POLICY "Authenticated users can update their own leaderboard entries" ON leaderboards
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND name IS NULL);

CREATE POLICY "Authenticated users can update their own local leaderboard entries" ON local_leaderboards
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND name IS NULL);

-- Add indexes for name-based queries
CREATE INDEX leaderboards_name_idx ON leaderboards(name) WHERE name IS NOT NULL;
CREATE INDEX local_leaderboards_name_idx ON local_leaderboards(name) WHERE name IS NOT NULL;