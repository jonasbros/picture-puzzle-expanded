-- Create images table
CREATE TABLE images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  attribution JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can view images" ON images
  FOR SELECT TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER images_updated_at
  BEFORE UPDATE ON images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add indexes
CREATE INDEX images_title_idx ON images(title);
CREATE INDEX images_created_at_idx ON images(created_at);

-- Now add foreign key constraint to categories table
ALTER TABLE categories
  ADD CONSTRAINT categories_image_id_fkey
  FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE;