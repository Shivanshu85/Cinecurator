-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- 1. Library table: stores movies saved by users
CREATE TABLE IF NOT EXISTS library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  imdb_id text NOT NULL,
  title text NOT NULL,
  poster text DEFAULT '',
  rating text DEFAULT 'N/A',
  year text DEFAULT '',
  genre text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, imdb_id)
);

-- Enable Row Level Security
ALTER TABLE library ENABLE ROW LEVEL SECURITY;

-- Policy: users can only access their own library
CREATE POLICY "Users access own library"
  ON library
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Seen suggestions table: tracks which top suggestions a user has seen
CREATE TABLE IF NOT EXISTS seen_suggestions (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_ids text[] DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE seen_suggestions ENABLE ROW LEVEL SECURITY;

-- Policy: users can only access their own suggestions history
CREATE POLICY "Users access own seen suggestions"
  ON seen_suggestions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_library_user_id ON library(user_id);
CREATE INDEX IF NOT EXISTS idx_library_created_at ON library(created_at DESC);
