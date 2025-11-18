-- Link puzzles to categories using puzzle_categories junction table
INSERT INTO puzzle_categories (puzzle_id, category_id)
SELECT p.id, c.id
FROM puzzles p, categories c
WHERE 
  (p.title = 'Golden Retriever Puppy' AND c.name = 'Animals') OR
  (p.title = 'Mountain Landscape' AND c.name = 'Nature') OR
  (p.title = 'Eiffel Tower at Night' AND c.name = 'Architecture') OR
  (p.title = 'Abstract Rainbow' AND c.name = 'Abstract');