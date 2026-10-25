import { Loader2 } from 'lucide-react';

type ConfirmUploadModalProps = {
  open: boolean;
  title: string;
  fileName: string;
  fileSize: string;
  guestName: string;
  uploading: boolean;
  progress: number;
  preview: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} Go`;
}

export default function ConfirmUploadModal({
  open,
  title,
  fileName,
  fileSize,
  guestName,
  uploading,
  progress,
  preview,
  onCancel,
  onConfirm,
}: ConfirmUploadModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={uploading ? undefined : onCancel}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-pink-100 px-6 py-4">
          <h3 className="font-display text-xl text-pink-500">{title}</h3>
          <p className="mt-0.5 text-xs text-rose-400">
            Vérifie avant de partager — cette action est définitive.
          </p>
        </div>

        <div className="max-h-[50vh] overflow-auto bg-pink-50/40">
          <div className="flex items-center justify-center p-4">{preview}</div>
        </div>

        <div className="px-6 py-3 text-sm text-gray-600">
          <p className="truncate font-medium text-gray-700">{fileName}</p>
          <p className="text-xs text-rose-400">
            {fileSize}
            {guestName ? ` · par ${guestName}` : ' · invité anonyme'}
          </p>
        </div>

        {uploading && (
          <div className="px-6 pb-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-pink-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-center text-xs text-rose-400">
              Envoi en cours… {progress}%
            </p>
          </div>
        )}

        <div className="flex gap-3 px-6 py-4">
          <button
            onClick={onCancel}
            disabled={uploading}
            className="flex-1 rounded-full border border-pink-200 px-4 py-2.5 text-sm font-semibold text-rose-500 transition hover:bg-pink-50 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={uploading}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:scale-[1.02] active:scale-95 disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Envoi…
              </>
            ) : (
              'Confirmer l’envoi'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export { formatBytes };
