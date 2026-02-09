import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Stage, Layer, Line, Circle, Rect, Text } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { FurnitureShape, FurnitureShapeType, Point } from '../../types';
import type { DrawingStatus } from '../../hooks/useFurniture';

/** Canvas dimensions for the furniture editor (in pixels) */
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

interface FurnitureEditorPanelProps {
  /** All shapes in the current design */
  shapes: FurnitureShape[];
  /** ID of the currently selected shape */
  selectedShapeId: string | null;
  /** The active drawing tool */
  activeTool: FurnitureShapeType | null;
  /** Current drawing workflow step */
  drawingStatus: DrawingStatus;
  /** First point placed during drawing */
  activeStartPoint: Point | null;
  /** Second point placed during drawing */
  activeEndPoint: Point | null;
  /** Current cursor position for live preview */
  cursorPoint: Point | null;
  /** Remove a shape by ID */
  onRemoveShape: (id: string) => void;
  /** Remove all shapes */
  onClearShapes: () => void;
  /** Select a shape (pass null to deselect) */
  onSelectShape: (id: string | null) => void;
  /** Set the active drawing tool */
  onSetActiveTool: (tool: FurnitureShapeType | null) => void;
  /** Handle canvas click for drawing */
  onCanvasClick: (point: Point) => void;
  /** Handle mouse move for live preview */
  onMouseMove: (point: Point) => void;
  /** Confirm line with length in cm */
  onConfirmLine: (lengthCm: number) => void;
  /** Cancel current drawing */
  onCancelDrawing: () => void;
  /** Close the editor */
  onClose: () => void;
  /** Pop out / pop in the editor */
  onTogglePopout: () => void;
  /** Whether the editor is currently popped out */
  isPoppedOut: boolean;
}

/**
 * The inner editor panel content — renders the Konva canvas, toolbar, and shape list.
 * Used both inline and inside the popout window.
 */
