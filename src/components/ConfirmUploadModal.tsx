import { Loader2 } from 'lucide-react';

type ConfirmUploadModalProps = {
  open: boolean;
  title: string;
  meta: string;
  uploading: boolean;
  progress: number;
  preview: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmUploadModal({
  open,
  title,
  meta,
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
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-kaki-100 px-6 py-4">
          <h3 className="font-display text-2xl text-marron-500">{title}</h3>
          <p className="mt-0.5 text-xs text-marron-500/80">
            Vérifie avant de partager — cette action est définitive.
          </p>
        </div>

        <div className="max-h-[50vh] overflow-auto bg-kaki-50/60">
          <div className="flex items-center justify-center p-4">{preview}</div>
        </div>

        <p className="px-6 py-3 text-xs text-marron-500">{meta}</p>

        {uploading && (
          <div className="px-6 pb-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-kaki-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-kaki-600 to-marron-500 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-center text-xs text-marron-500">
              Envoi en cours… {progress}%
            </p>
          </div>
        )}

        <div className="flex gap-3 px-6 py-4">
          <button
            onClick={onCancel}
            disabled={uploading}
            className="flex-1 rounded-full border border-kaki-300 px-4 py-2.5 text-sm font-semibold text-marron-500 transition hover:bg-kaki-50 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={uploading}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-kaki-600 to-marron-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:scale-[1.02] active:scale-95 disabled:opacity-60"
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
