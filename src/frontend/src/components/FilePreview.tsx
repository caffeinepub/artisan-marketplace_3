import { useEffect, useState } from 'react';
import { FileImage, Music, Box } from 'lucide-react';

interface FilePreviewProps {
  blob: Uint8Array;
  className?: string;
}

export default function FilePreview({ blob, className = '' }: FilePreviewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'audio' | '3d' | 'unknown'>('unknown');

  useEffect(() => {
    if (!blob || blob.length === 0) {
      setFileType('unknown');
      return;
    }

    // Detect file type from blob signature
    const signature = Array.from(blob.slice(0, 4))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    let type: 'image' | 'audio' | '3d' | 'unknown' = 'unknown';
    let mimeType = 'application/octet-stream';

    // Image signatures
    if (signature.startsWith('ffd8ff')) {
      type = 'image';
      mimeType = 'image/jpeg';
    } else if (signature.startsWith('89504e47')) {
      type = 'image';
      mimeType = 'image/png';
    } else if (signature.startsWith('47494638')) {
      type = 'image';
      mimeType = 'image/gif';
    } else if (signature.startsWith('52494646')) {
      type = 'image';
      mimeType = 'image/webp';
    }
    // Audio signatures
    else if (signature.startsWith('494433') || signature.startsWith('fffb')) {
      type = 'audio';
      mimeType = 'audio/mpeg';
    } else if (signature.startsWith('4f676753')) {
      type = 'audio';
      mimeType = 'audio/ogg';
    }
    // 3D model (GLB/GLTF typically start with "glTF")
    else if (signature.startsWith('676c5446')) {
      type = '3d';
      mimeType = 'model/gltf-binary';
    }

    setFileType(type);

    if (type === 'image') {
      // Convert Uint8Array to a standard ArrayBuffer-backed Uint8Array for Blob compatibility
      const standardBlob = new Uint8Array(blob);
      const blobObj = new Blob([standardBlob.buffer], { type: mimeType });
      const url = URL.createObjectURL(blobObj);
      setImageUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [blob]);

  if (fileType === 'image' && imageUrl) {
    return <img src={imageUrl} alt="Item preview" className={className} />;
  }

  if (fileType === 'audio') {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <Music className="h-16 w-16 text-muted-foreground" />
      </div>
    );
  }

  if (fileType === '3d') {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <Box className="h-16 w-16 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center bg-muted ${className}`}>
      <FileImage className="h-16 w-16 text-muted-foreground" />
    </div>
  );
}
