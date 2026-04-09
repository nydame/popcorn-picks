/*
  # Create Watchlist Table

  ## Summary
  Creates the main watchlist table for the Popcorn Picks movie watchlist app.

  ## New Tables

  ### watchlist
  Stores movies that users have added to their personal watchlist.

  | Column | Type | Description |
  |--------|------|-------------|
  | id | uuid | Primary key, auto-generated |
  | user_id | uuid | References auth.users, identifies the owner |
  | movie_id | text | TMDB movie ID |
  | title | text | Movie title |
  | poster | text | URL to movie poster image |
  | year | text | Release year |
  | overview | text | Movie overview/synopsis |
  | rating | int | User rating 1-5 stars (nullable until rated) |
  | created_at | timestamptz | When the movie was added |

  ## Security
  - RLS enabled on watchlist table
  - Users can only see, create, update, and delete their own watchlist entries
  - All policies check `auth.uid() = user_id`

  ## Notes
  1. Rating is nullable - movies can be added without a rating
  2. movie_id is stored as text to match TMDB's ID format
  3. poster stores the full URL path (relative or absolute)
*/

CREATE TABLE IF NOT EXISTS watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id text NOT NULL,
  title text NOT NULL,
  poster text DEFAULT '',
  year text DEFAULT '',
  overview text DEFAULT '',
  rating int CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own watchlist"
  ON watchlist FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into own watchlist"
  ON watchlist FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlist"
  ON watchlist FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from own watchlist"
  ON watchlist FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS watchlist_user_id_idx ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS watchlist_created_at_idx ON watchlist(created_at DESC);
