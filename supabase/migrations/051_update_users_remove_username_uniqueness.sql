-- Migration: Remove username uniqueness constraint but keep duplicate counter
-- This allows the same username+duplicate combination to exist multiple times

-- Drop the unique constraint on (username, username_duplicate)
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_username_duplicate_unique;

-- Update the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
  v_duplicate_num INTEGER;
BEGIN
  -- Generate username
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    CASE WHEN NEW.email IS NOT NULL 
      THEN split_part(NEW.email, '@', 1)
      ELSE 'Guest_' || substring(NEW.id::text, 1, 8)
    END
  );
  
  -- Get next duplicate number for this username (THIS WAS BROKEN)
  SELECT COALESCE(MAX(username_duplicate), 0) + 1
  INTO v_duplicate_num
  FROM public.users
  WHERE username = v_username;
  
  -- Insert with the correct duplicate number
  INSERT INTO public.users (id, email, username, username_duplicate, is_guest, avatar, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    v_username,
    v_duplicate_num,
    CASE WHEN NEW.email IS NULL THEN true ELSE false END,
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.created_at,
    NEW.created_at
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON COLUMN users.username IS 'Username - can have duplicates, use username_duplicate to distinguish';
COMMENT ON COLUMN users.username_duplicate IS 'Counter for duplicate usernames - increments for each duplicate';
