import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ImagePlus,
  Loader2,
  Lock,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react';
import { PHOTOS_BUCKET, supabase } from '@/lib/supabase';
import ConfirmUploadModal, { formatBytes } from './ConfirmUploadModal';

type PartyPhoto = {
  id: string;
  storage_path: string;
  guest_name: string | null;
  created_at: string;
};

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB (limite Supabase Storage)
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function PhotoWall() {
  const [photos, setPhotos] = useState<PartyPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guestName, setGuestName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('party_photos')
      .select('id, storage_path, guest_name, created_at')
      .order('created_at', { ascending: false });

    if (err) {
      setError("Impossible de charger les photos pour l'instant.");
    } else {
      setPhotos(data as PartyPhoto[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const publicUrl = (path: string) =>
    supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path).data.publicUrl;

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setError(null);

    if (!ACCEPTED.includes(file.type)) {
      setError('Format non supporté. Utilise JPG, PNG, WEBP ou GIF.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Le fichier est trop lourd (maximum 50 Mo).');
      return;
    }

    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
  };

  const confirmUpload = async () => {
    if (!pendingFile) return;
    setUploading(true);
    try {
      const ext = pendingFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(PHOTOS_BUCKET)
        .upload(path, pendingFile, { cacheControl: '3600', upsert: false });

      if (upErr) throw upErr;

      const { error: dbErr } = await supabase
        .from('party_photos')
        .insert({
          storage_path: path,
          guest_name: guestName.trim() || null,
        });

      if (dbErr) throw dbErr;

      await loadPhotos();
    } catch {
      setError("L'envoi a échoué. Réessaie dans un instant.");
    } finally {
      cancelPending();
      setUploading(false);
    }
  };

  const cancelPending = () => {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(null);
    setPendingPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const verifyAdmin = async () => {
    setAdminBusy(true);
    setAdminError(null);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-party-photo`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          code: adminCode,
          photoId: '__verify__',
          storagePath: '__verify__',
        }),
      });
      if (res.status === 401) {
        setAdminError('Code incorrect.');
        return;
      }
      if (!res.ok) {
        setAdminError('Vérification impossible pour l’instant.');
        return;
      }
      setIsAdmin(true);
      sessionStorage.setItem('admin_code', adminCode);
      setAdminCode('');
    } catch {
      setAdminError('Vérification impossible pour l’instant.');
    } finally {
      setAdminBusy(false);
    }
  };

  const deletePhoto = async (photo: PartyPhoto) => {
    setDeletingId(photo.id);
    setError(null);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-party-photo`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          code: adminCode || sessionStorage.getItem('admin_code') || '',
          photoId: photo.id,
          storagePath: photo.storage_path,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error === 'Unauthorized' ? 'Code admin requis.' : 'Suppression impossible.');
        return;
      }
      setPhotos((p) => p.filter((x) => x.id !== photo.id));
    } catch {
      setError('Suppression impossible.');
    } finally {
      setDeletingId(null);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <section id="photos" className="relative w-full px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center font-display text-4xl md:text-5xl text-pink-500 mb-3">
          L’album des invités
        </h2>
        <p className="mb-10 text-center text-sm text-rose-300/80 max-w-xl mx-auto">
          Partage les plus beaux souvenirs de l’anniversaire. Glisse une photo
          ci-dessous ou choisis-la — tout le monde pourra la voir.
        </p>

        {/* Upload card */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="rounded-3xl bg-white/80 p-6 md:p-8 shadow-lg backdrop-blur-md mb-10"
        >
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <label className="block text-xs font-medium text-rose-400 mb-1">
                Ton nom (optionnel)
              </label>
              <input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Ex : Tante Sophie"
                className="w-full rounded-xl border border-pink-200 bg-white/90 px-3 py-2 text-sm text-gray-700 placeholder:text-rose-200 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
              />
            </div>

            <label
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md transition ${
                uploading
                  ? 'bg-pink-300 cursor-wait'
                  : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:scale-105 active:scale-95'
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Envoi…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Choisir une photo
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED.join(',')}
                className="hidden"
                disabled={uploading}
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-pink-200 bg-pink-50/40 px-4 py-3 text-xs text-rose-400">
            <ImagePlus className="h-4 w-4" />
            Tu peux aussi glisser-déposer une image ici. JPG, PNG, WEBP ou GIF —
            50 Mo max.
          </div>

          {error && (
            <p className="mt-3 rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-500">
              {error}
            </p>
          )}
        </div>

        {/* Admin unlock */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-white/60 px-4 py-3 text-sm backdrop-blur-md">
          {isAdmin ? (
            <span className="inline-flex items-center gap-1.5 text-rose-500">
              <ShieldCheck className="h-4 w-4" />
              Mode organisateur actif — tu peux supprimer des photos.
            </span>
          ) : (
            <>
              <Lock className="h-4 w-4 text-rose-400" />
              <input
                type="password"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && verifyAdmin()}
                placeholder="Code organisateur..."
                className="w-40 rounded-full border border-pink-200 bg-white/90 px-3 py-1.5 text-sm text-gray-700 placeholder:text-rose-200 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
              />
              <button
                onClick={verifyAdmin}
                disabled={adminBusy || !adminCode}
                className="rounded-full bg-rose-500 px-4 py-1.5 text-sm font-semibold text-white transition hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {adminBusy ? '…' : 'Déverrouiller'}
              </button>
              {adminError && (
                <span className="text-rose-500">{adminError}</span>
              )}
            </>
          )}
        </div>

      </div>

      {/* Confirmation avant envoi */}
      <ConfirmUploadModal
        open={!!pendingFile}
        title="Confirmer la photo"
        fileName={pendingFile?.name ?? ''}
        fileSize={pendingFile ? formatBytes(pendingFile.size) : ''}
        guestName={guestName.trim()}
        uploading={uploading}
        progress={0}
        preview={
          pendingPreview ? (
            <img
              src={pendingPreview}
              alt="Aperçu"
              className="max-h-[40vh] max-w-full rounded-xl object-contain shadow-md"
            />
          ) : null
        }
        onCancel={cancelPending}
        onConfirm={confirmUpload}
      />

    </section>
  );
}
