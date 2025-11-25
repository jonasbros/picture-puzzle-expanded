-- Make email field optional in users table to support guest users without email addresses

-- Remove NOT NULL constraint from email column
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Add comment explaining the change
COMMENT ON COLUMN users.email IS 'User email address - optional for guest users, required for authenticated users';

-- Update RLS policies if needed (email-based policies should handle null emails gracefully)
-- Note: Existing RLS policies should be reviewed to ensure they handle null emails appropriately