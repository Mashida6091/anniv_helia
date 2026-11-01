import { useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { verifyAdminCode } from '@/lib/media';

type AdminUnlockProps = {
  unlocked: boolean;
  onUnlock: (code: string) => void;
};

export default function AdminUnlock({ unlocked, onUnlock }: AdminUnlockProps) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    const result = await verifyAdminCode(code);
    setBusy(false);
    if (result === 'ok') {
      onUnlock(code);
      setCode('');
    } else if (result === 'unauthorized') {
      setError('Code incorrect.');
    } else {
      setError('Vérification impossible pour l’instant.');
    }
  };

  if (unlocked) {
    return (
      <span className="inline-flex items-center gap-1.5 text-marron-500">
        <ShieldCheck className="h-4 w-4" />
        Mode organisateur actif — tu peux supprimer des souvenirs.
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Lock className="h-4 w-4 text-marron-500" />
      <input
        type="password"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && code && !busy && submit()}
        placeholder="Code organisateur…"
        className="w-40 rounded-full border border-kaki-200 bg-white/90 px-3 py-1.5 text-sm text-marron-600 placeholder:text-marron-300 focus:border-kaki-500 focus:outline-none focus:ring-2 focus:ring-kaki-200"
      />
      <button
        onClick={submit}
        disabled={busy || !code}
        className="rounded-full bg-marron-500 px-4 py-1.5 text-sm font-semibold text-white transition hover:scale-105 active:scale-95 disabled:opacity-50"
      >
        {busy ? '…' : 'Déverrouiller'}
      </button>
      {error && <span className="text-sm text-marron-600">{error}</span>}
    </div>
  );
}
