/*
# Lock photo deletion to admin-only (via edge function + secret code)

Until now any visitor could delete any photo because party_photos and the
storage bucket granted DELETE to anon/authenticated with permissive policies.
This migration removes that ability from the public so that only the service
role (used by the admin edge function, which checks a secret code) can delete.

1. party_photos table
- Revoke DELETE from anon + authenticated (keep SELECT/INSERT/UPDATE for the
  shared album — guests can still view and add photos, and update captions).
- Drop the public DELETE policy.
- Grant DELETE to service_role (the edge function uses the service role key,
  which bypasses RLS but still needs the grant).

2. storage.objects (party-photos bucket)
- Revoke DELETE from anon + authenticated.
- Drop any public DELETE policy if present (none existed, but stay idempotent).
- Grant DELETE to service_role so the edge function can remove the file.

3. Notes
- Reads and uploads by guests are unchanged.
- Captions/guest names remain editable (UPDATE still granted) — this is
  harmless and keeps the album friendly. If you want to lock UPDATE too, say so.
- The actual "who is admin" decision happens in the delete-photo edge function,
  which compares a code sent by the client against ADMIN_DELETE_CODE secret.
*/

REVOKE DELETE ON party_photos FROM anon, authenticated;
GRANT DELETE ON party_photos TO service_role;

DROP POLICY IF EXISTS "anon_delete_party_photos" ON party_photos;

REVOKE DELETE ON storage.objects FROM anon, authenticated;
GRANT DELETE ON storage.objects TO service_role;

DROP POLICY IF EXISTS "anon_delete_party_photos_obj" ON storage.objects;
