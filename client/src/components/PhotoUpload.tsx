import { useRef, useState } from 'react';
import { Camera, X, Images } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export interface PhotoData {
  id: string;
  dataUrl: string;
  name: string;
}

interface PhotoUploadProps {
  photos: PhotoData[];
  onChange: (photos: PhotoData[]) => void;
  label: string;
  id?: string;
}

export function PhotoUpload({ photos, onChange, label, id }: PhotoUploadProps) {
  const [isCompressing, setIsCompressing] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsCompressing(true);

    const newPhotos: PhotoData[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
          fileType: 'image/jpeg',
          initialQuality: 0.7,
        });

        const dataUrl = await readAsDataURL(compressed);
        newPhotos.push({
          id: `${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
          dataUrl,
          name: file.name,
        });
      } catch {
        // fallback: read original
        const dataUrl = await readAsDataURL(file);
        newPhotos.push({
          id: `${Date.now()}-${i}-fallback`,
          dataUrl,
          name: file.name,
        });
      }
    }

    onChange([...photos, ...newPhotos]);
    setIsCompressing(false);

    // Reset inputs so the same file can be selected again
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const removePhoto = (photoId: string) => {
    onChange(photos.filter(p => p.id !== photoId));
  };

  const inputId = id || label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-semibold text-[#888] uppercase tracking-wider">{label}</span>

      {/* Photo strip */}
      {photos.length > 0 && (
        <div className="photo-strip">
          {photos.map(photo => (
            <div key={photo.id} className="relative flex-shrink-0">
              <img
                src={photo.dataUrl}
                alt={photo.name}
                className="photo-thumbnail"
              />
              <button
                type="button"
                onClick={() => removePhoto(photo.id)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#ef4444] flex items-center justify-center text-white border-2 border-[#1a1a1a] z-10"
                aria-label="Remove photo"
                data-testid={`remove-photo-${photo.id}`}
              >
                <X size={12} strokeWidth={3} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload buttons */}
      <div className="flex gap-2">
        {/* Camera button — takes a new photo with the rear camera */}
        <label
          htmlFor={`${inputId}-camera`}
          className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#252525] border-[1.5px] border-[#333] text-[#C9A84C] cursor-pointer active:bg-[#333] hover:border-[#C9A84C] transition-colors min-h-[48px] flex-1 justify-center font-medium text-sm select-none"
          data-testid={`photo-camera-${inputId}`}
        >
          <Camera size={18} />
          <span>Take Photo</span>
        </label>
        <input
          ref={cameraInputRef}
          id={`${inputId}-camera`}
          type="file"
          accept="image/jpeg,image/png,image/heic,image/heif"
          capture="environment"
          className="sr-only"
          onChange={e => handleFiles(e.target.files)}
        />

        {/*
          Gallery button — opens iPhone Photo Library directly.

          On iOS Safari, <input type="file" accept="image/..."> WITHOUT the
          capture attribute presents the "Photo Library / Take Photo / Choose File"
          action sheet. Most users tap "Photo Library" which goes straight into
          their camera roll / albums. Using specific MIME types (jpeg, png, heic)
          instead of the generic "image/*" helps iOS route to Photos instead of
          Files. The multiple attribute lets them pick several at once.
        */}
        <label
          htmlFor={`${inputId}-gallery`}
          className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#252525] border-[1.5px] border-[#333] text-[#C9A84C] cursor-pointer active:bg-[#333] hover:border-[#C9A84C] transition-colors min-h-[48px] flex-1 justify-center font-medium text-sm select-none"
          data-testid={`photo-gallery-${inputId}`}
        >
          <Images size={18} />
          <span>Photo Library</span>
        </label>
        <input
          ref={galleryInputRef}
          id={`${inputId}-gallery`}
          type="file"
          accept="image/jpeg,image/png,image/heic,image/heif"
          multiple
          className="sr-only"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {isCompressing && (
        <div className="text-xs text-[#C9A84C] animate-pulse">Compressing photos…</div>
      )}

      {photos.length > 0 && (
        <div className="text-xs text-[#666]">{photos.length} photo{photos.length !== 1 ? 's' : ''} attached</div>
      )}
    </div>
  );
}

function readAsDataURL(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
