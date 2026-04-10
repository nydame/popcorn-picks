/*
  # Create favorites table

  ## Summary
  Creates a public favorites table for storing movies without requiring authentication.
  This supports the hackathon MVP where no login is required.

  ## New Tables
  - `favorites`
    - `id` (uuid, primary key, auto-generated)
    - `movie_id` (text, not null) - TMDB movie ID
    - `title` (text, not null) - Movie title
    - `poster` (text) - Poster image path from TMDB
    - `year` (text) - Release year
    - `overview` (text) - Movie description
    - `created_at` (timestamptz) - When added to favorites

  ## Security
  - RLS enabled
  - Public read/insert/delete allowed (no auth for MVP)
    Note: session_id column is used to scope favorites per browser session
*/

CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL DEFAULT '',
  movie_id text NOT NULL,
  title text NOT NULL,
  poster text DEFAULT '',
  year text DEFAULT '',
  overview text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read favorites"
  ON favorites
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert favorites"
  ON favorites
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can delete favorites"
  ON favorites
  FOR DELETE
  TO anon, authenticated
  USING (true);
