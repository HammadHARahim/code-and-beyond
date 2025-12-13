-- Fix RLS Policies for Admin Access
-- Run this to fix the "permission denied for table users" error

-- First, create a helper function with SECURITY DEFINER
-- This allows checking user metadata without direct access to auth.users
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()),
    ''
  ) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing admin policies
DROP POLICY IF EXISTS "Admins can view all participants" ON participants;
DROP POLICY IF EXISTS "Admins can update all participants" ON participants;
DROP POLICY IF EXISTS "Admins can delete participants" ON participants;
DROP POLICY IF EXISTS "Admins can view all team members" ON team_members;
DROP POLICY IF EXISTS "Admins can modify team members" ON team_members;
DROP POLICY IF EXISTS "Admins can view all logs" ON activity_logs;

-- Re-create admin policies using the helper function
CREATE POLICY "Admins can view all participants"
  ON participants
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all participants"
  ON participants
  FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete participants"
  ON participants
  FOR DELETE
  USING (public.is_admin());

CREATE POLICY "Admins can view all team members"
  ON team_members
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can modify team members"
  ON team_members
  FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins can view all logs"
  ON activity_logs
  FOR SELECT
  USING (public.is_admin());

-- Verify the function works
SELECT public.is_admin();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'RLS policies updated successfully!';
  RAISE NOTICE 'Admin policies now use the is_admin() function';
END $$;
