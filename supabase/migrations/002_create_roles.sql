-- Create roles table
CREATE TABLE roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can view roles" ON roles
  FOR SELECT TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add indexes
CREATE INDEX roles_name_idx ON roles(name);

-- Insert default roles
INSERT INTO roles (name, permissions) VALUES 
  ('admin', '{"all": true}'::jsonb),
  ('moderator', '{"all": true}'::jsonb),
  ('user', '{"read": true}'::jsonb),
  ('premium_user', '{"read": true, "premium_features": true}'::jsonb);