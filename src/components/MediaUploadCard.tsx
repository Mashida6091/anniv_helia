import { useRef, useState } from 'react';
import { CheckCircle2, Film, ImagePlus, Loader2, Upload } from 'lucide-react';
import ConfirmUploadModal from './ConfirmUploadModal';
import {
  ACCEPTED_TYPES,
  MAX_LABEL,
  formatBytes,
  getMediaKind,
  saveMediaRecord,
  startUpload,
  uploadErrorMessage,
  validateFile,
} from '@/lib/media';

type MediaUploadCardProps = {
  tableNumber: number;
  onUploaded: (tableNumber: number) => void;
};

export default function MediaUploadCard({ tableNumber, onUploaded }: MediaUploadCardProps) {
  const [guestName, setGuestName] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetPending = () => {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(null);
    setPendingPreview(null);
    setUploading(false);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setSent(false);
    const problem = validateFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
  };

  const confirmUpload = async () => {
    const file = pendingFile;
    const kind = file && getMediaKind(file);
    if (!file || !kind) return;

    setUploading(true);
    setProgress(0);

    try {
      const storagePath = await startUpload(file, kind, setProgress);
      await saveMediaRecord(kind, storagePath, tableNumber, guestName);
      resetPending();
      setSent(true);
      onUploaded(tableNumber);
    } catch (uploadError) {
      resetPending();
      setError(uploadErrorMessage(uploadError));
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (uploading) return;
    handleFile(e.dataTransfer.files?.[0]);
  };

  const pendingIsVideo = pendingFile ? getMediaKind(pendingFile) === 'video' : false;

  return (
    <>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="rounded-3xl bg-white/80 p-6 shadow-lg backdrop-blur-md md:p-8"
      >
        <div>
          <label htmlFor="guest-name" className="mb-1 block text-xs font-medium text-marron-500">
            Ton nom (optionnel)
          </label>
          <input
            id="guest-name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Ex : Tante Sophie"
            className="w-full rounded-xl border border-kaki-200 bg-white/90 px-3 py-2 text-sm text-marron-600 placeholder:text-marron-300 focus:border-kaki-500 focus:outline-none focus:ring-2 focus:ring-kaki-200"
          />
        </div>

        <label
          className={`mt-6 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-md transition ${
            uploading
              ? 'cursor-wait bg-kaki-500'
              : 'cursor-pointer bg-gradient-to-r from-kaki-600 to-marron-500 hover:scale-[1.01] active:scale-95'
          }`}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Choisir une photo ou une vidéo
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-dashed border-kaki-300 bg-kaki-50/60 px-4 py-3 text-xs text-marron-500">
          <ImagePlus className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Tu peux aussi glisser-déposer un fichier ici. Photos JPG, PNG, WEBP,
            GIF et vidéos MP4, WEBM, MOV — jusqu’à {MAX_LABEL}. L’envoi reprend
            tout seul en cas de coupure.
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-marron-500/80">
          <Film className="h-3.5 w-3.5" />
          Photos et vidéos sont rangées automatiquement dans la table {tableNumber}.
        </div>

        {sent && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-kaki-50 px-4 py-3 text-sm text-marron-600">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-kaki-600" />
              Ton souvenir est bien ajouté à la table {tableNumber}.
            </span>
            <a href="#album" className="shrink-0 font-semibold text-kaki-700 underline-offset-4 hover:underline">
              Voir l’album
            </a>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-xl bg-marron-50 px-4 py-2 text-sm text-marron-600">{error}</p>
        )}
      </div>

      <ConfirmUploadModal
        open={!!pendingFile}
        title={pendingIsVideo ? 'Confirmer la vidéo' : 'Confirmer la photo'}
        meta={
          pendingFile
            ? `Table ${tableNumber} · ${formatBytes(pendingFile.size)}${
                guestName.trim() ? ` · par ${guestName.trim()}` : ' · invité anonyme'
              }`
            : ''
        }
        uploading={uploading}
        progress={progress}
        preview={
          pendingPreview ? (
            pendingIsVideo ? (
              <video
                src={pendingPreview}
                controls
                playsInline
                className="max-h-[40vh] max-w-full rounded-xl shadow-md"
              />
            ) : (
              <img
                src={pendingPreview}
                alt="Aperçu"
                className="max-h-[40vh] max-w-full rounded-xl object-contain shadow-md"
              />
            )
          ) : null
        }
        onCancel={resetPending}
        onConfirm={confirmUpload}
      />
    </>
  );
}
