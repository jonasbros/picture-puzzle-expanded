-- Create categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_id UUID NOT NULL, -- Note: Will be referenced later when images table is created
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can view categories" ON categories
  FOR SELECT TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add indexes
CREATE INDEX categories_name_idx ON categories(name);
CREATE INDEX categories_image_id_idx ON categories(image_id);