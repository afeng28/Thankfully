/*
  # Fix Storage Policies for Thank You Stickers

  1. Changes
    - Drop the existing restrictive upload policy
    - Create a new policy allowing anyone to upload stickers
    - This app doesn't use authentication, so we need public upload access
  
  2. Security
    - Public bucket for both reading and uploading
    - Suitable for a gratitude app where users share stickers without accounts
*/

-- Drop the existing authenticated-only policy
DROP POLICY IF EXISTS "Authenticated users can upload stickers" ON storage.objects;

-- Allow anyone to upload stickers
CREATE POLICY "Anyone can upload stickers"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'thanks-stickers');