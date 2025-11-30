-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES subscription_tiers(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add indexes
CREATE INDEX subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX subscriptions_tier_id_idx ON subscriptions(tier_id);
CREATE UNIQUE INDEX subscriptions_user_id_unique_active ON subscriptions(user_id) 
  WHERE deleted_at IS NULL;

