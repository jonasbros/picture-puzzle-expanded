-- Create tournament_images junction table
CREATE TABLE tournament_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE tournament_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view tournament images" ON tournament_images
  FOR SELECT TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER tournament_images_updated_at
  BEFORE UPDATE ON tournament_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add indexes
CREATE INDEX tournament_images_image_id_idx ON tournament_images(image_id);
CREATE INDEX tournament_images_tournament_id_idx ON tournament_images(tournament_id);
CREATE UNIQUE INDEX tournament_images_image_tournament_unique ON tournament_images(image_id, tournament_id);