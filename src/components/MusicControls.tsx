'use client';

'use client';

import { useEffect, useState } from 'react';

export default function MusicControls() {
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Initialize from localStorage
    const savedVolume = localStorage.getItem('bgMusicVolume');
    const savedMuted = localStorage.getItem('bgMusicMuted');
    
    if (savedVolume) {
      setVolume(parseFloat(savedVolume));
    }
    if (savedMuted) {
      setMuted(savedMuted === 'true');
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      const audio = document.getElementById('bgMusic') as HTMLAudioElement;
      if (audio) {
        audio.volume = volume;
        audio.muted = muted;
      }
    }
  }, [volume, muted, isMounted]);

  const handleMuteToggle = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    localStorage.setItem('bgMusicMuted', String(newMuted));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    localStorage.setItem('bgMusicVolume', String(newVolume));
    if (newVolume > 0 && muted) {
      setMuted(false);
      localStorage.setItem('bgMusicMuted', 'false');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      right: '20px',
      bottom: '20px',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'rgba(252, 251, 251, 0.1)',
      padding: '8px 12px',
      borderRadius: '20px'
    }}>
      <button 
        onClick={handleMuteToggle}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'white',
          fontSize: '20px',
          cursor: 'pointer'
        }}
      >
        {muted ? '🔇' : '🔊'}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={handleVolumeChange}
        style={{
          width: '80px'
        }}
      />
    </div>
  );
}
