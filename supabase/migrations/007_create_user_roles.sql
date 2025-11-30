-- Create user_roles junction table
CREATE TABLE user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add indexes
CREATE INDEX user_roles_user_id_idx ON user_roles(user_id);
CREATE INDEX user_roles_role_id_idx ON user_roles(role_id);
CREATE UNIQUE INDEX user_roles_user_role_unique ON user_roles(user_id, role_id) 
  WHERE deleted_at IS NULL;