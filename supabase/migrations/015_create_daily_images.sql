-- Create daily_images table
CREATE TABLE daily_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_id UUID NOT NULL REFERENCES images(id),
  image_date DATE NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE daily_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can view daily images" ON daily_images
  FOR SELECT TO authenticated
  USING (true);

-- Add indexes
CREATE INDEX daily_images_image_date_idx ON daily_images(image_date);
CREATE INDEX daily_images_image_id_idx ON daily_images(image_id);