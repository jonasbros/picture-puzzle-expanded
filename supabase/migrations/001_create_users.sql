-- Create users table with support for both authenticated and guest users
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT, -- Nullable for guest users
  username TEXT NOT NULL,
  username_duplicate INTEGER DEFAULT 1 NOT NULL,
  is_guest BOOLEAN DEFAULT false NOT NULL,
  avatar TEXT,
  preferences JSONB DEFAULT '{}',
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Create unique constraint for username + duplicate combination
ALTER TABLE users 
ADD CONSTRAINT users_username_duplicate_unique UNIQUE (username, username_duplicate);

-- Create unique constraint for email (only when not null)
CREATE UNIQUE INDEX users_email_unique ON users(email) WHERE email IS NOT NULL;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users (including anonymous)
CREATE POLICY "Anonymous users can insert new users" ON users
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert their own profile" ON users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Helper function to get next username duplicate number
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

-- Function to handle new user signup from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, is_guest, avatar, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      CASE WHEN NEW.email IS NOT NULL 
        THEN split_part(NEW.email, '@', 1)
        ELSE 'Guest_' || substring(NEW.id::text, 1, 8)
      END
    ),
    CASE WHEN NEW.email IS NULL THEN true ELSE false END,
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.created_at,
    NEW.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile when auth user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add indexes
CREATE INDEX users_email_idx ON users(email) WHERE email IS NOT NULL;
CREATE INDEX users_username_idx ON users(username);
CREATE INDEX users_username_duplicate_idx ON users(username, username_duplicate);
CREATE INDEX users_is_guest_idx ON users(is_guest);
CREATE INDEX users_created_at_idx ON users(created_at);