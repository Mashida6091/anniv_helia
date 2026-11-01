import { ArrowRight } from 'lucide-react';
import { TABLE_NUMBERS } from '@/lib/media';
import { tableHref } from '@/lib/shareRoute';

export default function TablePicker() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-5">
      {TABLE_NUMBERS.map((n, i) => (
        <a
          key={n}
          href={tableHref(n)}
          style={{ animationDelay: `${i * 0.04}s` }}
          className="animate-fade-in-up group flex aspect-square flex-col items-center justify-center gap-1 rounded-3xl border border-kaki-200 bg-white/80 p-4 text-center shadow-md backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-kaki-400 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-kaki-400"
        >
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
        </a>
      ))}
    </div>
  );
}
