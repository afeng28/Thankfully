/*
  # Create User Preferences Table

  1. New Tables
    - `user_preferences`
      - `id` (uuid, primary key)
      - `user_id` (text) - Identifier for the user
      - `username` (text) - User's display name
      - `main_goal` (text) - User's primary goal for using the app
      - `time_commitment` (text) - How much time user wants to spend daily
      - `text_box_size` (text) - Derived UI preference (small, medium, large)
      - `has_completed_onboarding` (boolean) - Whether user finished onboarding
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_preferences` table
    - Users can view all preferences (single-user app for now)
    - Users can insert and update preferences
    
  3. Indexes
    - Index on `user_id` for fast user lookups
    - Index on `has_completed_onboarding` for filtering
    
  4. Notes
    - `main_goal` values: "begin_journey", "improve_mood", "capture_memories"
    - `time_commitment` values: "under_1_min", "2_5_min", "as_long_as_needed"
    - `text_box_size` values: "small", "medium", "large"
    - Updated_at automatically updates on row changes
*/

CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text DEFAULT 'default_user',
  username text DEFAULT 'Friend',
  main_goal text,
  time_commitment text,
  text_box_size text DEFAULT 'medium',
  has_completed_onboarding boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_onboarding ON user_preferences(has_completed_onboarding);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User preferences are viewable by everyone"
  ON user_preferences FOR SELECT
  USING (true);

CREATE POLICY "Users can insert preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update preferences"
  ON user_preferences FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
