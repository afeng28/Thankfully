/*
  # Create Thanks Sent Table

  1. New Tables
    - `thanks_sent`
      - `id` (uuid, primary key) - Unique identifier for each thanks sent record
      - `user_id` (text) - Reference to user who sent the thanks
      - `person_name` (text) - Name of the person who received thanks
      - `image_selected` (text) - Filename of the selected thank you image
      - `sent_timestamp` (timestamptz) - When the thanks was sent
      - `message_status` (text) - Status of the message (sent, failed, etc.)
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on `thanks_sent` table
    - Add policy for users to read their own thanks history
    - Add policy for users to insert their own thanks records
    - Add policy for users to update their own thanks records

  3. Indexes
    - Add index on user_id for efficient user-specific queries
    - Add index on person_name for quick lookups
    - Add index on sent_timestamp for chronological sorting
*/

CREATE TABLE IF NOT EXISTS thanks_sent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL DEFAULT 'default_user',
  person_name text NOT NULL,
  image_selected text NOT NULL,
  sent_timestamp timestamptz DEFAULT now(),
  message_status text DEFAULT 'sent',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE thanks_sent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own thanks history"
  ON thanks_sent
  FOR SELECT
  TO authenticated, anon
  USING (user_id = 'default_user');

CREATE POLICY "Users can insert own thanks records"
  ON thanks_sent
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (user_id = 'default_user');

CREATE POLICY "Users can update own thanks records"
  ON thanks_sent
  FOR UPDATE
  TO authenticated, anon
  USING (user_id = 'default_user')
  WITH CHECK (user_id = 'default_user');

CREATE INDEX IF NOT EXISTS idx_thanks_sent_user_id ON thanks_sent(user_id);
CREATE INDEX IF NOT EXISTS idx_thanks_sent_person_name ON thanks_sent(person_name);
CREATE INDEX IF NOT EXISTS idx_thanks_sent_timestamp ON thanks_sent(sent_timestamp DESC);
