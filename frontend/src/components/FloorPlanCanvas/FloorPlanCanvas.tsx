import React, { useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';

interface FloorPlanCanvasProps {
  /** The image source URL to display on the canvas */
  imageSrc: string | null;
  /** Optional width override for the stage (defaults to image width) */
  width?: number;
  /** Optional height override for the stage (defaults to image height) */
  height?: number;
}

/**
 * Displays an uploaded floor plan image on a Konva Stage.
 * The stage auto-sizes to the image dimensions unless overridden.
 */
export const FloorPlanCanvas: React.FC<FloorPlanCanvasProps> = ({
  imageSrc,
  width,
  height,
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!imageSrc) {
      setImage(null);
      return;
    }

    const img = new window.Image();
    img.src = imageSrc;
    img.onload = () => {
      setImage(img);
    };
    img.onerror = () => {
      setImage(null);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageSrc]);

  const stageWidth = width ?? image?.naturalWidth ?? 800;
  const stageHeight = height ?? image?.naturalHeight ?? 600;

  if (!imageSrc) {
    return (
      <div data-testid="floor-plan-canvas-empty" className="flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg" style={{ width: stageWidth, height: stageHeight }}>
        <p className="text-gray-500">No floor plan loaded. Upload an image to get started.</p>
      </div>
    );
  }

  return (
    <div data-testid="floor-plan-canvas">
      <Stage width={stageWidth} height={stageHeight}>
        <Layer>
          {image && <KonvaImage image={image} width={stageWidth} height={stageHeight} />}
        </Layer>
      </Stage>
    </div>
  );
};
