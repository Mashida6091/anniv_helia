import { useEffect } from 'react';
import { X } from 'lucide-react';
import { type MediaItem, publicUrl } from '@/lib/media';

type MediaLightboxProps = {
  item: MediaItem;
  onClose: () => void;
};

export default function MediaLightbox({ item, onClose }: MediaLightboxProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const src = publicUrl(item);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-5 right-5 text-white/80 transition hover:text-white"
        aria-label="Fermer"
        onClick={onClose}
      >
        <X className="h-8 w-8" />
      </button>
      {item.kind === 'photo' ? (
        <img
          src={src}
          alt={item.guest_name ? `Photo de ${item.guest_name}` : 'Photo'}
          className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <video
          src={src}
          controls
          autoPlay
          playsInline
          className="max-h-full max-w-full rounded-xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
}
