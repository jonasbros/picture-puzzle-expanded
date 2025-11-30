-- Add function to safely update usernames with duplicate handling

CREATE OR REPLACE FUNCTION update_user_username(
  p_user_id UUID,
  p_new_username TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  username TEXT,
  username_duplicate INTEGER,
  message TEXT
) AS $$
DECLARE
  next_duplicate INTEGER;
  current_user_record RECORD;
BEGIN
  -- Check if user exists
  SELECT * INTO current_user_record
  FROM users
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::INTEGER, 'User not found'::TEXT;
    RETURN;
  END IF;
  
  -- If the username hasn't changed, no update needed
  IF current_user_record.username = p_new_username THEN
    RETURN QUERY SELECT 
      true, 
      current_user_record.username, 
      current_user_record.username_duplicate,
      'Username unchanged'::TEXT;
    RETURN;
  END IF;
  
  -- Get next available duplicate number for the new username
  SELECT get_next_username_duplicate(p_new_username) INTO next_duplicate;
  
  -- Update the user with new username and duplicate number
  UPDATE users 
  SET 
    username = p_new_username,
    username_duplicate = next_duplicate,
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Return success result
  RETURN QUERY SELECT 
    true, 
    p_new_username, 
    next_duplicate,
    'Username updated successfully'::TEXT;
    
EXCEPTION
  WHEN OTHERS THEN
    -- Return error result
    RETURN QUERY SELECT 
      false, 
      NULL::TEXT, 
      NULL::INTEGER, 
      ('Error updating username: ' || SQLERRM)::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policy to allow users to call this function on their own account
CREATE POLICY "Users can update their own username via function" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_user_username(UUID, TEXT) TO authenticated;