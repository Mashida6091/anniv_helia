import { useRef, useEffect } from 'react';
import TablePicker from './TablePicker';
import TableSharePage from './TableSharePage';
import { useShareTable } from '@/lib/shareRoute';

type SharePageProps = {
  onUploaded: (tableNumber: number) => void;
};

export default function SharePage({ onUploaded }: SharePageProps) {
  const table = useShareTable();
  const sectionRef = useRef<HTMLElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [table]);

  return (
    <section id="partager" ref={sectionRef} className="relative w-full scroll-mt-20 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        {table === null ? (
          <>
            <div className="mb-12 text-center">
              <h2 className="mb-3 font-display text-4xl text-marron-500 md:text-5xl">
                Partage ton souvenir
              </h2>
              <p className="mx-auto max-w-xl text-sm text-marron-500/90">
                Choisis ta table pour ouvrir sa page et y ajouter une photo.
              </p>
            </div>
            <TablePicker />
          </>
        ) : (
          <TableSharePage key={table} tableNumber={table} onUploaded={onUploaded} />
        )}
      </div>
    </section>
  );
}
