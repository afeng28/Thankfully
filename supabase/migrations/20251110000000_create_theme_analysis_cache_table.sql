/*
  # Create Theme Analysis Cache Table

  1. New Tables
    - `theme_analysis_cache`
      - `id` (uuid, primary key)
      - `cache_key` (text, unique) - Cache key for user
      - `data` (jsonb) - Cached analysis result
      - `created_at` (timestamptz) - When cache was created

  2. Security
    - Enable RLS on `theme_analysis_cache` table
    - Users can view all cache entries (for now, single-user app)
    - Users can insert new cache entries
    - Users can delete cache entries

  3. Indexes
    - Index on `cache_key` for fast lookups
    - Index on `created_at` for cleanup operations
*/

CREATE TABLE IF NOT EXISTS theme_analysis_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text NOT NULL UNIQUE,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_theme_analysis_cache_key ON theme_analysis_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_theme_analysis_cache_created_at ON theme_analysis_cache(created_at);

ALTER TABLE theme_analysis_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Theme analysis cache is viewable by everyone"
  ON theme_analysis_cache FOR SELECT
  USING (true);

CREATE POLICY "Users can insert theme analysis cache"
  ON theme_analysis_cache FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete theme analysis cache"
  ON theme_analysis_cache FOR DELETE
  USING (true);


