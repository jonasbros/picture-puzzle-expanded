-- Fix the auth user trigger to handle anonymous users properly
-- Anonymous users don't have email or username in raw_user_meta_data

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
    CASE WHEN NEW.email IS NULL THEN true ELSE false END, -- Set is_guest based on email presence
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.created_at,
    NEW.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;