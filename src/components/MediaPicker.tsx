'use client';

import { useState, useCallback } from 'react';
import { Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

export default function MediaPicker({ 
  onSelect,
  multiple = true 
}: {
  onSelect: (files: Array<{ url: string; type: string }>) => void;
  multiple?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tempFiles, setTempFiles] = useState<string[]>([]);

  const handleUpload = useCallback(async (files: FileList) => {
    setUploading(true);
    setProgress(0);

    const results = [];
    const totalFiles = files.length;

    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/media', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`上传失败: ${response.statusText}`);
        }

        const data = await response.json();
        results.push(data);
        setProgress(Math.round(((i + 1) / totalFiles) * 100));
      } catch (error) {
        console.error('Upload failed:', error);
        // message.error(`文件上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
        continue; // 继续上传其他文件
      }
    }

    setUploading(false);
    if (results.length > 0) {
      onSelect(results);
    } else {
      // message.error('没有文件上传成功');
    }
  }, [onSelect]);

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
          <Button 
            icon={<UploadOutlined />} 
            type="primary"
            onClick={() => document.getElementById('media-upload')?.click()}
          >
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
    </div>
  );
}
