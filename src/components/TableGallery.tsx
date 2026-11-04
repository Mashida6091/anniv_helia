import { useEffect, useState } from 'react';
import { Images, Loader2, Trash2 } from 'lucide-react';
import AdminUnlock from './AdminUnlock';
import MediaLightbox from './MediaLightbox';
import {
  deleteMedia,
  fetchTableMedia,
  publicUrl,
  type MediaItem,
} from '@/lib/media';

type TableGalleryProps = {
  tableNumber: number;
  refreshKey: number;
};

export default function TableGallery({ tableNumber, refreshKey }: TableGalleryProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);
  const [adminCode, setAdminCode] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchTableMedia(tableNumber)
      .then((rows) => {
        if (cancelled) return;
        setItems(rows);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) setError(`Impossible de charger l’album de la table ${tableNumber} pour l’instant.`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tableNumber, refreshKey]);

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

  return (
    <section
      id={`album-table-${tableNumber}`}
      className="relative mt-20 w-full scroll-mt-24 border-t border-kaki-200/70 pt-16"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-kaki-600">
            Album de la table
          </p>
          <h2 className="mb-3 font-display text-4xl text-marron-500 md:text-5xl">
            Table {tableNumber}
          </h2>
          <p className="mx-auto max-w-xl text-sm text-marron-500/90">
            Les photos partagées à cette table, classées dans l’ordre où elles ont été ajoutées.
          </p>
          <a
            href="#album"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-kaki-200 bg-white/70 px-4 py-2 text-sm font-medium text-marron-500 backdrop-blur transition hover:border-kaki-400 hover:bg-white"
          >
            <Images className="h-4 w-4" />
            Voir la mosaïque complète
          </a>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/60 px-5 py-3 text-sm text-marron-500 backdrop-blur-md">
          <span className="inline-flex items-center gap-2">
            <Images className="h-4 w-4" />
            {loading ? 'Chargement…' : `${items.length} photo${items.length > 1 ? 's' : ''} à la table ${tableNumber}`}
          </span>
          <AdminUnlock unlocked={!!adminCode} onUnlock={setAdminCode} />
        </div>

        {error && (
          <p className="mb-6 rounded-xl bg-marron-50 px-4 py-2 text-center text-sm text-marron-600">
            {error}
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
              Aucune photo à la table {tableNumber} pour l’instant. Les photos déposées ici apparaîtront dans cet album.
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
                  alt={item.guest_name ? `Photo de ${item.guest_name}` : `Photo, table ${tableNumber}`}
                  loading="lazy"
                  onClick={() => setLightbox(item)}
                  className="w-full cursor-zoom-in object-cover transition duration-500 group-hover:scale-105"
                />
                {item.guest_name && (
                  <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
                    <p className="text-xs text-white/90">par {item.guest_name}</p>
                  </figcaption>
                )}
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
