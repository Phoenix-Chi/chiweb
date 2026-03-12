'use client';

import { useState, useCallback } from 'react';
import MediaPicker from './MediaPicker';
import MediaPreview from './MediaPreview';
import { Card } from '@/components/ui/card';

type MediaType = 'image' | 'video' | 'audio';
interface MediaItem {
  fileId?: string;
  url: string;
  type: MediaType;
  thumbnail?: string;
}

export default function RichContentEditor({
  initialContent = [],
  onChange
}: {
  initialContent?: MediaItem[];
  onChange: (content: MediaItem[]) => void;
}) {
  const [content, setContent] = useState(initialContent);

  const handleAddMedia = useCallback((newMedia: MediaItem[]) => {
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
    <Card className="border-fuchsia-400/40 bg-slate-900/80 text-white">
      <div className="mb-4 text-lg font-semibold">富媒体内容编辑器</div>
      <div className="space-y-4">
        <MediaPicker onSelect={handleAddMedia} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {content.map((media, index) => (
            <div key={index}>
              <MediaPreview media={media} onRemove={() => handleRemoveMedia(index)} />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
