import { useCallback, useEffect, useState } from 'react';
import { ImageOff, Loader2, X } from 'lucide-react';
import { PHOTOS_BUCKET, VIDEOS_BUCKET, supabase } from '@/lib/supabase';

type MediaItem = {
  id: string;
  kind: 'photo' | 'video';
  storage_path: string;
  guest_name: string | null;
  created_at: string;
};

export default function MediaMosaic() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<MediaItem | null>(null);

  const publicUrl = (bucket: string, path: string) =>
    supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;

  const load = useCallback(async () => {
    setLoading(true);
    const [photos, videos] = await Promise.all([
      supabase
        .from('party_photos')
        .select('id, storage_path, guest_name, created_at'),
      supabase
        .from('party_videos')
        .select('id, storage_path, guest_name, created_at'),
    ]);

    const merged: MediaItem[] = [
      ...((photos.data ?? []).map((p) => ({
        ...p,
        kind: 'photo' as const,
      }))),
      ...((videos.data ?? []).map((v) => ({
        ...v,
        kind: 'video' as const,
      }))),
    ];

    merged.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    setItems(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const url = (item: MediaItem) =>
    publicUrl(item.kind === 'photo' ? PHOTOS_BUCKET : VIDEOS_BUCKET, item.storage_path);

  return (
    <section id="mosaic" className="relative w-full px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-display text-4xl md:text-5xl text-pink-500 mb-3">
          Le mur des souvenirs
        </h2>
        <p className="mb-10 text-center text-sm text-rose-300/80 max-w-xl mx-auto">
          Toutes les photos et vidéos partagées, mélangées et rangées dans
          l’ordre où elles ont été ajoutées.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-rose-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-pink-200 bg-white/50 px-6 py-16 text-center">
            <ImageOff className="mx-auto mb-3 h-10 w-10 text-pink-300" />
            <p className="text-rose-400">
              Rien pour l’instant. Partage une photo ou une vidéo plus haut !
            </p>
          </div>
        ) : (
          <div className="columns-2 gap-3 md:columns-3 md:gap-5 [column-fill:_balance]">
            {items.map((item) => (
              <figure
                key={`${item.kind}-${item.id}`}
                className="group relative mb-3 md:mb-5 break-inside-avoid overflow-hidden rounded-2xl shadow-md"
              >
                {item.kind === 'photo' ? (
                  <img
                    src={url(item)}
                    alt={item.guest_name || 'Souvenir'}
                    loading="lazy"
                    onClick={() => setActive(item)}
                    className="w-full cursor-zoom-in object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <video
                    src={url(item)}
                    onClick={() => setActive(item)}
                    playsInline
                    preload="metadata"
                    muted
                    className="w-full cursor-zoom-in object-cover transition duration-500 group-hover:scale-105"
                  />
                )}
                {item.guest_name && (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
                    <p className="text-xs text-white/80">
                      par {item.guest_name}
                    </p>
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActive(null)}
        >
          <button
            className="absolute top-5 right-5 text-white/80 hover:text-white"
            aria-label="Fermer"
          >
            <X className="h-8 w-8" />
          </button>
          {active.kind === 'photo' ? (
            <img
              src={url(active)}
              alt="Aperçu"
              className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <video
              src={url(active)}
              controls
              autoPlay
              playsInline
              className="max-h-full max-w-full rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </section>
  );
}
