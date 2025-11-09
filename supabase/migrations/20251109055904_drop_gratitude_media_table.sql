/*
  # Drop Unused Gratitude Media Table

  1. Changes
    - Drop the `gratitude_media` table as it's no longer needed
    - Media URLs are now stored directly in the `gratitude_entries` table

  2. Notes
    - This table was never used in the application
    - Removing to simplify database schema
*/

DROP TABLE IF EXISTS gratitude_media CASCADE;
