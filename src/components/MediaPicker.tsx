'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface UploadResponse {
  fileId: string;
  url: string;
  type: 'image' | 'video' | 'audio';
  thumbnail?: string;
  size: number;
  width?: number;
  height?: number;
}

export default function MediaPicker({ 
  onSelect,
  multiple = true 
}: {
  onSelect: (files: UploadResponse[]) => void;
  multiple?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tempFiles, setTempFiles] = useState<string[]>([]);
  const [previewFiles, setPreviewFiles] = useState<UploadResponse[]>([]);

  const handleUpload = useCallback(async (files: FileList) => {
    setUploading(true);
    setProgress(0);

    const results: UploadResponse[] = [];
    const totalFiles = files.length;

    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('isTemp', 'true');

      try {
        const response = await fetch('/api/media', {
          method: 'POST',
          body: formData,
        });
        const data = (await response.json()) as Partial<UploadResponse>;

        if (!response.ok) {
          throw new Error(`上传失败: ${response.statusText}`);
        }
        if (!data.fileId || !data.url || !data.type) {
          throw new Error('上传接口返回数据不完整');
        }
        const normalized: UploadResponse = {
          fileId: data.fileId,
          url: data.url,
          type: data.type,
          thumbnail: data.thumbnail,
          size: data.size ?? 0,
          width: data.width,
          height: data.height,
        };
        setTempFiles(prev => [...prev, normalized.fileId]);
        results.push(normalized);
        setProgress(Math.round(((i + 1) / totalFiles) * 100));
      } catch (error) {
        console.error('Upload failed:', error);
        // message.error(`文件上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
        continue; // 继续上传其他文件
      }
    }

    setUploading(false);
    if (results.length > 0) {
      setPreviewFiles(results);
      onSelect(results);
    }
  }, [onSelect]);

  useEffect(() => {
    return () => {
      if (tempFiles.length > 0) {
        fetch('/api/media/clean', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileIds: tempFiles })
        }).catch(err => {
          console.error('临时文件清理失败:', err);
        });
      }
    };
  }, [tempFiles]);

  const handleDelete = async (fileId: string, currentFiles: UploadResponse[]) => {
    try {
      const response = await fetch(`/api/media/${fileId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('删除失败');
      
      // 精确匹配文件ID
      const updatedFiles = currentFiles.filter((file) => file.fileId !== fileId);
      
      // 强制状态更新
      setTempFiles(prev => prev.filter(id => id !== fileId));
      setPreviewFiles([...updatedFiles]);
      onSelect([...updatedFiles]);
    } catch (err) {
      console.error('删除失败:', err);
      // message.error('文件删除失败，请稍后重试');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleUpload(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div 
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{
        border: '2px dashed #d9d9d9',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: '#fafafa',
      }}
    >
      {uploading ? (
        <div>
          <p>上传中... {progress}%</p>
          <div style={{ 
            width: '100%',
            backgroundColor: '#e6f7ff',
            borderRadius: '4px',
          }}>
            <div 
              style={{ 
                width: `${progress}%`,
                height: '24px',
                backgroundColor: '#1890ff',
                borderRadius: '4px',
              }} 
            />
          </div>
        </div>
      ) : (
        <>
          <Button onClick={() => document.getElementById('media-upload')?.click()}>
            选择文件
          </Button>
          <input
            type="file"
            onChange={handleFileChange}
            multiple={multiple}
            accept="image/*,video/*,audio/*"
            style={{ display: 'none' }}
            id="media-upload"
          />
          <p style={{ marginTop: '8px' }}>
            或拖放文件到此处
          </p>
          <p style={{ color: '#999', fontSize: '12px' }}>
            支持图片、音频、视频文件
          </p>
        </>
      )}
      {previewFiles.length > 0 && (
        <div style={{ marginTop: 12, textAlign: 'left' }}>
          {previewFiles.map((file) => (
            <div key={file.fileId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#555', fontSize: 12 }}>{file.url.split('/').pop()}</span>
              <button
                type="button"
                onClick={() => handleDelete(file.fileId, previewFiles)}
                style={{ color: '#d4380d', border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                删除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
