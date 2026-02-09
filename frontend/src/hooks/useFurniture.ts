import { useState, useCallback } from 'react';
import type { FurnitureShape, FurnitureShapeType, Point } from '../types';

/** Drawing step within a tool */
export type DrawingStatus = 'idle' | 'placing-start' | 'placing-end' | 'awaiting-input';

/** Furniture editor state */
export interface FurnitureState {
  /** All shapes in the current furniture design */
  shapes: FurnitureShape[];
  /** ID of the currently selected shape (for highlighting/editing) */
  selectedShapeId: string | null;
  /** The active drawing tool, or null when idle */
  activeTool: FurnitureShapeType | null;
  /** Current step in the drawing workflow */
  drawingStatus: DrawingStatus;
  /** First point placed during drawing */
  activeStartPoint: Point | null;
  /** Second point placed during drawing */
  activeEndPoint: Point | null;
  /** Current cursor position for live preview */
  cursorPoint: Point | null;
}

export interface UseFurnitureReturn extends FurnitureState {
  /** Add a completed shape to the design */
  addShape: (shape: FurnitureShape) => void;
  /** Remove a shape by ID */
  removeShape: (id: string) => void;
  /** Remove all shapes */
  clearShapes: () => void;
  /** Select a shape by ID (pass null to deselect) */
  selectShape: (id: string | null) => void;
  /** Set the active drawing tool (pass null to stop drawing) */
  setActiveTool: (tool: FurnitureShapeType | null) => void;
  /** Handle a click on the editor canvas */
  handleCanvasClick: (point: Point) => void;
  /** Update cursor position for live preview */
  handleMouseMove: (point: Point) => void;
  /** Confirm a line with the given length in cm (from awaiting-input state) */
  confirmLine: (lengthCm: number) => void;
  /** Cancel the current drawing in progress */
  cancelDrawing: () => void;
  /** Whether the user is actively drawing (placing points) */
  isDrawing: boolean;
}

let nextId = 1;

/** Generate a unique furniture shape ID */
export function generateFurnitureId(): string {
  return `f-${nextId++}`;
}

/** Reset the ID counter (for testing) */
export function _resetFurnitureIdCounter(): void {
  nextId = 1;
}

const initialState: FurnitureState = {
  shapes: [],
  selectedShapeId: null,
  activeTool: null,
  drawingStatus: 'idle',
  activeStartPoint: null,
  activeEndPoint: null,
  cursorPoint: null,
};

/**
 * Hook for managing furniture editor state — tracks shapes,
 * selection, drawing tool, and the interactive drawing workflow.
 */
export const useFurniture = (): UseFurnitureReturn => {
  const [state, setState] = useState<FurnitureState>(initialState);

  const addShape = useCallback((shape: FurnitureShape) => {
    setState((prev) => ({
      ...prev,
      shapes: [...prev.shapes, shape],
    }));
  }, []);

  const removeShape = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      shapes: prev.shapes.filter((s) => s.id !== id),
      selectedShapeId: prev.selectedShapeId === id ? null : prev.selectedShapeId,
    }));
  }, []);

  const clearShapes = useCallback(() => {
    setState(initialState);
  }, []);

  const selectShape = useCallback((id: string | null) => {
    setState((prev) => ({
      ...prev,
      selectedShapeId: id,
    }));
  }, []);

  const setActiveTool = useCallback((tool: FurnitureShapeType | null) => {
    setState((prev) => ({
      ...prev,
      activeTool: tool,
      selectedShapeId: null,
      drawingStatus: tool ? 'placing-start' : 'idle',
      activeStartPoint: null,
      activeEndPoint: null,
      cursorPoint: null,
    }));
  }, []);

  const handleCanvasClick = useCallback((point: Point) => {
    setState((prev) => {
      if (!prev.activeTool) return prev;

      if (prev.drawingStatus === 'placing-start') {
        return {
          ...prev,
          drawingStatus: 'placing-end',
          activeStartPoint: point,
          cursorPoint: null,
        };
      }
      if (prev.drawingStatus === 'placing-end' && prev.activeStartPoint) {
        return {
          ...prev,
          drawingStatus: 'awaiting-input',
          activeEndPoint: point,
          cursorPoint: null,
        };
      }
      return prev;
    });
  }, []);

  const handleMouseMove = useCallback((point: Point) => {
    setState((prev) => {
      if (prev.drawingStatus !== 'placing-end') return prev;
      return { ...prev, cursorPoint: point };
    });
  }, []);

  const confirmLine = useCallback((lengthCm: number) => {
    setState((prev) => {
      if (
        prev.drawingStatus !== 'awaiting-input' ||
        prev.activeTool !== 'line' ||
        !prev.activeStartPoint ||
        !prev.activeEndPoint
      ) {
        return prev;
      }
      const newShape: FurnitureShape = {
        type: 'line',
        id: generateFurnitureId(),
        startPoint: prev.activeStartPoint,
        endPoint: prev.activeEndPoint,
        lengthCm,
      };
      return {
        ...prev,
        shapes: [...prev.shapes, newShape],
        drawingStatus: 'placing-start',
        activeStartPoint: null,
        activeEndPoint: null,
        cursorPoint: null,
      };
    });
  }, []);

  const cancelDrawing = useCallback(() => {
    setState((prev) => ({
      ...prev,
      drawingStatus: prev.activeTool ? 'placing-start' : 'idle',
      activeStartPoint: null,
      activeEndPoint: null,
      cursorPoint: null,
    }));
  }, []);

  const isDrawing = state.drawingStatus === 'placing-start' || state.drawingStatus === 'placing-end';

  return {
    ...state,
    addShape,
    removeShape,
    clearShapes,
    selectShape,
    setActiveTool,
    handleCanvasClick,
    handleMouseMove,
    confirmLine,
    cancelDrawing,
    isDrawing,
  };
};
