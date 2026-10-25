import { ChevronDown, Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-16"
    >
      {/* gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-50 via-pink-100 to-amber-50" />

      {/* soft blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-pink-300/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-amber-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-rose-200/50 blur-3xl" />

      {/* content */}
      <div className="relative z-20 text-center">
        <div className="animate-fade-in-up mb-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-medium text-rose-500 shadow-sm backdrop-blur">
          <Sparkles className="h-4 w-4" />
          7 novembre · Joyeux Anniversaire
        </div>

        <h1 className="animate-fade-in-up font-display text-6xl md:text-8xl leading-tight">
          <span className="block bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 bg-clip-text text-transparent animate-shimmer">
            Happy Birthday
          </span>
          <span className="mt-2 block text-5xl md:text-7xl bg-gradient-to-r from-rose-500 via-pink-600 to-fuchsia-500 bg-clip-text text-transparent">
            Helia
          </span>
        </h1>

        <p
          className="animate-fade-in-up mx-auto mt-6 max-w-xl text-base md:text-lg text-rose-400/90"
          style={{ animationDelay: '0.2s' }}
        >
          Une petite page remplie d’amour, de douceur et de vœux — rien que
          pour toi, aujourd’hui et toujours.
        </p>

        <div
          className="animate-fade-in-up mt-10 flex flex-wrap items-center justify-center gap-4"
          style={{ animationDelay: '0.4s' }}
        >
          <a
            href="#photos"
            className="rounded-full border border-pink-300 bg-white/60 px-7 py-3 font-semibold text-pink-500 backdrop-blur transition hover:bg-pink-50"
          >
            Lire les vœux
          </a>
        </div>
      </div>

      {/* scroll hint */}
      <a
        href="#photos"
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-pink-400 transition hover:text-pink-500"
        aria-label="Défiler"
      >
        <ChevronDown className="h-7 w-7 animate-bounce" />
      </a>
    </section>
  );
}
