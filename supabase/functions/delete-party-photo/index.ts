import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const ADMIN_CODE = Deno.env.get('ADMIN_DELETE_CODE');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const MEDIA_TARGETS = {
  photo: { table: 'party_photos', bucket: 'party-photos' },
  video: { table: 'party_videos', bucket: 'party-videos' },
} as const;

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    if (!ADMIN_CODE) {
      return json({ error: 'Server not configured' }, 500);
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return json({ error: 'Invalid request body' }, 400);
    }

    const { code, kind, mediaId, storagePath } = body as {
      code?: string;
      kind?: string;
      mediaId?: string;
      storagePath?: string;
    };

    if (!code) {
      return json({ error: 'Missing admin code' }, 400);
    }

    // Constant-time comparison to avoid timing leaks.
    const a = new TextEncoder().encode(String(code));
    const b = new TextEncoder().encode(ADMIN_CODE);
    if (a.length !== b.length) {
      return json({ error: 'Unauthorized' }, 401);
    }
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    if (diff !== 0) {
      return json({ error: 'Unauthorized' }, 401);
    }

    // Verify-only mode: caller just wants to check the code.
    if (mediaId === '__verify__' || !mediaId || !storagePath) {
      return json({ ok: true, verified: true }, 200);
    }

    if (kind !== undefined && kind !== 'photo' && kind !== 'video') {
      return json({ error: 'Invalid media kind' }, 400);
    }
    const target = kind === 'video' ? MEDIA_TARGETS.video : MEDIA_TARGETS.photo;

    const admin = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });

    const { error: dbErr } = await admin
      .from(target.table)
      .delete()
      .eq('id', mediaId);

    if (dbErr) {
      return json({ error: 'Failed to delete media record' }, 500);
    }

    await admin.storage.from(target.bucket).remove([storagePath]);

    return json({ ok: true }, 200);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Unknown error' }, 500);
  }
});
