import { useState } from 'react';
import { Music, Music2 } from 'lucide-react';

export default function MusicToggle() {
  const [on, setOn] = useState(false);
  const [audio] = useState(() => {
    // Royalty-free celebratory tune (public domain).
    const a = new Audio(
      'https://cdn.pixabay.com/download/audio/2022/03/15/audio_8cb749ca5d.mp3?filename=fun-and-happy-11506.mp3'
    );
    a.loop = true;
    a.volume = 0.4;
    return a;
  });

  const toggle = async () => {
    if (on) {
      audio.pause();
      setOn(false);
    } else {
      try {
        await audio.play();
        setOn(true);
      } catch {
        // autoplay blocked — ignore
      }
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={on ? 'Couper la musique' : 'Activer la musique'}
      className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-pink-500 shadow-lg backdrop-blur-md transition hover:scale-110 active:scale-95"
    >
      {on ? (
        <Music className="h-5 w-5 animate-heartbeat" />
      ) : (
        <Music2 className="h-5 w-5" />
      )}
    </button>
  );
}
