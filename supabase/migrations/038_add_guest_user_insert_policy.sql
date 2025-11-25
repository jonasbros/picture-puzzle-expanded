-- Add RLS policy to allow unauthenticated users to create user records

-- Allow anonymous users to create user accounts
CREATE POLICY "Anonymous users can create user accounts" ON users
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow authenticated users to create user records
CREATE POLICY "Authenticated users can create user accounts" ON users
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Add comment explaining the user creation policy
COMMENT ON POLICY "Anonymous users can create user accounts" ON users IS 
  'Allows unauthenticated users to create user accounts for registration flow';