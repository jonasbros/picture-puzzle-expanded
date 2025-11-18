-- Insert puzzle categories using actual puzzle IDs
INSERT INTO categories (name, puzzle_id) 
SELECT 
  category_name,
  p.id
FROM (
  VALUES 
    ('Animals'),
    ('Nature'), 
    ('Architecture'),
    ('Abstract'),
    ('Art'),
    ('Food'),
    ('Sports'),
    ('Cities')
) AS cats(category_name)
CROSS JOIN (SELECT id FROM puzzles LIMIT 1) p;