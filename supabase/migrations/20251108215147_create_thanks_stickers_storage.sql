/*
  # Create Storage Bucket for Thank You Stickers

  1. New Storage Bucket
    - `thanks-stickers` - Public bucket for storing thank you sticker images
  
  2. Security
    - Enable public access for reading sticker images
    - Allow authenticated users to upload stickers
    - Add policies for authenticated users to insert and read files
  
  3. Purpose
    - Store thank you sticker images for sharing via SMS, download, and copy
    - Generate public URLs for easy sharing across platforms
*/

-- Create the storage bucket for thanks stickers
INSERT INTO storage.buckets (id, name, public)
VALUES ('thanks-stickers', 'thanks-stickers', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload stickers
CREATE POLICY "Authenticated users can upload stickers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'thanks-stickers');

-- Allow anyone to read stickers (public bucket)
CREATE POLICY "Anyone can view stickers"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'thanks-stickers');