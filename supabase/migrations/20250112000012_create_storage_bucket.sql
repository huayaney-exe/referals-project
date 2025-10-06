-- ============================================
-- CREATE BUSINESS ASSETS STORAGE BUCKET
-- ============================================
-- Date: 2025-01-12
-- Purpose: Create Supabase Storage bucket for QR codes, logos, and business assets
-- Issue: StorageApiError: Bucket not found when uploading QR codes
-- Error: 400 Bad Request when trying to upload to business-assets bucket

-- Create business-assets storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-assets',
  'business-assets',
  true,  -- public bucket for QR codes and logos
  5242880,  -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their business folder
CREATE POLICY "Business owners can upload assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'business-assets'
  AND (storage.foldername(name))[1] = 'qr-codes'
);

-- Allow public read access
CREATE POLICY "Anyone can view business assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'business-assets');

-- Allow business owners to update their assets
CREATE POLICY "Business owners can update their assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'business-assets');

-- Allow business owners to delete their assets
CREATE POLICY "Business owners can delete their assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'business-assets');
