import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import MediaUploadCard from './MediaUploadCard';
import { TABLE_NUMBERS } from '@/lib/media';
import { tableHref } from '@/lib/shareRoute';

type TableSharePageProps = {
  tableNumber: number;
  onUploaded: (tableNumber: number) => void;
};

const navButton =
  'inline-flex items-center gap-1.5 rounded-full border border-kaki-200 bg-white/70 px-4 py-2 text-sm font-medium text-marron-500 backdrop-blur transition hover:border-kaki-400 hover:bg-white';
const navDisabled =
  'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-marron-300';

export default function TableSharePage({ tableNumber, onUploaded }: TableSharePageProps) {
  const previous = tableNumber > TABLE_NUMBERS[0] ? tableNumber - 1 : null;
  const next = tableNumber < TABLE_NUMBERS[TABLE_NUMBERS.length - 1] ? tableNumber + 1 : null;

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8 flex items-center justify-between gap-3">
        <a href="#partager" className={navButton}>
          <ArrowLeft className="h-4 w-4" />
          Toutes les tables
        </a>
        <div className="flex items-center gap-2">
          {previous ? (
            <a href={tableHref(previous)} className={navButton} aria-label={`Table ${previous}`}>
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Table {previous}</span>
            </a>
          ) : (
            <span className={navDisabled} aria-hidden="true">
              <ChevronLeft className="h-4 w-4" />
            </span>
          )}
          {next ? (
            <a href={tableHref(next)} className={navButton} aria-label={`Table ${next}`}>
              <span className="hidden sm:inline">Table {next}</span>
              <ChevronRight className="h-4 w-4" />
            </a>
          ) : (
            <span className={navDisabled} aria-hidden="true">
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>

      <div className="mb-10 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-kaki-600">
          Partage ton souvenir
        </p>
        <h2 className="font-display text-6xl leading-none text-marron-500 md:text-7xl">
          Table {tableNumber}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-marron-500/90">
          Ajoute une photo ou une vidéo de ta table. Elle rejoindra l’album de
          la table {tableNumber}.
        </p>
      </div>

      <MediaUploadCard tableNumber={tableNumber} onUploaded={onUploaded} />
    </div>
  );
}
