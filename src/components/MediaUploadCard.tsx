import { useRef, useState } from 'react';
import { Film, ImagePlus, Loader2, Upload } from 'lucide-react';
import ConfirmUploadModal from './ConfirmUploadModal';
import {
  ACCEPTED_TYPES,
  MAX_LABEL,
  TABLE_NUMBERS,
  formatBytes,
  getMediaKind,
  saveMediaRecord,
  startUpload,
  validateFile,
} from '@/lib/media';

type MediaUploadCardProps = {
  onUploaded: (tableNumber: number) => void;
};

export default function MediaUploadCard({ onUploaded }: MediaUploadCardProps) {
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [guestName, setGuestName] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
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
    if (!tableNumber) {
      setError('Choisis d’abord ta table pour envoyer ton souvenir.');
      return;
    }
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
    if (!file || !kind || !tableNumber) return;

    setUploading(true);
    setProgress(0);
    try {
      const storagePath = await startUpload(file, kind, setProgress);
      await saveMediaRecord(kind, storagePath, tableNumber, guestName);
      const sentTable = tableNumber;
      resetPending();
      onUploaded(sentTable);
    } catch {
      resetPending();
      setError("L'envoi a échoué. Réessaie dans un instant.");
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (uploading) return;
    handleFile(e.dataTransfer.files?.[0]);
  };

  const pendingIsVideo = pendingFile ? getMediaKind(pendingFile) === 'video' : false;

  return (
    <section id="partager" className="relative w-full px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-3 text-center font-display text-4xl text-marron-500 md:text-5xl">
          Partage ton souvenir
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-center text-sm text-marron-500/90">
          Choisis ta table, puis glisse une photo ou une vidéo. Tout le monde
          pourra la retrouver dans l’album.
        </p>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="rounded-3xl bg-white/80 p-6 shadow-lg backdrop-blur-md md:p-8"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="guest-table"
                className="mb-1 block text-xs font-medium text-marron-500"
              >
                Ta table
              </label>
              <select
                id="guest-table"
                value={tableNumber ?? ''}
                onChange={(e) => setTableNumber(e.target.value ? Number(e.target.value) : null)}
                disabled={uploading}
                className="w-full rounded-xl border border-kaki-200 bg-white/90 px-3 py-2 text-sm text-marron-600 focus:border-kaki-500 focus:outline-none focus:ring-2 focus:ring-kaki-200"
              >
                <option value="">Choisis ta table…</option>
                {TABLE_NUMBERS.map((n) => (
                  <option key={n} value={n}>
                    Table {n}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="guest-name"
                className="mb-1 block text-xs font-medium text-marron-500"
              >
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
          </div>

          <label
            className={`mt-6 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-md transition ${
              uploading || !tableNumber
                ? 'cursor-not-allowed bg-kaki-400'
                : 'cursor-pointer bg-gradient-to-r from-kaki-600 to-marron-500 hover:scale-[1.01] active:scale-95'
            }`}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {tableNumber ? 'Choisir une photo ou une vidéo' : 'Choisis d’abord ta table'}
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              className="hidden"
              disabled={uploading || !tableNumber}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-dashed border-kaki-300 bg-kaki-50/60 px-4 py-3 text-xs text-marron-500">
            <ImagePlus className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Tu peux aussi glisser-déposer un fichier ici. Photos JPG, PNG,
              WEBP, GIF et vidéos MP4, WEBM, MOV — jusqu’à {MAX_LABEL}. L’envoi
              reprend tout seul en cas de coupure.
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-marron-500/80">
            <Film className="h-3.5 w-3.5" />
            Photos et vidéos sont classées automatiquement dans la table choisie.
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-marron-50 px-4 py-2 text-sm text-marron-600">
              {error}
            </p>
          )}
        </div>
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
    </section>
  );
}
