import * as tus from 'tus-js-client';
import { PHOTOS_BUCKET, supabase } from '@/lib/supabase';

export const TABLE_NUMBERS = Array.from({ length: 11 }, (_, i) => i + 1);

export type MediaItem = {
  id: string;
  storage_path: string;
  guest_name: string | null;
  table_number: number;
  created_at: string;
};

const MAX_BYTES = 50 * 1024 * 1024; // Plafond par défaut Supabase Free
export const MAX_LABEL = '50 Mo';

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const PROJECT_REF = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');
const TUS_ENDPOINT = `https://${PROJECT_REF}.storage.supabase.co/storage/v1/upload/resumable`;
const DELETE_URL = `${SUPABASE_URL}/functions/v1/delete-party-photo`;

export function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Format non supporté. Utilise JPG, PNG, WEBP ou GIF.';
  }
  if (file.size > MAX_BYTES) {
    return `La photo est trop lourde (maximum ${MAX_LABEL}).`;
  }
  return null;
}

export function uploadErrorMessage(error: unknown): string {
  const tusError = error as {
    message?: string;
    status?: number;
    statusCode?: number;
    originalResponse?: { getStatus?: () => number; getBody?: () => string };
  };
  const status =
    tusError?.originalResponse?.getStatus?.() ?? tusError?.statusCode ?? tusError?.status;
  const details = [
    tusError?.message,
    tusError?.originalResponse?.getBody?.(),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (
    status === 413 ||
    /payload too large|entity too large|maximum allowed size|file size limit|exceed.{0,20}(size|limit)/.test(details)
  ) {
    return "La photo dépasse la limite de stockage autorisée. Sur Supabase Free, elle est de 50 Mo ; réduis sa taille ou choisis une image compressée.";
  }
  if (status === 401 || status === 403) {
    return "Le stockage a refusé l'envoi. Vérifie la configuration des autorisations Supabase.";
  }
  if (status === 404) {
    return "L'espace de stockage des photos est introuvable. Vérifie que le bucket « party-photos » existe dans Supabase.";
  }
  return "L'envoi a échoué. Vérifie ta connexion puis réessaie.";
}

export function publicUrl(item: Pick<MediaItem, 'storage_path'>): string {
  return supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(item.storage_path).data.publicUrl;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} Go`;
}

export function startUpload(
  file: File,
  onProgress: (pct: number) => void,
): Promise<string> {
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${
    file.name.split('.').pop()?.toLowerCase() || 'bin'
  }`;

  let resolve!: (value: string) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<string>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const upload = new tus.Upload(file, {
    endpoint: TUS_ENDPOINT,
    retryDelays: [0, 3000, 5000, 10000, 20000],
    uploadDataDuringCreation: true,
    removeFingerprintOnSuccess: true,
    chunkSize: 6 * 1024 * 1024, // doit rester à 6 Mo pour Supabase TUS
    metadata: {
      bucketName: PHOTOS_BUCKET,
      objectName: path,
      contentType: file.type,
      cacheControl: '3600',
    },
    headers: { authorization: `Bearer ${ANON_KEY}` },
    onProgress: (sent, total) => onProgress(Math.round((sent / total) * 100)),
    onError: reject,
    onSuccess: () => resolve(path),
  });

  upload
    .findPreviousUploads()
    .then((previous) => {
      if (previous.length > 0) upload.resumeFromPreviousUpload(previous[0]);
      upload.start();
    })
    .catch(reject);

  return promise;
}

export async function saveMediaRecord(
  storagePath: string,
  tableNumber: number,
  guestName: string,
): Promise<void> {
  const { error } = await supabase.from('party_photos').insert({
    storage_path: storagePath,
    guest_name: guestName.trim() || null,
    table_number: tableNumber,
  });
  if (error) throw error;
}

export async function fetchTableMedia(tableNumber: number): Promise<MediaItem[]> {
  const columns = 'id, storage_path, guest_name, table_number, created_at';
  const { data, error } = await supabase
    .from('party_photos')
    .select(columns)
    .eq('table_number', tableNumber);
  if (error) throw new Error('fetch-failed');
  return data ?? [];
}

export type DeleteResult = 'ok' | 'unauthorized' | 'failed';

async function callDeleteFunction(body: Record<string, string>): Promise<DeleteResult> {
  try {
    const res = await fetch(DELETE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify(body),
    });
    if (res.status === 401) return 'unauthorized';
    return res.ok ? 'ok' : 'failed';
  } catch {
    return 'failed';
  }
}

export function deleteMedia(item: MediaItem, code: string): Promise<DeleteResult> {
  return callDeleteFunction({
    code,
    kind: 'photo',
    mediaId: item.id,
    storagePath: item.storage_path,
  });
}

export function verifyAdminCode(code: string): Promise<DeleteResult> {
  return callDeleteFunction({ code, mediaId: '__verify__', storagePath: '__verify__' });
}
