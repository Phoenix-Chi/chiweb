import { Image } from 'antd';

interface Media {
  url: string;
  type: 'image' | 'video' | 'audio';
  thumbnail?: string;
}

export default function MediaDisplay({ media }: { media: Media }) {
  if (!media) return null;
  
  if (media.type === 'image') {
    return (
      <div style={{ margin: '16px 0' }}>
        <Image
          src={media.url}
          alt="Media"
          width={400}
          height={300}
          style={{ objectFit: 'cover', borderRadius: '8px' }}
        />
      </div>
    );
  }

  if (media.type === 'video') {
    return (
      <div style={{ margin: '16px 0' }}>
        <video
          controls
          src={media.url}
          style={{ maxWidth: '100%', borderRadius: '8px' }}
        />
      </div>
    );
  }

  if (media.type === 'audio') {
    return (
      <div style={{ margin: '16px 0' }}>
        <audio
          controls
          src={media.url}
          style={{ width: '100%' }}
        />
      </div>
    );
  }

  return null;
}
