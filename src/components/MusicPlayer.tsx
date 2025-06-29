'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';

const MusicControls = dynamic(
  () => import('./MusicControls'),
  { ssr: false }
);

export default function MusicPlayer() {
  useEffect(() => {
    // Initialize audio element
    const audio = document.getElementById('bgMusic') as HTMLAudioElement;
    if (audio) {
      audio.volume = 0.3;
    }
  }, []);

  return (
    <>
      <audio 
        id="bgMusic"
        autoPlay 
        loop 
        src="/media/Daylight.mp3" 
        style={{ display: 'none' }}
      />
      <MusicControls />
    </>
  );
}
