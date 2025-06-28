import React, { useRef, useState } from 'react';
import Image from 'next/image';

const NEON_PINK = '#ff3ec8';
const NEON_PURPLE = '#ff5fff';
const NEON_BG = 'linear-gradient(10deg, #1a0033 0%,rgb(188, 151, 226) 100%)';

const items = [
  {
    id: 1,
    title: '获得奖学金',
    content: '在校获得国家奖学金',
    time: '2025-06-01',
    tag: '成就',
    media: [
      { type: 'image', url: '/media/image.png' },
      { type: 'audio', url: '/media/Daylight.mp3' }
    ]
  },
  {
    id: 2,
    title: '坚持早起',
    content: 30,
    time: '2025-06-05',
    tag: '习惯',
    media: []
  },
  {
    id: 3,
    title: '完成马拉松',
    content: '人生首次全马完赛',
    time: '2025-06-10',
    tag: '里程碑',
    media: [
      { type: 'video', url: '/media/mylivewallpapers-com-Goku-Rising-4K.mp4' }
    ]
  },
  {
    id: 4,
    title: '生日聚会',
    content: '与朋友共度生日',
    time: '2025-06-20',
    tag: '重要时刻',
    media: [
      { type: 'image', url: '/media/image.png' }
    ]
  },
];

const TIMELINE_ANGLE = -15; // 斜向角度
const NODE_BASE_SIZE = 90; // 节点基准大小
const NODE_MIN_SCALE = 0.4; // 最小缩放
const NODE_MAX_SCALE = 1.5; // 最大缩放
const VIEWPORT_CENTER = 700; // 视口中心点(px)
const NODE_GAP = 300; // 节点间距（沿主线方向）
const VISIBLE_NODE_COUNT = 15; // 渲染视口附近的节点数

