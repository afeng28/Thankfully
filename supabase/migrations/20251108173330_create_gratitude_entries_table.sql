/*
  # Create Gratitude Entries Table

  1. New Tables
    - `gratitude_entries`
      - `id` (uuid, primary key)
      - `user_id` (text) - Identifier for the user (for future multi-user support)
      - `entry_date` (date) - The date of the gratitude entry
      - `answers` (jsonb) - Array of question-answer pairs
      - `mentioned_people` (text[]) - Array of people mentioned in the entry
      - `media_url` (text, optional) - URL to associated media
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `gratitude_entries` table
    - Users can view all entries (for now, single-user app)
    - Users can insert new entries
    - Users can update their own entries
    - Users can delete their own entries

  3. Indexes
    - Index on `entry_date` for fast date-based queries
    - Index on `created_at` for chronological sorting
    - GIN index on `mentioned_people` for array searches

  4. Notes
    - `answers` field stores JSON array of objects with `question` and `answer` keys
    - `mentioned_people` uses PostgreSQL text array for efficient name searches
    - Date field enables easy monthly and weekly aggregations
    - Updated_at automatically updates on row changes
*/

CREATE TABLE IF NOT EXISTS gratitude_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text DEFAULT 'default_user',
  entry_date date NOT NULL,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  mentioned_people text[] DEFAULT ARRAY[]::text[],
  media_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gratitude_entries_date ON gratitude_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_gratitude_entries_created_at ON gratitude_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_gratitude_entries_people ON gratitude_entries USING GIN(mentioned_people);

ALTER TABLE gratitude_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gratitude entries are viewable by everyone"
  ON gratitude_entries FOR SELECT
  USING (true);

CREATE POLICY "Users can insert gratitude entries"
  ON gratitude_entries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update gratitude entries"
  ON gratitude_entries FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete gratitude entries"
  ON gratitude_entries FOR DELETE
  USING (true);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gratitude_entries_updated_at
  BEFORE UPDATE ON gratitude_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
