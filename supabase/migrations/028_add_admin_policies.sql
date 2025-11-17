-- Helper function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.user_has_role(role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() 
    AND r.name = role_name 
    AND ur.deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin or moderator
CREATE OR REPLACE FUNCTION public.user_is_admin_or_mod()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN user_has_role('admin') OR user_has_role('moderator');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update users table policies to allow admin/mod management
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

CREATE POLICY "Users can view own profile or admins/mods can view all" ON users
  FOR SELECT USING (auth.uid() = id OR user_is_admin_or_mod());

CREATE POLICY "Users can update own profile or admins can update all" ON users
  FOR UPDATE USING (auth.uid() = id OR user_has_role('admin'));

CREATE POLICY "Admins can insert users" ON users
  FOR INSERT WITH CHECK (user_has_role('admin'));

CREATE POLICY "Admins can delete users" ON users
  FOR DELETE USING (user_has_role('admin'));

-- Update user_roles policies for admin management
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;

CREATE POLICY "Users can view own roles or admins can view all" ON user_roles
  FOR SELECT USING (auth.uid() = user_id OR user_is_admin_or_mod());

CREATE POLICY "Admins can manage user roles" ON user_roles
  FOR ALL USING (user_has_role('admin'));

-- Update roles policies
DROP POLICY IF EXISTS "Authenticated users can view roles" ON roles;

CREATE POLICY "Authenticated users can view roles" ON roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage roles" ON roles
  FOR ALL USING (user_has_role('admin'));