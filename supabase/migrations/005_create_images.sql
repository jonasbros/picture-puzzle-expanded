-- Create puzzles table
CREATE TABLE puzzles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  attribution JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE puzzles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can view puzzles" ON puzzles
  FOR SELECT TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER puzzles_updated_at
  BEFORE UPDATE ON puzzles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add indexes
CREATE INDEX puzzles_title_idx ON puzzles(title);
CREATE INDEX puzzles_created_at_idx ON puzzles(created_at);

-- Now add foreign key constraint to categories table
ALTER TABLE categories
  ADD CONSTRAINT categories_puzzle_id_fkey
  FOREIGN KEY (puzzle_id) REFERENCES puzzles(id) ON DELETE CASCADE;