export default function NeonTimeline({ isAdmin = false }: { isAdmin?: boolean }) {
  const [offset, setOffset] = useState(0); // 沿主线方向的偏移
  const [dragging, setDragging] = useState(false);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const dragStart = useRef(0);
  const offsetStart = useRef(0);

  // 拖动主线（沿主线方向）
  const onDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true);
    dragStart.current = e.pageX;
    offsetStart.current = offset;
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);
  };
  const onDragMove = (e: MouseEvent) => {
    // 拖动距离投影到主线方向
    const dx = e.pageX - dragStart.current;
    const dy = 0; // 只考虑横向拖动
    const rad = (TIMELINE_ANGLE * Math.PI) / 180;
    // 计算鼠标拖动在主线方向上的分量
    const delta = dx * Math.cos(rad) + dy * Math.sin(rad);
    setOffset(offsetStart.current + -delta);
  };
  const onDragEnd = () => {
    setDragging(false);
    window.removeEventListener('mousemove', onDragMove);
    window.removeEventListener('mouseup', onDragEnd);
  };

  // 斜向主线的起点
  const lineStart = { x: 0, y: 550 };
  // 无限主线，不设终点
  const lineLength = 99999;
  const lineEnd = {
    x: lineStart.x + lineLength * Math.cos((TIMELINE_ANGLE * Math.PI) / 180),
    y: lineStart.y + lineLength * Math.sin((TIMELINE_ANGLE * Math.PI) / 180),
  };

  // 渲染视口附近的节点（理论无限）
  const centerIdx = Math.round(offset / NODE_GAP);
  const nodeIndices = Array.from({ length: VISIBLE_NODE_COUNT }, (_, i) => i + centerIdx - Math.floor(VISIBLE_NODE_COUNT / 2));

  // 点击节点时自动居中并显示详情
  const handleNodeClick = (nodeIdx: number, x: number) => {
    // 计算需要的 offset 使节点居中
    const targetOffset = nodeIdx * NODE_GAP - (VIEWPORT_CENTER - lineStart.x) / Math.cos((TIMELINE_ANGLE * Math.PI) / 180);
    setOffset(targetOffset);
    setSelectedNode(nodeIdx);
  };

  return (
    <div style={{ minHeight: '100vh', background: NEON_BG, position: 'relative', overflow: 'hidden' }}>
      <div
        style={{ width: '100vw', height: 700, cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' }}
        onMouseDown={onDragStart}
      >
        <svg width="100vw" height="700" style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
          {/* 无限主线 */}
          <defs>
            <linearGradient id="neonLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={NEON_PINK} />
              <stop offset="100%" stopColor={NEON_PURPLE} />
            </linearGradient>
            <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor={NEON_PINK} floodOpacity="0.8" />
              <feDropShadow dx="0" dy="0" stdDeviation="24" floodColor={NEON_PURPLE} floodOpacity="0.7" />
            </filter>
          </defs>
          <line
            x1={lineStart.x}
            y1={lineStart.y}
            x2={lineEnd.x}
            y2={lineEnd.y}
            stroke="url(#neonLine)"
            strokeWidth="10"
            filter="url(#neonGlow)"
            strokeLinecap="round"
          />
        </svg>
        {/* 无限节点 */}
        {nodeIndices.map((nodeIdx, i) => {
          // 节点在主线上的距离
          const pos = nodeIdx * NODE_GAP - offset;
          // 计算三角中心点坐标
          const x = lineStart.x + pos * Math.cos((TIMELINE_ANGLE * Math.PI) / 180);
          const y = lineStart.y + pos * Math.sin((TIMELINE_ANGLE * Math.PI) / 180);
          // 计算缩放：距离视口中心越近越大
          const dist = Math.abs(x - VIEWPORT_CENTER);
          const scale = Math.max(NODE_MIN_SCALE, NODE_MAX_SCALE - dist / 300);
          const opacity = Math.max(0.2, 1 - dist / 900);
          // 节点内容循环取自 items
          const item = items[((nodeIdx % items.length) + items.length) % items.length];
          // 三角颜色
          const TRIANGLE_COLOR = 'rgb(246,209,251)';
          // 圆圈颜色
          const CIRCLE_COLOR = 'rgb(245, 192, 212)';
          return (
            <div
              key={nodeIdx}
              style={{
                position: 'absolute',
                left: x - NODE_BASE_SIZE / 2 * scale,
                top: y - NODE_BASE_SIZE / 2 * scale*1.2,
                width: NODE_BASE_SIZE * scale,
                height: NODE_BASE_SIZE * scale,
                zIndex: 2,
                opacity,
                transition: dragging ? 'none' : 'all 0.3s cubic-bezier(.4,2,.6,1)',
                pointerEvents: 'auto',
              }}
              title={item.title}
              onClick={e => {
                e.stopPropagation();
                handleNodeClick(nodeIdx, x);
              }}
            >
              {/* 时间日期（上方） */}
              <div style={{
                position: 'absolute',
                bottom: '110%',
                left: '50%',
                transform: 'translateX(-50%) rotate(3deg)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 16 * scale,
                textShadow: `0 0 8px ${TRIANGLE_COLOR}`,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}>{item.time}</div>
              <svg width="100%" height="100%" viewBox="0 0 60 60" style={{ filter: 'drop-shadow(0 0 24px rgb(246,209,251))' }}>
                <polygon
                  points="30,8 56,52 6,48"
                  fill="rgba(246,209,251,0.12)"
                  stroke={TRIANGLE_COLOR}
                  strokeWidth="5"
                  style={{ transition: 'filter 0.2s, transform 0.2s' }}
                />
                <circle cx="30" cy="36" r="7" fill={CIRCLE_COLOR} opacity="0.5" />
              </svg>
              {/* 标题（下方） */}
              <div style={{
                position: 'absolute',
                top: '110%',
                left: '50%',
                transform: 'translateX(-50%) rotate(5deg)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 16 * scale,
                textShadow: `0 0 8px ${TRIANGLE_COLOR}`,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}>{item.title}</div>
            </div>
          );
        })}
        {/* 详情展示区域 */}
        {selectedNode !== null && (() => {
          const idx = selectedNode;
          const item = items[((idx % items.length) + items.length) % items.length];
          return (
            <div style={{
              position: 'absolute',
              left: '50%',
              top: 120,
              transform: 'translateX(-50%)',
              minWidth: 420,
              maxWidth: 600,
              background: 'rgba(30,20,60,0.98)',
              border: '2px solid #ff3ec8',
              borderRadius: 18,
              boxShadow: '0 0 32px #ff3ec8',
              color: '#fff',
              zIndex: 99,
              padding: 32,
              textAlign: 'center',
              fontSize: 18,
            }}>
              <div style={{ fontWeight: 700, fontSize: 28, marginBottom: 8 }}>{item.title}</div>
              <div style={{ color: '#ffb3fa', fontWeight: 500, marginBottom: 8 }}>{item.time} <span style={{ marginLeft: 12, color: '#7f5fff' }}>{item.tag}</span></div>
              <div style={{ marginBottom: 16 }}>{typeof item.content === 'number' ? item.content : (item.content || '-')}</div>
              {/* 多媒体内容展示 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                {item.media && item.media.map((media, idx) => {
                  if (media.type === 'image') return <Image key={idx} src={media.url} alt="img" width={320} height={200} style={{ maxWidth: 320, borderRadius: 8, boxShadow: '0 0 12px #ff3ec8', height: 'auto' }} />;
                  if (media.type === 'audio') return <audio key={idx} src={media.url} controls style={{ width: 320 }} />;
                  if (media.type === 'video') return <video key={idx} src={media.url} controls style={{ width: 320, borderRadius: 8, boxShadow: '0 0 12px #ff3ec8' }} />;
                  return null;
                })}
              </div>
              <button style={{ marginTop: 12, background: '#ff3ec8', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 32px', fontWeight: 700, fontSize: 18, boxShadow: '0 0 8px #ff3ec8' }} onClick={() => setSelectedNode(null)}>关闭</button>
            </div>
          );
        })()}
        {isAdmin && (
          <div style={{ position: 'absolute', left: 40, bottom: 40, zIndex: 10, display: 'flex', gap: 16 }}>
            <button style={{ background: '#ff3ec8', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, fontSize: 18, boxShadow: '0 0 16px #ff3ec8' }} onClick={() => alert('新增节点功能开发中')}>新增节点</button>
            <button style={{ background: '#7f5fff', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, fontSize: 18, boxShadow: '0 0 16px #7f5fff' }} onClick={() => alert('请点击节点进行编辑/删除')}>编辑节点</button>
            <button style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, fontSize: 18, boxShadow: '0 0 16px #888' }} onClick={() => {
              window.localStorage.removeItem('isAdmin');
              window.location.reload();
            }}>退出管理员模式</button>
          </div>
        )}
      </div>
    </div>
  );
}
