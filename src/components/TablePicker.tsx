import { ArrowRight } from 'lucide-react';
import { TABLE_NUMBERS } from '@/lib/media';
import { tableHref } from '@/lib/shareRoute';

export default function TablePicker() {
  const centerRowStart = Math.max(0, TABLE_NUMBERS.length - 3);

  const renderTable = (n: number, i: number, inCenteredRow = false) => (
    <a
      key={n}
      href={tableHref(n)}
      aria-label={`Ouvrir l’album de la table ${n}`}
      style={{ animationDelay: `${i * 0.04}s` }}
      className={`animate-fade-in-up group relative flex aspect-square items-center justify-center overflow-hidden rounded-full border border-kaki-200/80 bg-gradient-to-br from-white via-white to-kaki-50 p-4 text-center shadow-[0_10px_24px_rgba(92,74,60,0.11)] ring-1 ring-white/80 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-kaki-400 hover:shadow-[0_18px_36px_rgba(92,74,60,0.17)] focus:outline-none focus-visible:ring-2 focus-visible:ring-kaki-400 ${
        inCenteredRow
          ? 'flex-none basis-[calc(50%_-_0.5rem)] sm:basis-[calc(33.333%_-_0.833rem)] md:basis-[calc(25%_-_0.9375rem)]'
          : 'w-full'
      }`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-2 rounded-full border border-kaki-100/90 transition duration-300 group-hover:border-kaki-300"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[1.125rem] rounded-full border border-white/90"
      />
      <span className="relative z-10 flex flex-col items-center gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-kaki-600">
          Table
        </span>
        <span className="font-display text-5xl leading-none text-marron-500 transition duration-300 group-hover:scale-110 md:text-6xl">
          {n}
        </span>
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-marron-500">
          Partager
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
        </span>
      </span>
    </a>
  );

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4">
        {TABLE_NUMBERS.slice(0, centerRowStart).map((n, i) => renderTable(n, i))}
      </div>
      <div className="flex flex-wrap justify-center gap-4 sm:gap-5">
        {TABLE_NUMBERS.slice(centerRowStart).map((n, i) =>
          renderTable(n, centerRowStart + i, true),
        )}
      </div>
    </div>
  );
}
