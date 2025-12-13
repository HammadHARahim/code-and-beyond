-- Row Level Security Policies
-- Run this AFTER creating the schema

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PARTICIPANTS TABLE POLICIES
-- ============================================

-- Policy 1: Anyone can insert (register)
CREATE POLICY "Anyone can create participant registration"
  ON participants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 2: Users can view their own data
CREATE POLICY "Users can view their own participant data"
  ON participants
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 3: Users can update their own data (if status is pending)
CREATE POLICY "Users can update their own pending data"
  ON participants
  FOR UPDATE
  USING (
    auth.uid() = user_id 
    AND status = 'pending'
  );

-- Policy 4: Admins can view all participants
CREATE POLICY "Admins can view all participants"
  ON participants
  FOR SELECT
  USING (
    (SELECT raw_user_meta_data->>'role' 
     FROM auth.users 
     WHERE id = auth.uid()) = 'admin'
  );

-- Policy 5: Admins can update any participant
CREATE POLICY "Admins can update all participants"
  ON participants
  FOR UPDATE
  USING (
    (SELECT raw_user_meta_data->>'role' 
     FROM auth.users 
     WHERE id = auth.uid()) = 'admin'
  );

-- Policy 6: Admins can delete participants
CREATE POLICY "Admins can delete participants"
  ON participants
  FOR DELETE
  USING (
    (SELECT raw_user_meta_data->>'role' 
     FROM auth.users 
     WHERE id = auth.uid()) = 'admin'
  );

-- ============================================
-- TEAM MEMBERS TABLE POLICIES
-- ============================================

-- Policy 1: Users can insert team members for their own participant record
CREATE POLICY "Users can add team members to their registration"
  ON team_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM participants
      WHERE participants.id = team_members.participant_id
      AND participants.user_id = auth.uid()
    )
  );

-- Policy 2: Users can view their own team members
CREATE POLICY "Users can view their team members"
  ON team_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM participants
      WHERE participants.id = team_members.participant_id
      AND participants.user_id = auth.uid()
    )
  );

-- Policy 3: Admins can view all team members
CREATE POLICY "Admins can view all team members"
  ON team_members
  FOR SELECT
  USING (
    (SELECT raw_user_meta_data->>'role' 
     FROM auth.users 
     WHERE id = auth.uid()) = 'admin'
  );

-- Policy 4: Admins can update/delete team members
CREATE POLICY "Admins can modify team members"
  ON team_members
  FOR ALL
  USING (
    (SELECT raw_user_meta_data->>'role' 
     FROM auth.users 
     WHERE id = auth.uid()) = 'admin'
  );

-- ============================================
-- ACTIVITY LOGS POLICIES
-- ============================================

-- Policy 1: Users can create their own activity logs
CREATE POLICY "Users can create activity logs"
  ON activity_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 2: Users can view their own logs
CREATE POLICY "Users can view their own logs"
  ON activity_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 3: Admins can view all logs
CREATE POLICY "Admins can view all logs"
  ON activity_logs
  FOR SELECT
  USING (
    (SELECT raw_user_meta_data->>'role' 
     FROM auth.users 
     WHERE id = auth.uid()) = 'admin'
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT raw_user_meta_data->>'role' 
    FROM auth.users 
    WHERE id = auth.uid()
  ) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICATION
-- ============================================
-- List all policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Row Level Security policies created successfully!';
  RAISE NOTICE 'Next step: Create admin user in Authentication > Users';
END $$;
