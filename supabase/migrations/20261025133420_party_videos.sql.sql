/*
# Party videos — shared guest video wall (single-tenant, no auth)

This is a birthday celebration page where guests drop short videos they took
during the party. There is no sign-in: anyone with the link can upload and
view. Data is intentionally public/shared (same model as party_photos).

1. New Tables
- `party_videos`
  - `id` (uuid, primary key)
  - `storage_path` (text, path of the file inside the `party-videos` storage bucket)
  - `guest_name` (text, optional name of the guest who uploaded)
  - `created_at` (timestamptz, when uploaded)

2. Storage
- Create public bucket `party-videos`.
- Storage policies: anon + authenticated may READ and UPLOAD objects in the
  bucket (shared party album). DELETE left off — guests can't remove others'
  videos from the client.

3. Security
- Enable RLS on `party_videos`.
- Grant SELECT, INSERT to `anon` + `authenticated` (no-sign-in shared app).
- DELETE granted to `service_role` only (admin edge function uses the
  service role key, which bypasses RLS but still needs the grant).
- Permissive SELECT/INSERT policies (`USING (true)`) are correct here because
  the album is intentionally public — every visitor can see and add videos.
- Storage policies use the same shared/public rationale.
*/

CREATE TABLE IF NOT EXISTS party_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text NOT NULL,
  guest_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE party_videos ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON party_videos TO anon, authenticated;
GRANT DELETE ON party_videos TO service_role;

DROP POLICY IF EXISTS "anon_select_party_videos" ON party_videos;
CREATE POLICY "anon_select_party_videos"
ON party_videos FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_party_videos" ON party_videos;
CREATE POLICY "anon_insert_party_videos"
ON party_videos FOR INSERT
TO anon, authenticated WITH CHECK (true);

-- Storage bucket (idempotent: insert if missing)
INSERT INTO storage.buckets (id, name, public)
VALUES ('party-videos', 'party-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (drop first for idempotency)
DROP POLICY IF EXISTS "anon_read_party_videos" ON storage.objects;
CREATE POLICY "anon_read_party_videos"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'party-videos');

DROP POLICY IF EXISTS "anon_upload_party_videos" ON storage.objects;
CREATE POLICY "anon_upload_party_videos"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'party-videos');

REVOKE DELETE ON storage.objects FROM anon, authenticated;
GRANT DELETE ON storage.objects TO service_role;
