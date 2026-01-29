import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageUploader } from './ImageUploader';

// Mock the API client
vi.mock('../../api/client', () => ({
  uploadImage: vi.fn(),
}));

import { uploadImage } from '../../api/client';
const mockUploadImage = vi.mocked(uploadImage);

// Mock URL.createObjectURL
const mockCreateObjectURL = vi.fn(() => 'blob:mock-preview-url');
const mockRevokeObjectURL = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  window.URL.createObjectURL = mockCreateObjectURL;
  window.URL.revokeObjectURL = mockRevokeObjectURL;
});

function createMockFile(name: string, type: string): File {
  return new File(['fake-image-data'], name, { type });
}

describe('ImageUploader', () => {
  it('renders the upload button', () => {
    render(<ImageUploader onUpload={vi.fn()} />);
    expect(screen.getByTestId('upload-button')).toBeInTheDocument();
    expect(screen.getByText('Upload Floor Plan')).toBeInTheDocument();
  });

  it('has a hidden file input', () => {
    render(<ImageUploader onUpload={vi.fn()} />);
    const input = screen.getByTestId('file-input');
    expect(input).toHaveClass('hidden');
    expect(input).toHaveAttribute('accept', 'image/png,image/jpeg');
  });

  it('opens file dialog when button is clicked', async () => {
    const user = userEvent.setup();
    render(<ImageUploader onUpload={vi.fn()} />);

    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    await user.click(screen.getByTestId('upload-button'));
    expect(clickSpy).toHaveBeenCalled();
  });

  it('shows error for invalid file type', async () => {
    render(<ImageUploader onUpload={vi.fn()} />);

    const file = createMockFile('doc.pdf', 'application/pdf');
    const input = screen.getByTestId('file-input') as HTMLInputElement;

    // Use fireEvent because userEvent.upload respects the accept attribute
    // and silently filters out non-matching files
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    fireEvent.change(input);

    expect(screen.getByTestId('upload-error')).toHaveTextContent('Please select a PNG or JPEG image.');
  });

  it('shows preview after selecting a valid file', async () => {
    const user = userEvent.setup();
    mockUploadImage.mockResolvedValue({
      image_id: 'abc123',
      filename: 'plan.png',
      content_type: 'image/png',
      width: 800,
      height: 600,
    });

    render(<ImageUploader onUpload={vi.fn()} />);

    const file = createMockFile('plan.png', 'image/png');
    const input = screen.getByTestId('file-input');

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByTestId('upload-preview')).toBeInTheDocument();
    });
    expect(mockCreateObjectURL).toHaveBeenCalledWith(file);
  });

  it('calls onUpload with response after successful upload', async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn();
    const mockResponse = {
      image_id: 'abc123',
      filename: 'plan.png',
      content_type: 'image/png',
      width: 800,
      height: 600,
    };
    mockUploadImage.mockResolvedValue(mockResponse);

    render(<ImageUploader onUpload={onUpload} />);

    const file = createMockFile('plan.png', 'image/png');
    await user.upload(screen.getByTestId('file-input'), file);

    await waitFor(() => {
      expect(onUpload).toHaveBeenCalledWith(mockResponse);
    });
  });

  it('shows uploading state during upload', async () => {
    const user = userEvent.setup();
    // Create a promise we can control
    let resolveUpload: (value: Awaited<ReturnType<typeof uploadImage>>) => void;
    mockUploadImage.mockReturnValue(
      new Promise((resolve) => {
        resolveUpload = resolve;
      }),
    );

    render(<ImageUploader onUpload={vi.fn()} />);

    const file = createMockFile('plan.png', 'image/png');
    await user.upload(screen.getByTestId('file-input'), file);

    expect(screen.getByTestId('upload-button')).toHaveTextContent('Uploading...');
    expect(screen.getByTestId('upload-button')).toBeDisabled();

    // Resolve upload
    resolveUpload!({
      image_id: 'abc123',
      filename: 'plan.png',
      content_type: 'image/png',
      width: 800,
      height: 600,
    });

    await waitFor(() => {
      expect(screen.getByTestId('upload-button')).toHaveTextContent('Upload Floor Plan');
      expect(screen.getByTestId('upload-button')).not.toBeDisabled();
    });
  });

  it('shows error message when upload fails', async () => {
    const user = userEvent.setup();
    mockUploadImage.mockRejectedValue(new Error('File too large'));

    render(<ImageUploader onUpload={vi.fn()} />);

    const file = createMockFile('plan.png', 'image/png');
    await user.upload(screen.getByTestId('file-input'), file);

    await waitFor(() => {
      expect(screen.getByTestId('upload-error')).toHaveTextContent('File too large');
    });
  });

  it('clears previous error when selecting a new valid file', async () => {
    const user = userEvent.setup();
    mockUploadImage.mockRejectedValueOnce(new Error('Network error'));
    mockUploadImage.mockResolvedValueOnce({
      image_id: 'abc123',
      filename: 'plan.png',
      content_type: 'image/png',
      width: 800,
      height: 600,
    });

    render(<ImageUploader onUpload={vi.fn()} />);

    // First upload fails
    const file1 = createMockFile('plan.png', 'image/png');
    await user.upload(screen.getByTestId('file-input'), file1);

    await waitFor(() => {
      expect(screen.getByTestId('upload-error')).toBeInTheDocument();
    });

    // Second upload succeeds
    const file2 = createMockFile('plan2.png', 'image/png');
    await user.upload(screen.getByTestId('file-input'), file2);

    await waitFor(() => {
      expect(screen.queryByTestId('upload-error')).not.toBeInTheDocument();
    });
  });
});
