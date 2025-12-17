-- Code & Beyond Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PARTICIPANTS TABLE
-- ============================================
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  
  -- Team Information
  team_name VARCHAR(255) NOT NULL,
  team_lead VARCHAR(255) NOT NULL,
  university VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  team_size INTEGER NOT NULL CHECK (team_size BETWEEN 1 AND 10),
  
  -- Project Details
  project_title VARCHAR(500) NOT NULL,
  project_category VARCHAR(50) NOT NULL CHECK (project_category IN ('ai', 'web', 'mobile', 'blockchain', 'iot', 'data', 'cybersecurity', 'other')),
  project_description TEXT NOT NULL,
  problem_solved TEXT NOT NULL,
  tech_stack TEXT,
  project_url TEXT,
  video_url TEXT,
  project_doc_url TEXT,
  
  -- Accommodation
  accommodation_needed BOOLEAN DEFAULT false,
  accommodation_type VARCHAR(20),
  accommodation_duration VARCHAR(50),
  special_requirements TEXT,
  
  -- Status & Review
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Indexes for performance
CREATE INDEX idx_participants_user_id ON participants(user_id);
CREATE INDEX idx_participants_status ON participants(status);
CREATE INDEX idx_participants_submitted_at ON participants(submitted_at DESC);
CREATE INDEX idx_participants_university ON participants(university);
CREATE INDEX idx_participants_status_submitted ON participants(status, submitted_at DESC);

-- ============================================
-- TEAM MEMBERS TABLE
-- ============================================
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  member_name VARCHAR(255) NOT NULL,
  member_email VARCHAR(255) NOT NULL,
  member_role VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_team_members_participant_id ON team_members(participant_id);

-- ============================================
-- ACTIVITY LOGS TABLE (Optional - for audit trail)
-- ============================================
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_participants_updated_at
  BEFORE UPDATE ON participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION
-- ============================================
-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('participants', 'team_members', 'activity_logs');

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Database schema created successfully!';
  RAISE NOTICE 'Next step: Run supabase-rls-policies.sql';
END $$;
