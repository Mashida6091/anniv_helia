import { useEffect, useRef, useState } from 'react';
import {
  Heart,
  LayoutGrid,
  Upload,
} from 'lucide-react';

const LINKS = [
  { href: '#partager', label: 'Partager', icon: Upload },
  { href: '#album', label: 'Album par table', icon: LayoutGrid },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
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
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <a
          href="#top"
          className="flex items-center gap-2 font-display text-2xl text-kaki-500"
        >
          <Heart className="h-5 w-5 fill-kaki-400 text-kaki-400" />
          Helia
        </a>

        {/* desktop */}
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

        {/* mobile toggle */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="md:hidden flex flex-col gap-1 p-2"
          aria-label="Menu"
        >
          <span
            className={`h-0.5 w-6 bg-kaki-500 transition ${open ? 'translate-y-1.5 rotate-45' : ''}`}
          />
          <span
            className={`h-0.5 w-6 bg-kaki-500 transition ${open ? 'opacity-0' : ''}`}
          />
          <span
            className={`h-0.5 w-6 bg-kaki-500 transition ${open ? '-translate-y-1.5 -rotate-45' : ''}`}
          />
        </button>
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
