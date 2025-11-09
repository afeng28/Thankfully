/*
  # Fix shared thanks table for non-authenticated use

  1. Changes
    - Make user_id nullable and remove foreign key constraint
    - Update RLS policies to allow unauthenticated users to create shared thanks

  2. Security
    - Allow anyone to create shared thanks (single-user app)
    - Anyone can view shared thanks via link
*/

-- Drop the existing foreign key constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'shared_thanks_user_id_fkey'
    AND table_name = 'shared_thanks'
  ) THEN
    ALTER TABLE shared_thanks DROP CONSTRAINT shared_thanks_user_id_fkey;
  END IF;
END $$;

-- Make user_id nullable
ALTER TABLE shared_thanks ALTER COLUMN user_id DROP NOT NULL;

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Authenticated users can create shared thanks" ON shared_thanks;

-- Create new policy that allows anyone to create shared thanks
CREATE POLICY "Anyone can create shared thanks"
  ON shared_thanks FOR INSERT
  WITH CHECK (true);