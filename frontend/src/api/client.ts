const API_BASE_URL = 'http://localhost:8000';

/** Response from the image upload endpoint. */
export interface UploadResponse {
  image_id: string;
  filename: string;
  content_type: string;
  width: number;
  height: number;
}

/**
 * Upload a floor plan image (PNG or JPEG) to the backend.
 * Returns metadata including the assigned image_id.
 */
export async function uploadImage(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload/`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(error.detail ?? 'Upload failed');
  }

  return response.json();
}

/**
 * Build the URL to retrieve an uploaded image by its ID.
 */
export function getImageUrl(imageId: string): string {
  return `${API_BASE_URL}/upload/${imageId}`;
}
