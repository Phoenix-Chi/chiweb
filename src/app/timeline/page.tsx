'use client';
import React from 'react';
import { Card, Typography } from 'antd';
import NeonTimeline from './NeonTimeline';

const { Title } = Typography;

// 霓虹风格主色
const NEON_PINK = '#ff3ec8';
const NEON_PURPLE = '#7f5fff';
const NEON_BG = 'linear-gradient(135deg, #1a0033 0%, #2d0b4e 100%)';

export default function TimelinePage() {
  return (
    <div style={{ minHeight: '100vh', background: NEON_BG, padding: 32, position: 'relative' }}>
      {/* <Card style={{ maxWidth: 1300, margin: '0 auto', marginTop: 32, background: 'rgba(20,10,40,0.85)', boxShadow: `0 0 40px 0 ${NEON_PURPLE}` }}> */}
        {/* <Title level={3} style={{ color: NEON_PINK, textShadow: `0 0 8px ${NEON_PINK}` }}>时间轴</Title> */}
        <NeonTimeline />
      {/* </Card> */}
    </div>
  );
}
