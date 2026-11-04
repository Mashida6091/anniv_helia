import { useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SharePage from './components/SharePage';
import AllPhotosGallery from './components/AllPhotosGallery';
import { useShareTable } from '@/lib/shareRoute';

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
  const selectedTable = useShareTable();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploaded = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-marron-50 via-kaki-50 to-marron-50 text-gray-800">
      <Navbar />
      <main>
        <Hero />
        <SharePage
          selectedTable={selectedTable}
          onUploaded={handleUploaded}
          refreshKey={refreshKey}
        />
        {selectedTable === null && <AllPhotosGallery refreshKey={refreshKey} />}
      </main>
      <Footer />
    </div>
  );
}

export default App;
