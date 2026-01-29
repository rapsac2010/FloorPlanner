import { act, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FloorPlanCanvas } from './FloorPlanCanvas';

// Mock react-konva since Konva requires a real canvas
vi.mock('react-konva', () => ({
  Stage: ({ children, width, height }: { children: React.ReactNode; width: number; height: number }) => (
    <div data-testid="konva-stage" data-width={width} data-height={height}>{children}</div>
  ),
  Layer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="konva-layer">{children}</div>
  ),
  Image: ({ image, width, height }: { image: HTMLImageElement; width: number; height: number }) => (
    <img data-testid="konva-image" src={image?.src} data-width={width} data-height={height} />
  ),
}));

// Mock Image constructor for controlled loading
let mockImageInstances: HTMLImageElement[] = [];

const OriginalImage = window.Image;

beforeEach(() => {
  mockImageInstances = [];
  // Use a proper class to satisfy `new Image()` requirement
  window.Image = class MockImage extends OriginalImage {
    constructor() {
      super();
      Object.defineProperty(this, 'naturalWidth', { value: 1024, writable: true });
      Object.defineProperty(this, 'naturalHeight', { value: 768, writable: true });
      mockImageInstances.push(this);
    }
  } as typeof Image;
});

describe('FloorPlanCanvas', () => {
  it('renders empty state when no image is provided', () => {
    render(<FloorPlanCanvas imageSrc={null} />);
    expect(screen.getByTestId('floor-plan-canvas-empty')).toBeInTheDocument();
    expect(screen.getByText(/no floor plan loaded/i)).toBeInTheDocument();
  });

  it('does not render Konva stage when imageSrc is null', () => {
    render(<FloorPlanCanvas imageSrc={null} />);
    expect(screen.queryByTestId('konva-stage')).not.toBeInTheDocument();
  });

  it('renders Konva stage when imageSrc is provided', () => {
    render(<FloorPlanCanvas imageSrc="http://example.com/plan.png" />);
    expect(screen.getByTestId('floor-plan-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('konva-stage')).toBeInTheDocument();
  });

  it('loads the image from imageSrc', () => {
    render(<FloorPlanCanvas imageSrc="http://example.com/plan.png" />);
    expect(mockImageInstances).toHaveLength(1);
    expect(mockImageInstances[0].src).toBe('http://example.com/plan.png');
  });

  it('displays the image on the canvas after loading', async () => {
    render(<FloorPlanCanvas imageSrc="http://example.com/plan.png" />);

    await act(() => {
      mockImageInstances[0].onload?.(new Event('load'));
    });

    expect(screen.getByTestId('konva-image')).toBeInTheDocument();
  });

  it('uses image natural dimensions for stage size', async () => {
    render(<FloorPlanCanvas imageSrc="http://example.com/plan.png" />);

    await act(() => {
      mockImageInstances[0].onload?.(new Event('load'));
    });

    const stage = screen.getByTestId('konva-stage');
    expect(stage).toHaveAttribute('data-width', '1024');
    expect(stage).toHaveAttribute('data-height', '768');
  });

  it('uses provided width and height over image dimensions', () => {
    render(<FloorPlanCanvas imageSrc="http://example.com/plan.png" width={500} height={400} />);
    const stage = screen.getByTestId('konva-stage');
    expect(stage).toHaveAttribute('data-width', '500');
    expect(stage).toHaveAttribute('data-height', '400');
  });

  it('uses default dimensions before image loads', () => {
    render(<FloorPlanCanvas imageSrc="http://example.com/plan.png" />);
    const stage = screen.getByTestId('konva-stage');
    expect(stage).toHaveAttribute('data-width', '800');
    expect(stage).toHaveAttribute('data-height', '600');
  });

  it('does not show image before it loads', () => {
    render(<FloorPlanCanvas imageSrc="http://example.com/plan.png" />);
    expect(screen.queryByTestId('konva-image')).not.toBeInTheDocument();
  });

  it('clears image when imageSrc changes to null', async () => {
    const { rerender } = render(<FloorPlanCanvas imageSrc="http://example.com/plan.png" />);

    await act(() => {
      mockImageInstances[0].onload?.(new Event('load'));
    });

    expect(screen.getByTestId('konva-image')).toBeInTheDocument();

    rerender(<FloorPlanCanvas imageSrc={null} />);
    expect(screen.getByTestId('floor-plan-canvas-empty')).toBeInTheDocument();
    expect(screen.queryByTestId('konva-image')).not.toBeInTheDocument();
  });

  it('handles image load error gracefully', async () => {
    render(<FloorPlanCanvas imageSrc="http://example.com/bad.png" />);

    await act(() => {
      mockImageInstances[0].onerror?.(new Event('error'));
    });

    // Should still show the stage wrapper, but no image
    expect(screen.getByTestId('floor-plan-canvas')).toBeInTheDocument();
    expect(screen.queryByTestId('konva-image')).not.toBeInTheDocument();
  });
});
