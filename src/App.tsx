import { Heart, Sparkles } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PhotoWall from './components/PhotoWall';
import VideoWall from './components/VideoWall';
import MediaMosaic from './components/MediaMosaic';
import MusicToggle from './components/MusicToggle';

function Footer() {
  return (
    <footer className="relative px-6 py-12 text-center">
      <div className="mx-auto max-w-2xl">
        <div className="mb-3 inline-flex items-center gap-1.5 text-kaki-600">
          <Sparkles className="h-4 w-4" />
          <span className="font-display text-2xl">Pour Helia, avec amour</span>
          <Sparkles className="h-4 w-4" />
        </div>
        <p className="text-sm text-marron-500/80">
          Fait avec <Heart className="inline h-3 w-3 fill-kaki-400 text-kaki-400" />{' '}
          le 7 novembre.
        </p>
      </div>
    </footer>
  );
}

function App() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-marron-50 via-kaki-50 to-marron-50 text-gray-800">
      <Navbar />
      <main>
        <Hero />
        <PhotoWall />
        <VideoWall />
        <MediaMosaic />
      </main>
      <Footer />

      <MusicToggle />
    </div>
  );
}

export default App;
