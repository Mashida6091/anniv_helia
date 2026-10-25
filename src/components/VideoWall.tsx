import { useCallback, useEffect, useRef, useState } from 'react';
import * as tus from 'tus-js-client';
import {
  Film,
  Loader2,
  Video as VideoIcon,
  Upload,
} from 'lucide-react';
import { VIDEOS_BUCKET, supabase } from '@/lib/supabase';
import ConfirmUploadModal, { formatBytes } from './ConfirmUploadModal';

type PartyVideo = {
  id: string;
  storage_path: string;
  guest_name: string | null;
  created_at: string;
};

// TUS resumable uploads support files up to 50 GB on Supabase Storage.
const MAX_BYTES = 50 * 1024 * 1024 * 1024; // 50 GB
const MAX_LABEL = '50 Go';
const ACCEPTED = ['video/mp4', 'video/webm', 'video/quicktime'];

// Derive the direct storage hostname for faster, more reliable large uploads.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const PROJECT_REF = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const TUS_ENDPOINT = `https://${PROJECT_REF}.storage.supabase.co/storage/v1/upload/resumable`;

export default function VideoWall() {
  const [videos, setVideos] = useState<PartyVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [guestName, setGuestName] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadVideos = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('party_videos')
      .select('id, storage_path, guest_name, created_at')
      .order('created_at', { ascending: false });

    if (err) {
      setError("Impossible de charger les vidéos pour l'instant.");
    } else {
      setVideos(data as PartyVideo[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const publicUrl = (path: string) =>
    supabase.storage.from(VIDEOS_BUCKET).getPublicUrl(path).data.publicUrl;

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setError(null);

    if (!ACCEPTED.includes(file.type)) {
      setError('Format non supporté. Utilise MP4, WEBM ou MOV.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`Le fichier est trop lourd (maximum ${MAX_LABEL}).`);
      return;
    }

    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
  };

  const cancelPending = () => {
    if (uploadRef.current) {
      uploadRef.current.abort();
      uploadRef.current = null;
    }
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(null);
    setPendingPreview(null);
    setUploading(false);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  };

  const uploadRef = useRef<tus.Upload | null>(null);

  const confirmUpload = () => {
    if (!pendingFile) return;
    setUploading(true);
    setProgress(0);

    const file = pendingFile;
    const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
    const path = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}.${ext}`;

    const upload = new tus.Upload(file, {
      endpoint: TUS_ENDPOINT,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      chunkSize: 6 * 1024 * 1024, // must stay 6 MB for Supabase TUS
      metadata: {
        bucketName: VIDEOS_BUCKET,
        objectName: path,
        contentType: file.type || 'video/mp4',
        cacheControl: '3600',
      },
      headers: {
        authorization: `Bearer ${ANON_KEY}`,
      },
      onError: () => {
        setError("L'envoi a échoué. Réessaie dans un instant.");
        uploadRef.current = null;
        cancelPending();
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const pct = Math.round((bytesUploaded / bytesTotal) * 100);
        setProgress(pct);
      },
      onSuccess: async () => {
        uploadRef.current = null;
        try {
          const { error: dbErr } = await supabase
            .from('party_videos')
            .insert({
              storage_path: path,
              guest_name: guestName.trim() || null,
            });

          if (dbErr) throw dbErr;
          await loadVideos();
        } catch {
          setError(
            'La vidéo a été envoyée mais son enregistrement a échoué. Réessaie.',
          );
        } finally {
          cancelPending();
        }
      },
    });

    uploadRef.current = upload;

    upload.findPreviousUploads().then((previousUploads) => {
      if (previousUploads.length > 0) {
        upload.resumeUpload(previousUploads[0]);
      }
      upload.start();
    });
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <section id="videos" className="relative w-full px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center font-display text-4xl md:text-5xl text-pink-500 mb-3">
          Les vidéos des invités
        </h2>
        <p className="mb-10 text-center text-sm text-rose-300/80 max-w-xl mx-auto">
          Partage tes plus beaux moments filmés de l’anniversaire. Glisse une
          vidéo ci-dessous ou choisis-la — tout le monde pourra la regarder.
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
                  Envoi… {progress}%
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Choisir une vidéo
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

          {uploading && (
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-pink-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-pink-200 bg-pink-50/40 px-4 py-3 text-xs text-rose-400">
            <Film className="h-4 w-4" />
            Tu peux aussi glisser-déposer une vidéo ici. MP4, WEBM ou MOV —
            jusqu’à {MAX_LABEL}. L’envoi reprend tout seul en cas de coupure.
          </div>

          {error && (
            <p className="mt-3 rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-500">
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Confirmation avant envoi */}
      <ConfirmUploadModal
        open={!!pendingFile}
        title="Confirmer la vidéo"
        fileName={pendingFile?.name ?? ''}
        fileSize={pendingFile ? formatBytes(pendingFile.size) : ''}
        guestName={guestName.trim()}
        uploading={uploading}
        progress={progress}
        preview={
          pendingPreview ? (
            <video
              src={pendingPreview}
              controls
              playsInline
              className="max-h-[40vh] max-w-full rounded-xl shadow-md"
            />
          ) : null
        }
        onCancel={cancelPending}
        onConfirm={confirmUpload}
      />
    </section>
  );
}