export const FurnitureEditorPanel: React.FC<FurnitureEditorPanelProps> = ({
  shapes,
  selectedShapeId,
  activeTool,
  drawingStatus,
  activeStartPoint,
  activeEndPoint,
  cursorPoint,
  onRemoveShape,
  onClearShapes,
  onSelectShape,
  onSetActiveTool,
  onCanvasClick,
  onMouseMove,
  onConfirmLine,
  onCancelDrawing,
  onClose,
  onTogglePopout,
  isPoppedOut,
}) => {
  const [lengthInput, setLengthInput] = useState('');
  const isPlacingPoints = drawingStatus === 'placing-start' || drawingStatus === 'placing-end';

  const handleLengthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(lengthInput);
    if (value > 0) {
      onConfirmLine(value);
      setLengthInput('');
    }
  };

  return (
    <div data-testid="furniture-editor-panel" className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-fp-teal border-b-2 border-fp-border">
        <h2 className="text-white font-bold text-sm" style={{ fontFamily: "'Fredoka One', cursive" }}>
          Furniture Editor
        </h2>
        <div className="flex gap-2">
          <button
            data-testid="furniture-popout-btn"
            onClick={onTogglePopout}
            className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold hover:bg-white/30 transition-all"
            title={isPoppedOut ? 'Pop back in' : 'Pop out to new window'}
          >
            {isPoppedOut ? 'Pop In' : 'Pop Out'}
          </button>
          <button
            data-testid="furniture-close-btn"
            onClick={onClose}
            className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold hover:bg-white/30 transition-all"
          >
            Close
          </button>
        </div>
      </div>

      {/* Body: canvas + sidebar */}
      <div className="flex flex-1 min-h-0">
        {/* Canvas area */}
        <div className="flex-1 p-4 overflow-auto flex items-start justify-center bg-gray-50">
          <div className="bg-white rounded-xl shadow-md border-2 border-fp-border overflow-hidden">
            <FurnitureCanvas
              shapes={shapes}
              selectedShapeId={selectedShapeId}
              activeStartPoint={activeStartPoint}
              activeEndPoint={activeEndPoint}
              cursorPoint={cursorPoint}
              drawingStatus={drawingStatus}
              onCanvasClick={isPlacingPoints ? onCanvasClick : undefined}
              onMouseMove={drawingStatus === 'placing-end' ? onMouseMove : undefined}
            />
          </div>
        </div>

        {/* Right sidebar — tool palette + drawing instructions + shape list */}
        <div className="w-56 flex-shrink-0 border-l-2 border-fp-border bg-fp-cream p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Tool palette */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-fp-teal mb-2 block">
              Drawing Tools
            </span>
            <div className="flex flex-col gap-1.5">
              {(['line', 'rectangle', 'circle'] as FurnitureShapeType[]).map((tool) => (
                <button
                  key={tool}
                  data-testid={`furniture-tool-${tool}`}
                  onClick={() => onSetActiveTool(activeTool === tool ? null : tool)}
                  className={`w-full px-3 py-2 rounded-full text-xs font-bold border-2 border-fp-border transition-all ${
                    activeTool === tool
                      ? 'bg-fp-teal text-white shadow-md'
                      : 'bg-white text-fp-teal-dark hover:bg-fp-sage-light'
                  }`}
                >
                  {tool.charAt(0).toUpperCase() + tool.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Drawing instructions */}
          {activeTool === 'line' && drawingStatus === 'placing-start' && (
            <div className="bg-fp-teal/10 rounded-xl px-3 py-2.5">
              <p data-testid="furniture-instruction" className="text-xs text-fp-teal-dark font-bold leading-relaxed">
                Click the start point of your line.
              </p>
              <button
                data-testid="furniture-cancel-drawing-btn"
                onClick={onCancelDrawing}
                className="mt-2 w-full px-3 py-1.5 bg-white text-gray-500 rounded-full text-xs font-bold shadow-sm border-2 border-fp-border hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          )}

          {activeTool === 'line' && drawingStatus === 'placing-end' && (
            <div className="bg-fp-teal/10 rounded-xl px-3 py-2.5">
              <p data-testid="furniture-instruction" className="text-xs text-fp-teal-dark font-bold leading-relaxed">
                Click the end point of your line.
              </p>
              <button
                data-testid="furniture-cancel-drawing-btn"
                onClick={onCancelDrawing}
                className="mt-2 w-full px-3 py-1.5 bg-white text-gray-500 rounded-full text-xs font-bold shadow-sm border-2 border-fp-border hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          )}

          {activeTool === 'line' && drawingStatus === 'awaiting-input' && (
            <div data-testid="furniture-length-form" className="bg-fp-teal/10 rounded-xl px-3 py-2.5">
              <p className="text-xs text-fp-teal-dark font-bold leading-relaxed mb-2">
                Enter the line length:
              </p>
              <form onSubmit={handleLengthSubmit} className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <input
                    data-testid="furniture-length-input"
                    type="number"
                    step="any"
                    min="0.1"
                    value={lengthInput}
                    onChange={(e) => setLengthInput(e.target.value)}
                    placeholder="Length"
                    className="flex-1 px-2 py-1.5 rounded-lg border-2 border-fp-border text-xs font-bold text-center focus:outline-none focus:border-fp-teal"
                    autoFocus
                  />
                  <span className="text-xs font-bold text-fp-teal-dark">cm</span>
                </div>
                <button
                  data-testid="furniture-confirm-line-btn"
                  type="submit"
                  className="w-full px-3 py-1.5 bg-fp-sage text-white rounded-full text-xs font-bold shadow-sm border-2 border-fp-border hover:bg-fp-sage-dark transition-all"
                >
                  Confirm
                </button>
                <button
                  data-testid="furniture-cancel-drawing-btn"
                  type="button"
                  onClick={() => { onCancelDrawing(); setLengthInput(''); }}
                  className="w-full px-3 py-1.5 bg-white text-gray-500 rounded-full text-xs font-bold shadow-sm border-2 border-fp-border hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </form>
            </div>
          )}

          {/* Shape list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-fp-teal">
                Shapes
              </span>
              {shapes.length > 0 && (
                <button
                  data-testid="furniture-clear-all-btn"
                  onClick={onClearShapes}
                  className="text-[10px] text-fp-orange font-bold hover:text-fp-orange-dark transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
            {shapes.length === 0 ? (
              <p data-testid="furniture-no-shapes" className="text-xs text-gray-400 italic">
                No shapes yet. Select a tool and draw on the canvas.
              </p>
            ) : (
              <div data-testid="furniture-shape-list" className="flex flex-col gap-1.5">
                {shapes.map((shape, index) => {
                  const isSelected = selectedShapeId === shape.id;
                  return (
                    <div
                      key={shape.id}
                      data-testid={`furniture-shape-${shape.id}`}
                      onClick={() => onSelectShape(isSelected ? null : shape.id)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl shadow-sm cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-fp-teal/15 ring-2 ring-fp-teal/40'
                          : 'bg-white/70 hover:bg-white/90'
                      }`}
                    >
                      <span className={`text-xs font-semibold ${isSelected ? 'text-fp-teal-dark' : 'text-gray-600'}`}>
                        #{index + 1}: {formatShapeLabel(shape)}
                      </span>
                      <button
                        data-testid={`furniture-delete-${shape.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveShape(shape.id);
                        }}
                        className="text-gray-300 hover:text-fp-orange text-sm font-bold transition-colors leading-none"
                        aria-label={`Delete shape ${index + 1}`}
                      >
                        &times;
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/** Format a shape's description for the list */
function formatShapeLabel(shape: FurnitureShape): string {
  switch (shape.type) {
    case 'line':
      return `Line ${shape.lengthCm.toFixed(1)} cm`;
    case 'rectangle':
      return `Rect ${shape.widthCm.toFixed(1)}×${shape.heightCm.toFixed(1)} cm`;
    case 'circle':
      return `Circle r=${shape.radiusCm.toFixed(1)} cm`;
  }
}

/**
 * Konva canvas that renders furniture shapes and the live drawing preview.
 */
const FurnitureCanvas: React.FC<{
  shapes: FurnitureShape[];
  selectedShapeId: string | null;
  activeStartPoint: Point | null;
  activeEndPoint: Point | null;
  cursorPoint: Point | null;
  drawingStatus: DrawingStatus;
  onCanvasClick?: (point: Point) => void;
  onMouseMove?: (point: Point) => void;
}> = ({ shapes, selectedShapeId, activeStartPoint, activeEndPoint, cursorPoint, drawingStatus, onCanvasClick, onMouseMove }) => {
  const handleClick = (e: KonvaEventObject<MouseEvent>) => {
    if (!onCanvasClick) return;
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (pos) onCanvasClick({ x: pos.x, y: pos.y });
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!onMouseMove) return;
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (pos) onMouseMove({ x: pos.x, y: pos.y });
  };

  const showPreview = drawingStatus === 'placing-end' && activeStartPoint && cursorPoint;
  const showConfirmLine = drawingStatus === 'awaiting-input' && activeStartPoint && activeEndPoint;

  return (
    <div data-testid="furniture-canvas">
      <Stage
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        style={{ cursor: onCanvasClick ? 'crosshair' : 'default' }}
      >
        <Layer>
          {/* White background */}
          <Rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="white" />
          {/* Grid lines for visual reference */}
          {Array.from({ length: Math.floor(CANVAS_WIDTH / 50) + 1 }).map((_, i) => (
            <Line
              key={`vgrid-${i}`}
              points={[i * 50, 0, i * 50, CANVAS_HEIGHT]}
              stroke="#f0f0f0"
              strokeWidth={1}
            />
          ))}
          {Array.from({ length: Math.floor(CANVAS_HEIGHT / 50) + 1 }).map((_, i) => (
            <Line
              key={`hgrid-${i}`}
              points={[0, i * 50, CANVAS_WIDTH, i * 50]}
              stroke="#f0f0f0"
              strokeWidth={1}
            />
          ))}
        </Layer>
        <Layer>
          {/* Render completed shapes */}
          {shapes.map((shape) => {
            const isSelected = selectedShapeId === shape.id;
            return (
              <React.Fragment key={shape.id}>
                {shape.type === 'line' && (
                  <>
                    <Line
                      points={[shape.startPoint.x, shape.startPoint.y, shape.endPoint.x, shape.endPoint.y]}
                      stroke={isSelected ? '#3A7F89' : '#4B9DA9'}
                      strokeWidth={isSelected ? 3 : 2}
                    />
                    <Circle
                      x={shape.startPoint.x}
                      y={shape.startPoint.y}
                      radius={isSelected ? 5 : 3}
                      fill={isSelected ? '#3A7F89' : '#4B9DA9'}
                    />
                    <Circle
                      x={shape.endPoint.x}
                      y={shape.endPoint.y}
                      radius={isSelected ? 5 : 3}
                      fill={isSelected ? '#3A7F89' : '#4B9DA9'}
                    />
                    <Text
                      x={(shape.startPoint.x + shape.endPoint.x) / 2 + 6}
                      y={(shape.startPoint.y + shape.endPoint.y) / 2 - 16}
                      text={`${shape.lengthCm.toFixed(1)} cm`}
                      fontSize={12}
                      fontStyle="bold"
                      fill="#3A7F89"
                    />
                  </>
                )}
                {shape.type === 'rectangle' && (
                  <>
                    <Rect
                      x={shape.x}
                      y={shape.y}
                      width={shape.widthCm * 2}
                      height={shape.heightCm * 2}
                      stroke={isSelected ? '#3A7F89' : '#4B9DA9'}
                      strokeWidth={isSelected ? 3 : 2}
                      fill="transparent"
                    />
                    <Text
                      x={shape.x + 4}
                      y={shape.y - 16}
                      text={`${shape.widthCm.toFixed(1)}×${shape.heightCm.toFixed(1)} cm`}
                      fontSize={12}
                      fontStyle="bold"
                      fill="#3A7F89"
                    />
                  </>
                )}
                {shape.type === 'circle' && (
                  <>
                    <Circle
                      x={shape.center.x}
                      y={shape.center.y}
                      radius={shape.radiusCm * 2}
                      stroke={isSelected ? '#3A7F89' : '#4B9DA9'}
                      strokeWidth={isSelected ? 3 : 2}
                      fill="transparent"
                    />
                    <Text
                      x={shape.center.x + shape.radiusCm * 2 + 6}
                      y={shape.center.y - 8}
                      text={`r=${shape.radiusCm.toFixed(1)} cm`}
                      fontSize={12}
                      fontStyle="bold"
                      fill="#3A7F89"
                    />
                  </>
                )}
              </React.Fragment>
            );
          })}

          {/* Live preview line (while placing-end) */}
          {showPreview && (
            <>
              <Line
                points={[activeStartPoint.x, activeStartPoint.y, cursorPoint.x, cursorPoint.y]}
                stroke="#4B9DA9"
                strokeWidth={2}
                dash={[6, 3]}
              />
              <Circle x={activeStartPoint.x} y={activeStartPoint.y} radius={4} fill="#4B9DA9" />
              <Circle x={cursorPoint.x} y={cursorPoint.y} radius={4} fill="#4B9DA9" />
            </>
          )}

          {/* Active start point indicator (before mouse has moved) */}
          {drawingStatus === 'placing-end' && activeStartPoint && !cursorPoint && (
            <Circle x={activeStartPoint.x} y={activeStartPoint.y} radius={4} fill="#4B9DA9" />
          )}

          {/* Confirmed line preview (awaiting length input) */}
          {showConfirmLine && (
            <>
              <Line
                points={[activeStartPoint.x, activeStartPoint.y, activeEndPoint.x, activeEndPoint.y]}
                stroke="#3A7F89"
                strokeWidth={3}
              />
              <Circle x={activeStartPoint.x} y={activeStartPoint.y} radius={5} fill="#3A7F89" />
              <Circle x={activeEndPoint.x} y={activeEndPoint.y} radius={5} fill="#3A7F89" />
              <Text
                x={(activeStartPoint.x + activeEndPoint.x) / 2 + 6}
                y={(activeStartPoint.y + activeEndPoint.y) / 2 - 16}
                text="? cm"
                fontSize={13}
                fontStyle="bold"
                fill="#3A7F89"
              />
            </>
          )}
        </Layer>
      </Stage>
    </div>
  );
};

// --- Pop-out window support ---

interface PopoutWindowProps {
  title: string;
  width?: number;
  height?: number;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Renders children into a separate browser window via createPortal.
 * Copies parent stylesheets into the new window for consistent styling.
 */
const PopoutWindow: React.FC<PopoutWindowProps> = ({
  title,
  width = 1100,
  height = 700,
  onClose,
  children,
}) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const windowRef = useRef<Window | null>(null);

  useEffect(() => {
    const left = window.screenX + Math.round((window.outerWidth - width) / 2);
    const top = window.screenY + Math.round((window.outerHeight - height) / 2);

    const newWindow = window.open(
      '',
      'furniture-editor',
      `width=${width},height=${height},left=${left},top=${top}`,
    );

    if (!newWindow) {
      onClose();
      return;
    }

    windowRef.current = newWindow;
    newWindow.document.title = title;

    // Copy stylesheets from parent
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => {
      newWindow.document.head.appendChild(el.cloneNode(true));
    });

    // Create render container
    const div = newWindow.document.createElement('div');
    div.id = 'furniture-popout-root';
    div.style.height = '100vh';
    newWindow.document.body.style.margin = '0';
    newWindow.document.body.appendChild(div);
    setContainer(div);

    const handleUnload = () => onClose();
    newWindow.addEventListener('beforeunload', handleUnload);

    return () => {
      newWindow.removeEventListener('beforeunload', handleUnload);
      newWindow.close();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!container) return null;
  return createPortal(children, container);
};

// --- Main exported component ---

interface FurnitureEditorProps {
  /** All shapes in the current design */
  shapes: FurnitureShape[];
  /** ID of the currently selected shape */
  selectedShapeId: string | null;
  /** The active drawing tool */
  activeTool: FurnitureShapeType | null;
  /** Current drawing workflow step */
  drawingStatus: DrawingStatus;
  /** First point placed during drawing */
  activeStartPoint: Point | null;
  /** Second point placed during drawing */
  activeEndPoint: Point | null;
  /** Current cursor position for live preview */
  cursorPoint: Point | null;
  /** Remove a shape by ID */
  onRemoveShape: (id: string) => void;
  /** Remove all shapes */
  onClearShapes: () => void;
  /** Select a shape (pass null to deselect) */
  onSelectShape: (id: string | null) => void;
  /** Set the active drawing tool */
  onSetActiveTool: (tool: FurnitureShapeType | null) => void;
  /** Handle canvas click for drawing */
  onCanvasClick: (point: Point) => void;
  /** Handle mouse move for live preview */
  onMouseMove: (point: Point) => void;
  /** Confirm line with length in cm */
  onConfirmLine: (lengthCm: number) => void;
  /** Cancel current drawing */
  onCancelDrawing: () => void;
  /** Whether the editor is open */
  isOpen: boolean;
  /** Open/close the editor */
  onToggleOpen: () => void;
}

/**
 * Furniture Editor — a dedicated panel for designing furniture shapes.
 * Renders inline as an overlay when open, or in a pop-out browser window.
 * Shows an "Open Editor" button in the sidebar when closed.
 */
export const FurnitureEditor: React.FC<FurnitureEditorProps> = ({
  shapes,
  selectedShapeId,
  activeTool,
  drawingStatus,
  activeStartPoint,
  activeEndPoint,
  cursorPoint,
  onRemoveShape,
  onClearShapes,
  onSelectShape,
  onSetActiveTool,
  onCanvasClick,
  onMouseMove,
  onConfirmLine,
  onCancelDrawing,
  isOpen,
  onToggleOpen,
}) => {
  const [isPoppedOut, setIsPoppedOut] = useState(false);

  const handleClose = () => {
    setIsPoppedOut(false);
    onToggleOpen();
  };

  const handleTogglePopout = () => {
    setIsPoppedOut((prev) => !prev);
  };

  const panelProps: FurnitureEditorPanelProps = {
    shapes,
    selectedShapeId,
    activeTool,
    drawingStatus,
    activeStartPoint,
    activeEndPoint,
    cursorPoint,
    onRemoveShape,
    onClearShapes,
    onSelectShape,
    onSetActiveTool,
    onCanvasClick,
    onMouseMove,
    onConfirmLine,
    onCancelDrawing,
    onClose: handleClose,
    onTogglePopout: handleTogglePopout,
    isPoppedOut,
  };

  // Sidebar toggle button (shown when editor is closed)
  if (!isOpen) {
    return (
      <button
        data-testid="furniture-open-btn"
        onClick={onToggleOpen}
        className="w-full px-4 py-2.5 bg-fp-teal text-white rounded-full text-sm font-bold shadow-sm border-2 border-fp-border hover:bg-fp-teal-dark hover:shadow-md transition-all"
      >
        Open Furniture Editor
      </button>
    );
  }

  // Popped-out mode — render in a separate browser window
  if (isPoppedOut) {
    return (
      <>
        <div data-testid="furniture-popout-placeholder" className="bg-fp-teal/10 rounded-xl px-3 py-2.5">
          <p className="text-xs text-fp-teal-dark font-bold leading-relaxed">
            Furniture Editor is open in a separate window.
          </p>
          <button
            data-testid="furniture-popin-btn"
            onClick={handleTogglePopout}
            className="mt-2 w-full px-3 py-2 bg-white text-fp-teal-dark rounded-full text-xs font-bold shadow-sm border-2 border-fp-border hover:bg-fp-sage-light transition-all"
          >
            Bring back here
          </button>
        </div>
        <PopoutWindow title="Furniture Editor — FloorPlanner" onClose={handleClose}>
          <FurnitureEditorPanel {...panelProps} />
        </PopoutWindow>
      </>
    );
  }

  // Inline mode — portal to document.body so it escapes sidebar stacking context
  return createPortal(
    <div
      data-testid="furniture-editor-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="w-[1100px] h-[700px] max-w-[95vw] max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl border-2 border-fp-border">
        <FurnitureEditorPanel {...panelProps} />
      </div>
    </div>,
    document.body,
  );
};
