import { useRef, useEffect } from 'react';
import TablePicker from './TablePicker';
import TableSharePage from './TableSharePage';

type SharePageProps = {
  selectedTable: number | null;
  onUploaded: (tableNumber: number) => void;
  refreshKey: number;
};

export default function SharePage({
  selectedTable,
  onUploaded,
  refreshKey,
}: SharePageProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selectedTable]);

  return (
    <section id="partager" ref={sectionRef} className="relative w-full scroll-mt-20 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        {selectedTable === null ? (
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
          <TableSharePage
            key={selectedTable}
            tableNumber={selectedTable}
            onUploaded={onUploaded}
            refreshKey={refreshKey}
          />
        )}
      </div>
    </section>
  );
}
