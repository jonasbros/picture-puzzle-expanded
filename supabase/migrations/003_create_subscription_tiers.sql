-- Create subscription_tiers table
CREATE TABLE subscription_tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  price TEXT NOT NULL, -- Using TEXT to handle various pricing formats
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view subscription tiers" ON subscription_tiers
  FOR SELECT TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER subscription_tiers_updated_at
  BEFORE UPDATE ON subscription_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add indexes
CREATE INDEX subscription_tiers_name_idx ON subscription_tiers(name);

-- Insert default subscription tiers
INSERT INTO subscription_tiers (name, price) VALUES 
  ('free', '0'),
  ('basic', '9.99'),
  ('premium', '19.99'),
  ('pro', '29.99');