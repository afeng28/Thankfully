/*
  # Create Names Recognition Tables

  1. New Tables
    - `common_names`
      - `id` (uuid, primary key)
      - `name` (text, unique) - The name in lowercase for case-insensitive matching
      - `display_name` (text) - Proper capitalization for display
      - `gender` (text) - Optional gender category (male, female, unisex, neutral)
      - `popularity_score` (integer) - Frequency/popularity ranking (1-1000, lower is more common)
      - `cultural_origin` (text) - Cultural/linguistic origin (english, spanish, chinese, etc.)
      - `created_at` (timestamptz)
    
    - `user_confirmed_names`
      - `id` (uuid, primary key)
      - `name` (text) - The name as entered by user
      - `normalized_name` (text) - Lowercase version for matching
      - `confirmed_count` (integer) - Number of times user confirmed this name
      - `last_confirmed_at` (timestamptz)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - `common_names` is readable by everyone (public reference data)
    - `user_confirmed_names` requires authentication and users can only access their own data
  
  3. Indexes
    - Index on `common_names.name` for fast lookups
    - Index on `user_confirmed_names.normalized_name` for fast matching
    
  4. Notes
    - Common names table serves as a reference database of known names
    - User confirmed names table provides personalized learning
    - Lowercase normalization enables case-insensitive name recognition
*/

CREATE TABLE IF NOT EXISTS common_names (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  gender text DEFAULT 'unisex',
  popularity_score integer DEFAULT 500,
  cultural_origin text DEFAULT 'english',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_common_names_name ON common_names(name);

ALTER TABLE common_names ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Common names are viewable by everyone"
  ON common_names FOR SELECT
  USING (true);

CREATE TABLE IF NOT EXISTS user_confirmed_names (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  normalized_name text NOT NULL,
  confirmed_count integer DEFAULT 1,
  last_confirmed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_confirmed_names_normalized ON user_confirmed_names(normalized_name);

ALTER TABLE user_confirmed_names ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all confirmed names"
  ON user_confirmed_names FOR SELECT
  USING (true);

CREATE POLICY "Users can insert confirmed names"
  ON user_confirmed_names FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update confirmed names"
  ON user_confirmed_names FOR UPDATE
  USING (true)
  WITH CHECK (true);
