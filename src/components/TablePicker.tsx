import { ArrowRight } from 'lucide-react';
import { TABLE_NUMBERS } from '@/lib/media';
import { tableHref } from '@/lib/shareRoute';

export default function TablePicker() {
  const lastThreeStart = TABLE_NUMBERS.length - 3;

  return (
    <div className="grid grid-cols-2 justify-items-center gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4">
      {TABLE_NUMBERS.map((n, i) => {
        const isLastThree = i >= lastThreeStart;
        const positionClass =
          i === lastThreeStart
            ? 'sm:col-start-1 md:col-start-2'
            : i === lastThreeStart + 1
              ? 'sm:col-start-3 md:col-start-3'
              : i === TABLE_NUMBERS.length - 1
                ? 'col-span-2 w-full max-w-44 justify-self-center sm:col-span-1 sm:max-w-none md:col-start-4'
                : '';

        return (
          <a
            key={n}
            href={tableHref(n)}
            aria-label={`Ouvrir l’album de la table ${n}`}
            style={{ animationDelay: `${i * 0.04}s` }}
            className={`animate-fade-in-up group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-full border border-kaki-200/80 bg-gradient-to-br from-white via-white to-kaki-50 p-4 text-center shadow-[0_10px_24px_rgba(92,74,60,0.11)] ring-1 ring-white/80 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-kaki-400 hover:shadow-[0_18px_36px_rgba(92,74,60,0.17)] focus:outline-none focus-visible:ring-2 focus-visible:ring-kaki-400 ${isLastThree ? positionClass : ''}`}
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
      })}
    </div>
  );
}
