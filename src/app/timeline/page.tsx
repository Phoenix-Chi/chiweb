'use client';
import React, { useEffect, useState } from 'react';
import NeonTimeline from './NeonTimeline';

const NEON_BG = 'linear-gradient(135deg, #1a0033 0%, #2d0b4e 100%)';

export default function TimelinePage() {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    setIsAdmin(window.localStorage.getItem('isAdmin') === '1');
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: NEON_BG, position: 'relative' }}>
      <NeonTimeline isAdmin={isAdmin} />
    </div>
  );
}
