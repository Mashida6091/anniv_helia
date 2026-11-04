import { ChevronDown, Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-16"
    >
      {/* soft decorative highlights */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-kaki-300/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-marron-200/50 blur-3xl" />

      {/* content */}
      <div className="relative z-20 text-center">
        <div className="animate-fade-in-up mb-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-medium text-marron-500 shadow-sm backdrop-blur">
          <Sparkles className="h-4 w-4" />
          7 novembre · Joyeux Anniversaire
        </div>

        <h1 className="animate-fade-in-up font-display text-4xl leading-[1.3] sm:text-5xl md:text-8xl">
          <span className="block px-[0.08em] pb-[0.1em] bg-gradient-to-r from-kaki-500 via-marron-500 to-marron-500 bg-clip-text text-transparent animate-shimmer">
            Happy Birthday
          </span>
          <span className="mt-1 block px-[0.08em] pb-[0.1em] text-4xl leading-[1.3] sm:text-5xl md:text-7xl bg-gradient-to-r from-marron-500 via-kaki-600 to-marron-500 bg-clip-text text-transparent">
            Helia
          </span>
        </h1>

        <p
          className="animate-fade-in-up mx-auto mt-6 max-w-xl text-base md:text-lg text-marron-500/90"
          style={{ animationDelay: '0.2s' }}
        >
          Une page dédiée aux souvenirs pour célébrer cette belle occasion.
        </p>
      </div>

      {/* scroll hint */}
      <a
        href="#album"
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-kaki-400 transition hover:text-kaki-500"
        aria-label="Défiler"
      >
        <ChevronDown className="h-7 w-7 animate-bounce" />
      </a>
    </section>
  );
}
