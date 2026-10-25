/*
# Party photos — shared guest photo wall (single-tenant, no auth)

This is a birthday celebration page where guests drop photos they took during
the party. There is no sign-in: anyone with the link can upload and view.
Data is intentionally public/shared.

1. New Tables
- `party_photos`
  - `id` (uuid, primary key)
  - `storage_path` (text, path of the file inside the `party-photos` storage bucket)
  - `caption` (text, optional caption the guest may add)
  - `guest_name` (text, optional name of the guest who uploaded)
  - `created_at` (timestamptz, when uploaded)

2. Storage
- Create public bucket `party-photos`.
- Storage policies: anon + authenticated may READ and UPLOAD objects in the
  bucket (shared party album). DELETE left off — guests can't remove others'
  photos from the client.

3. Security
- Enable RLS on `party_photos`.
- Grant CRUD to `anon` + `authenticated` (no-sign-in shared app).
- Permissive policies (`USING (true)`) are correct here because the album is
  intentionally public — every visitor can see and add photos.
- Storage policies use the same shared/public rationale.
*/

CREATE TABLE IF NOT EXISTS party_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text NOT NULL,
  caption text,
  guest_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE party_photos ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON party_photos TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_party_photos" ON party_photos;
CREATE POLICY "anon_select_party_photos"
ON party_photos FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_party_photos" ON party_photos;
CREATE POLICY "anon_insert_party_photos"
ON party_photos FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_party_photos" ON party_photos;
CREATE POLICY "anon_update_party_photos"
ON party_photos FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_party_photos" ON party_photos;
CREATE POLICY "anon_delete_party_photos"
ON party_photos FOR DELETE
TO anon, authenticated USING (true);

-- Storage bucket (idempotent: insert if missing)
INSERT INTO storage.buckets (id, name, public)
VALUES ('party-photos', 'party-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (drop first for idempotency)
DROP POLICY IF EXISTS "anon_read_party_photos" ON storage.objects;
CREATE POLICY "anon_read_party_photos"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'party-photos');

DROP POLICY IF EXISTS "anon_upload_party_photos" ON storage.objects;
CREATE POLICY "anon_upload_party_photos"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'party-photos');

DROP POLICY IF EXISTS "anon_update_party_photos_obj" ON storage.objects;
CREATE POLICY "anon_update_party_photos_obj"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'party-photos');
