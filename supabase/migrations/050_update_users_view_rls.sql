-- Enable RLS (idempotent safety)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read user public fields (for leaderboards)
CREATE POLICY "Anyone can view users for leaderboards"
ON public.users
FOR SELECT
TO anon, authenticated
USING (true);