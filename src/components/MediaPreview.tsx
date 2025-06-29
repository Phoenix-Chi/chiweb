'use client';

import { Button, Image, Row, Col } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

interface MediaItem {
  url: string;
  type: 'image' | 'video' | 'audio';
  thumbnail?: string;
  width?: number;
  height?: number;
}

export default function MediaPreview({
  media,
  onRemove
}: {
  media: MediaItem | MediaItem[];
  onRemove?: (index?: number) => void;
}) {
  const mediaList = Array.isArray(media) ? media : [media];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {mediaList.map((item, index) => (
        <div key={index} style={{
          position: 'relative',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          height: '200px',
          // marginLeft: '60px',
          display: 'flex',
          justifyContent: 'center',
          backgroundColor: item.type === 'audio' ? '#f0f0f0' : 'transparent'
        }}>
          {item.type === 'image' && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
              height: '100%'
            }}>
              <Image
                src={item.thumbnail || item.url}
                alt="Preview"
                style={{
                  width: 'auto',
                  height: '100%',
                  maxWidth: '100%',
                  objectFit: 'contain'
                }}
                preview={{
                  src: item.url,
                  mask: null
                }}
              />
            </div>
          )}

          {item.type === 'audio' && (
            <div style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              // padding: '0 20px'
            }}>
              <audio
                controls
                src={item.url}
                style={{
                  width: '100%',
                  maxWidth: '400px',
                    objectFit: 'contain'
                }}
              />
            </div>
          )}

          {item.type === 'video' && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              // marginLeft: '20px',
              width: '100%',
              height: '100%'
            }}>
              <video
                controls
                poster={item.thumbnail}
                src={item.url}
                style={{
                  height: '100%',
                  width: 'auto',
                  maxWidth: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
          )}

          {onRemove && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onRemove(index)}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                zIndex: 1
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
