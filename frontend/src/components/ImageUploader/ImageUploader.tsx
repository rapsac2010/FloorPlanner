import React, { useCallback, useRef, useState } from 'react';
import type { UploadResponse } from '../../api/client';
import { uploadImage } from '../../api/client';


interface ImageUploaderProps {
  /** Called when an image is successfully uploaded */
  onUpload: (response: UploadResponse) => void;
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg'];

/**
 * File input component for uploading floor plan images.
 * Uploads a floor plan image to the backend.
 */
export const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Please select a PNG or JPEG image.');
        return;
      }

      setError(null);

      // Upload to backend
      setUploading(true);
      try {
        const response = await uploadImage(file);
        onUpload(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [onUpload],
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div data-testid="image-uploader" className="flex flex-col items-center gap-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        onChange={handleFileChange}
        className="hidden"
        data-testid="file-input"
      />

      <button
        type="button"
        onClick={handleClick}
        disabled={uploading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid="upload-button"
      >
        {uploading ? 'Uploading...' : 'Upload Floor Plan'}
      </button>

      {error && (
        <p data-testid="upload-error" className="text-red-600 text-sm">
          {error}
        </p>
      )}

    </div>
  );
};
