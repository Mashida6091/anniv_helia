import { useEffect, useRef, useState } from 'react';
import {
  Heart,
  LayoutGrid,
  QrCode,
  Upload,
  X,
} from 'lucide-react';

const LINKS = [
  { href: '#partager', label: 'Partager', icon: Upload },
  { href: '#album', label: 'Toutes les photos', icon: LayoutGrid },
];

const SITE_URL = 'https://birthday-website-int-tb3j.bolt.host/';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      ref={ref}
      className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <nav className="relative mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <a
          href="#top"
          className="flex items-center gap-2 font-display text-2xl text-kaki-500"
        >
          <Heart className="h-5 w-5 fill-kaki-400 text-kaki-400" />
          Helia
        </a>

        <div className="flex items-center gap-2">
          {/* desktop links */}
          <ul className="hidden md:flex items-center gap-1">
            {LINKS.map((l) => {
              const Icon = l.icon;
              return (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-marron-500 transition hover:bg-kaki-100/60"
                  >
                    <Icon className="h-4 w-4" />
                    {l.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={() => {
              setQrOpen((current) => !current);
              setOpen(false);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full text-marron-500 transition hover:bg-kaki-100/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-kaki-400"
            aria-label="Afficher le code QR du site"
            aria-expanded={qrOpen}
            aria-controls="site-qr-popover"
          >
            <QrCode className="h-5 w-5" />
          </button>

          {/* mobile toggle */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="md:hidden flex flex-col gap-1 p-2"
            aria-label="Menu"
            aria-expanded={open}
          >
            <span
              className={`h-0.5 w-6 bg-kaki-500 transition ${
                open ? 'translate-y-1.5 rotate-45' : ''
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-kaki-500 transition ${
                open ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-kaki-500 transition ${
                open ? '-translate-y-1.5 -rotate-45' : ''
              }`}
            />
          </button>

          {qrOpen && (
            <div
              id="site-qr-popover"
              role="dialog"
              aria-label="Code QR du site"
              className="absolute right-6 top-full z-50 mt-2 w-72 max-w-[calc(100vw-3rem)] rounded-2xl border border-kaki-100 bg-white p-4 text-center shadow-xl"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="font-medium text-marron-600">Partager le site</p>
                <button
                  type="button"
                  onClick={() => setQrOpen(false)}
                  className="rounded-full p-1.5 text-marron-500 transition hover:bg-kaki-100/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-kaki-400"
                  aria-label="Fermer le code QR"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mx-auto mb-3 flex w-fit items-center justify-center rounded-xl bg-white p-2">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(SITE_URL)}`}
                  alt="Code QR à scanner pour ouvrir le site de Helia"
                  className="h-48 w-48"
                  width="192"
                  height="192"
                />
              </div>
              <p className="mb-1 text-sm text-marron-500">
                Scanne ce code pour ouvrir le site.
              </p>
              <a
                href={SITE_URL}
                target="_blank"
                rel="noreferrer"
                className="break-all text-xs text-kaki-700 underline underline-offset-2"
              >
                birthday-website-int-tb3j.bolt.host
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* mobile menu */}
      {open && (
        <div className="md:hidden bg-white/90 backdrop-blur-md border-t border-kaki-100">
          <ul className="flex flex-col px-6 py-3">
            {LINKS.map((l) => {
              const Icon = l.icon;
              return (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 py-2.5 text-marron-500"
                  >
                    <Icon className="h-4 w-4" />
                    {l.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}
