'use client';

import { useState, useCallback } from 'react';
import { Button, Card, Row, Col } from 'antd';
import MediaPicker from './MediaPicker';
import MediaPreview from './MediaPreview';

export default function RichContentEditor({
  initialContent = [],
  onChange
}: {
  initialContent?: Array<{ url: string; type: string }>;
  onChange: (content: Array<{ url: string; type: string }>) => void;
}) {
  const [content, setContent] = useState(initialContent);

  const handleAddMedia = useCallback((newMedia: Array<{ url: string; type: string }>) => {
    const updatedContent = [...content, ...newMedia];
    setContent(updatedContent);
    onChange(updatedContent);
  }, [content, onChange]);

  const handleRemoveMedia = useCallback((index: number) => {
    const updatedContent = content.filter((_, i) => i !== index);
    setContent(updatedContent);
    onChange(updatedContent);
  }, [content, onChange]);

  return (
    <Card title="富媒体内容编辑器">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <MediaPicker onSelect={handleAddMedia} />
        </Col>
        
        {content.map((media, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={6}>
            <MediaPreview 
              media={media} 
              onRemove={() => handleRemoveMedia(index)} 
            />
          </Col>
        ))}
      </Row>
    </Card>
  );
}
