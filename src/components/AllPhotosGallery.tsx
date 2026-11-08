import { useEffect, useState } from 'react';
import { Download, Images, Loader2, Trash2 } from 'lucide-react';
import AdminUnlock from './AdminUnlock';
import MediaLightbox from './MediaLightbox';
import {
  deleteMedia,
  fetchAllMedia,
  publicUrl,
  type MediaItem,
} from '@/lib/media';
import { createPhotosArchive } from '@/lib/downloadPhotos';

type AllPhotosGalleryProps = {
  refreshKey: number;
};

export default function AllPhotosGallery({ refreshKey }: AllPhotosGalleryProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<{ completed: number; total: number } | null>(null);
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);
  const [adminCode, setAdminCode] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAllMedia()
      .then((rows) => {
        if (cancelled) return;
        setItems(rows);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) setError('Impossible de charger les photos pour l’instant.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const handleDelete = async (item: MediaItem) => {
    if (!adminCode) return;
    setDeletingId(item.id);
    setError(null);
    const result = await deleteMedia(item, adminCode);
    setDeletingId(null);
    if (result === 'ok') {
      setItems((current) => current.filter((x) => x.id !== item.id));
    } else if (result === 'unauthorized') {
      setAdminCode(null);
      setError('Code organisateur requis à nouveau.');
    } else {
      setError('Suppression impossible.');
    }
  };

  const handleDownloadAll = async () => {
    if (loading || items.length === 0 || downloadProgress) return;

    setDownloadError(null);
    setDownloadProgress({ completed: 0, total: items.length });

    try {
      const archive = await createPhotosArchive(items, (completed, total) => {
        setDownloadProgress({ completed, total });
      });
      const url = URL.createObjectURL(archive);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'souvenirs-helia.zip';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (cause) {
      if (cause instanceof Error && cause.message === 'archive-too-large') {
        setDownloadError('L’album est trop volumineux pour être regroupé dans une seule archive.');
      } else if (cause instanceof Error && cause.message === 'too-many-photos') {
        setDownloadError('Il y a trop de photos pour créer une seule archive.');
      } else {
        setDownloadError('Le téléchargement a échoué. Vérifie ta connexion puis réessaie.');
      }
    } finally {
      setDownloadProgress(null);
    }
  };

  return (
    <section id="album" className="relative w-full px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-kaki-600">
            Toutes les tables réunies
          </p>
          <h2 className="mb-3 font-display text-4xl text-marron-500 md:text-5xl">
            La mosaïque de toutes les photos
          </h2>
          <p className="mx-auto max-w-xl text-sm text-marron-500/90">
            Retrouve ici les photos partagées à toutes les tables. Chaque image indique sa table.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/60 px-5 py-3 text-sm text-marron-500 backdrop-blur-md">
          <span className="inline-flex items-center gap-2">
            <Images className="h-4 w-4" />
            {loading ? 'Chargement…' : items.length + ' photo' + (items.length > 1 ? 's' : '') + ' au total'}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleDownloadAll}
              disabled={loading || items.length === 0 || !!downloadProgress}
              aria-busy={!!downloadProgress}
              className="inline-flex items-center gap-2 rounded-full bg-marron-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-marron-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-kaki-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {downloadProgress ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {downloadProgress
                ? 'Préparation ' + downloadProgress.completed + '/' + downloadProgress.total + '…'
                : 'Télécharger toutes les photos'}
            </button>
            <AdminUnlock unlocked={!!adminCode} onUnlock={setAdminCode} />
          </div>
        </div>

        {error && (
          <p className="mb-6 rounded-xl bg-marron-50 px-4 py-2 text-center text-sm text-marron-600">
            {error}
          </p>
        )}
        {downloadError && (
          <p role="alert" className="mb-6 rounded-xl bg-marron-50 px-4 py-2 text-center text-sm text-marron-600">
            {downloadError}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 text-marron-500">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-kaki-300 bg-white/50 px-6 py-16 text-center">
            <Images className="mx-auto mb-3 h-10 w-10 text-kaki-400" />
            <p className="text-marron-500">
              Aucune photo n’a encore été partagée. Les souvenirs de toutes les tables apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="columns-2 gap-3 md:columns-3 md:gap-5 [column-fill:_balance]">
            {items.map((item) => (
              <figure
                key={item.id}
                className="group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl shadow-md md:mb-5"
              >
                <img
                  src={publicUrl(item)}
                  alt={item.guest_name
                    ? 'Photo de ' + item.guest_name + ', table ' + item.table_number
                    : 'Photo, table ' + item.table_number}
                  loading="lazy"
                  onClick={() => setLightbox(item)}
                  className="w-full cursor-zoom-in object-cover transition duration-500 group-hover:scale-105"
                />
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
                  <p className="text-xs text-white/90">
                    Table {item.table_number}
                    {item.guest_name ? ' · par ' + item.guest_name : ''}
                  </p>
                </figcaption>
                {adminCode && (
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={deletingId === item.id}
                    aria-label="Supprimer cette photo"
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-100 transition hover:bg-marron-500 disabled:opacity-50 md:opacity-0 md:group-hover:opacity-100"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                )}
              </figure>
            ))}
          </div>
        )}
      </div>

      {lightbox && <MediaLightbox item={lightbox} onClose={() => setLightbox(null)} />}
    </section>
  );
}
