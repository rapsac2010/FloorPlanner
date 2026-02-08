import React, { useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';

interface FloorPlanCanvasProps {
  /** The image source URL to display on the canvas */
  imageSrc: string | null;
  /** Optional width override for the stage (defaults to image width) */
  width?: number;
  /** Optional height override for the stage (defaults to image height) */
  height?: number;
  /** Handler for clicks on the stage (receives position in stage coordinates + modifier keys) */
  onStageClick?: (position: { x: number; y: number }, shiftKey: boolean) => void;
  /** Handler for mouse moves on the stage (receives position in stage coordinates + modifier keys) */
  onStageMouseMove?: (position: { x: number; y: number }, shiftKey: boolean) => void;
  /** Additional Konva layers to render above the image layer */
  children?: React.ReactNode;
}

/**
 * Displays an uploaded floor plan image on a Konva Stage.
 * The stage auto-sizes to the image dimensions unless overridden.
 * Accepts children (additional Konva layers) and an onStageClick handler.
 */
export const FloorPlanCanvas: React.FC<FloorPlanCanvasProps> = ({
  imageSrc,
  width,
  height,
  onStageClick,
  onStageMouseMove,
  children,
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
      <div data-testid="floor-plan-canvas-empty" className="flex items-center justify-center bg-white/50 border-2 border-dashed border-gray-200 rounded-2xl" style={{ width: stageWidth, height: stageHeight }}>
        <p className="text-gray-400 text-sm">No floor plan loaded. Upload an image to get started.</p>
      </div>
    );
  }

  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    if (!onStageClick) return;
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (pos) {
      onStageClick({ x: pos.x, y: pos.y }, e.evt.shiftKey);
    }
  };

  const handleStageMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!onStageMouseMove) return;
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (pos) {
      onStageMouseMove({ x: pos.x, y: pos.y }, e.evt.shiftKey);
    }
  };

  return (
    <div data-testid="floor-plan-canvas">
      <Stage width={stageWidth} height={stageHeight} onClick={handleStageClick} onMouseMove={handleStageMouseMove}>
        <Layer>
          {image && <KonvaImage image={image} width={stageWidth} height={stageHeight} />}
        </Layer>
        {children}
      </Stage>
    </div>
  );
};
