-- Create image_categories junction table
CREATE TABLE image_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE image_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view image categories" ON image_categories
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can create their own image categories" ON image_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add indexes
CREATE INDEX image_categories_image_id_idx ON image_categories(image_id);
CREATE INDEX image_categories_user_id_idx ON image_categories(user_id);
CREATE UNIQUE INDEX image_categories_image_user_unique ON image_categories(image_id, user_id);