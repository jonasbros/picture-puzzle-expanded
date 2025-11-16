-- Create image_categories junction table
CREATE TABLE image_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE image_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view image categories" ON image_categories
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create image categories" ON image_categories
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Add indexes
CREATE INDEX image_categories_image_id_idx ON image_categories(image_id);
CREATE INDEX image_categories_category_id_idx ON image_categories(category_id);
CREATE UNIQUE INDEX image_categories_image_category_unique ON image_categories(image_id, category_id);