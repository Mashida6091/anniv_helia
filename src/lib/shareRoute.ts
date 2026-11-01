import { useEffect, useState } from 'react';
import { TABLE_NUMBERS } from '@/lib/media';

const PREFIX = '#partager/table-';

export function tableHref(tableNumber: number): string {
  return `${PREFIX}${tableNumber}`;
}

function tableFromHash(hash: string): number | null {
  if (!hash.startsWith(PREFIX)) return null;
  const n = Number(hash.slice(PREFIX.length));
  return TABLE_NUMBERS.includes(n) ? n : null;
}

export function useShareTable(): number | null {
  const [table, setTable] = useState(() => tableFromHash(window.location.hash));

  useEffect(() => {
    const onChange = () => setTable(tableFromHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return table;
}
