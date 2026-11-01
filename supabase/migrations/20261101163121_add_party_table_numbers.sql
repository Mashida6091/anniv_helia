/*
# Assign each party photo and video to one of 11 tables

Guests choose their table when uploading, and the album is grouped in tabs
"Table 1" to "Table 11". Both media tables get the same column so a single
tab can show photos and videos together.

1. Columns
- `table_number` (smallint, required, 1 to 11) on `party_photos` and `party_videos`.

2. Indexes
- Composite index on (table_number, created_at) for the per-table album query.

3. Notes
- Both tables are empty at the time of this migration, so NOT NULL is safe.
- Existing grants and RLS policies already cover the new column.
*/

ALTER TABLE party_photos
  ADD COLUMN IF NOT EXISTS table_number smallint NOT NULL
  CHECK (table_number BETWEEN 1 AND 11);

ALTER TABLE party_videos
  ADD COLUMN IF NOT EXISTS table_number smallint NOT NULL
  CHECK (table_number BETWEEN 1 AND 11);

CREATE INDEX IF NOT EXISTS party_photos_table_created_idx
  ON party_photos (table_number, created_at);

CREATE INDEX IF NOT EXISTS party_videos_table_created_idx
  ON party_videos (table_number, created_at);
