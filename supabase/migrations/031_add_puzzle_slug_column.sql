-- Add slug column to puzzles table
ALTER TABLE puzzles 
ADD COLUMN slug TEXT;

-- Create function to generate slug from title and id
CREATE OR REPLACE FUNCTION generate_puzzle_slug(title TEXT, id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Convert title to lowercase, replace spaces and special chars with hyphens
  base_slug := lower(regexp_replace(trim(title), '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  -- If base_slug is empty, use 'puzzle'
  IF base_slug = '' THEN
    base_slug := 'puzzle';
  END IF;
  
  -- Append first 8 chars of UUID to ensure uniqueness
  final_slug := base_slug || '-' || substring(id::text, 1, 8);
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-populate slug
CREATE OR REPLACE FUNCTION set_puzzle_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_puzzle_slug(NEW.title, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-populate slug on insert and update
CREATE TRIGGER puzzle_slug_trigger
  BEFORE INSERT OR UPDATE ON puzzles
  FOR EACH ROW
  EXECUTE FUNCTION set_puzzle_slug();

-- Populate existing records with slugs
UPDATE puzzles 
SET slug = generate_puzzle_slug(title, id)
WHERE slug IS NULL;

-- Make slug column NOT NULL and UNIQUE after populating existing records
ALTER TABLE puzzles 
ALTER COLUMN slug SET NOT NULL;

ALTER TABLE puzzles 
ADD CONSTRAINT puzzles_slug_unique UNIQUE (slug);

-- Add index on slug for performance
CREATE INDEX puzzles_slug_idx ON puzzles(slug);