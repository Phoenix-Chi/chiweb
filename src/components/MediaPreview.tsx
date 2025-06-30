'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  const [localMedia, setLocalMedia] = useState<MediaItem[]>([]);
  
  useEffect(() => {
    setLocalMedia(Array.isArray(media) ? [...media] : [media]);
  }, [media]);

  const handleRemove = useCallback(async (index: number) => {
    try {
      // 先更新本地状态实现即时反馈
      setLocalMedia(prev => {
        const newMedia = [...prev];
        newMedia.splice(index, 1);
        return newMedia;
      });
      
      // 通知父组件
      if (onRemove) {
        await onRemove(index);
      }
    } catch (err) {
      // 恢复状态
      setLocalMedia(Array.isArray(media) ? [...media] : [media]);
      console.error('删除失败:', err);
    }
  }, [media, onRemove]);

  const mediaList = localMedia;
  return (
    <div style={{ width: '100%', display: 'flex', gap: '16px', justifyContent: 'center' }}>
      {mediaList.map((item, index) => (
        <div key={index} style={{
          position: 'relative',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          height: '90%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
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
              // width: '50%',
              // height: '50%',
              padding: '24px',
              display: 'flex',
            }}>
              <div style={{ 
                width: '100%',
                minHeight: '24px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <audio
                  controls
                  src={item.url}
                  style={{
                    width: '100%',
                    minWidth: '300px',
                    maxWidth: '500px',
                    height: '24px'
                  }}
                />
              </div>
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
              onClick={async (e) => {
                e.stopPropagation();
                e.preventDefault();
                await handleRemove(index);
              }}
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
