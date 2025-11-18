-- Insert additional role permissions (roles already exist from migration)
UPDATE roles SET permissions = '{"can_manage_users": true, "can_delete_content": true, "can_access_admin_panel": true}' WHERE name = 'admin';
UPDATE roles SET permissions = '{"can_moderate_content": true, "can_manage_reports": true}' WHERE name = 'moderator';
UPDATE roles SET permissions = '{"premium_puzzles": true, "priority_support": true}' WHERE name = 'premium_user';
UPDATE roles SET permissions = '{"basic_access": true}' WHERE name = 'user';