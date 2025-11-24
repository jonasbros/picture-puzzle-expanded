-- Add is_guest and username_duplicate columns to users table
ALTER TABLE users 
  ADD COLUMN is_guest BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN username_duplicate INTEGER DEFAULT 1 NOT NULL;

-- Create index for guest users
CREATE INDEX users_is_guest_idx ON users(is_guest);

-- Create index for username duplicate lookups
CREATE INDEX users_username_duplicate_idx ON users(username, username_duplicate);

-- Create unique constraint for username + username_duplicate combination
-- This ensures each username#number combination is unique
ALTER TABLE users 
  ADD CONSTRAINT users_username_duplicate_unique UNIQUE (username, username_duplicate);

-- Remove the old unique constraint on username only since we now allow duplicates with different numbers
-- PostgreSQL auto-generated the constraint name, so we need to find it first
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    SELECT con.conname INTO constraint_name
    FROM pg_constraint con
    INNER JOIN pg_class rel ON rel.oid = con.conrelid
    INNER JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY(con.conkey)
    WHERE rel.relname = 'users' AND att.attname = 'username' AND con.contype = 'u';
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE users DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;

-- Add comment explaining the username_duplicate field
COMMENT ON COLUMN users.username_duplicate IS 'Number suffix for duplicate usernames, displayed as username#0001';
COMMENT ON COLUMN users.is_guest IS 'Whether this user is a guest user (not fully registered)';

-- Create a function to get the next available username_duplicate number
CREATE OR REPLACE FUNCTION get_next_username_duplicate(p_username TEXT)
RETURNS INTEGER AS $$
DECLARE
  next_duplicate INTEGER;
BEGIN
  SELECT COALESCE(MAX(username_duplicate), 0) + 1
  INTO next_duplicate
  FROM users
  WHERE username = p_username;
  
  RETURN next_duplicate;
END;
$$ LANGUAGE plpgsql;