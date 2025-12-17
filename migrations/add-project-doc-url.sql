-- Migration: Add project_doc_url column to participants table
-- Run this in Supabase SQL Editor to update your existing database

-- Add the new column for project document URLs
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS project_doc_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN participants.project_doc_url IS 'URL to project documentation (Google Drive, Dropbox, OneDrive, etc.)';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'participants' 
AND column_name = 'project_doc_url';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: project_doc_url column added to participants table';
END $$;
