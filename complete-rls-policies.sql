-- Complete RLS Policies for All Operations
-- This includes SELECT, INSERT, UPDATE, DELETE for both participants and admins

-- =============================================
-- PARTICIPANTS TABLE POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Participants can view their own data" ON participants;
DROP POLICY IF EXISTS "Users can insert their own participant data" ON participants;
DROP POLICY IF EXISTS "Admins can view all participants" ON participants;
DROP POLICY IF EXISTS "Admins can update all participants" ON participants;
DROP POLICY IF EXISTS "Admins can delete participants" ON participants;

-- PARTICIPANT POLICIES
-- Allow participants to SELECT their own data
CREATE POLICY "Participants can view their own data"
  ON participants
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow authenticated users to INSERT their own data (for registration)
CREATE POLICY "Users can insert their own participant data"
  ON participants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ADMIN POLICIES (using the is_admin() helper function)
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

-- =============================================
-- TEAM_MEMBERS TABLE POLICIES
-- =============================================

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert team members for their participant" ON team_members;
DROP POLICY IF EXISTS "Participants can view their own team members" ON team_members;
DROP POLICY IF EXISTS "Admins can view all team members" ON team_members;
DROP POLICY IF EXISTS "Admins can modify team members" ON team_members;

-- Allow users to insert team members when registering
CREATE POLICY "Users can insert team members for their participant"
  ON team_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM participants
      WHERE participants.id = team_members.participant_id
      AND participants.user_id = auth.uid()
    )
  );

-- Allow participants to view their team members
CREATE POLICY "Participants can view their own team members"
  ON team_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM participants
      WHERE participants.id = team_members.participant_id
      AND participants.user_id = auth.uid()
    )
  );

-- Admin policies for team_members
CREATE POLICY "Admins can view all team members"
  ON team_members
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can modify team members"
  ON team_members
  FOR ALL
  USING (public.is_admin());

-- =============================================
-- ACTIVITY_LOGS TABLE POLICIES
-- =============================================

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all logs" ON activity_logs;

CREATE POLICY "Admins can view all logs"
  ON activity_logs
  FOR SELECT
  USING (public.is_admin());

-- =============================================
-- VERIFICATION
-- =============================================

-- List all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd as command,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies
WHERE tablename IN ('participants', 'team_members', 'activity_logs')
ORDER BY tablename, policyname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ All RLS policies updated successfully!';
  RAISE NOTICE '📋 Policies configured for:';
  RAISE NOTICE '   - Participants (SELECT own, INSERT own)';
  RAISE NOTICE '   - Admins (SELECT all, UPDATE all, DELETE all)';
  RAISE NOTICE '   - Team Members (INSERT/SELECT own, Admin ALL)';
  RAISE NOTICE '   - Activity Logs (Admin SELECT)';
END $$;
