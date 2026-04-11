/*
  # Add user_id column to favorites table

  ## Summary
  Migrates the favorites table from session-based to user-based ownership.
  Adds a user_id column linked to auth.users, drops the old open RLS policies,
  and replaces them with policies that restrict each user to their own rows only.

  ## Changes to Existing Tables

  ### favorites
  - Add `user_id` (uuid, nullable) - references auth.users(id), on delete cascade
  - Remove old open policies (anyone can read/insert/delete)
  - Add new user-scoped policies

  ## Security
  - SELECT: authenticated users can only read their own favorites
  - INSERT: authenticated users can only insert rows where user_id = auth.uid()
  - DELETE: authenticated users can only delete their own favorites
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'favorites' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE favorites ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DROP POLICY IF EXISTS "Anyone can read favorites" ON favorites;
DROP POLICY IF EXISTS "Anyone can insert favorites" ON favorites;
DROP POLICY IF EXISTS "Anyone can delete favorites" ON favorites;

CREATE POLICY "Users can read own favorites"
  ON favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
