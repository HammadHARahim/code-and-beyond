-- Migration: Add email column to participants table
-- Run this in Supabase SQL Editor

-- Add the email column
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- For existing records, you could optionally populate emails from auth.users
-- This is a one-time data migration (uncomment if you have existing data)
/*
UPDATE participants p
SET email = u.email
FROM auth.users u
WHERE p.user_id = u.id;
*/

-- Make email NOT NULL after populating existing data (if any)
-- ALTER TABLE participants ALTER COLUMN email SET NOT NULL;

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);

-- Verify
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'participants' 
AND column_name = 'email';
