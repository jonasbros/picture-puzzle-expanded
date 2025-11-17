-- Create puzzle_categories junction table
CREATE TABLE puzzle_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  puzzle_id UUID NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE puzzle_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view puzzle categories" ON puzzle_categories
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create puzzle categories" ON puzzle_categories
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Add indexes
CREATE INDEX puzzle_categories_puzzle_id_idx ON puzzle_categories(puzzle_id);
CREATE INDEX puzzle_categories_category_id_idx ON puzzle_categories(category_id);
CREATE UNIQUE INDEX puzzle_categories_puzzle_category_unique ON puzzle_categories(puzzle_id, category_id);