import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useFurniture, _resetFurnitureIdCounter, generateFurnitureId } from './useFurniture';
import type { FurnitureShape } from '../types';

const makeLine = (id: string): FurnitureShape => ({
  type: 'line',
  id,
  startPoint: { x: 0, y: 0 },
  endPoint: { x: 100, y: 0 },
  lengthCm: 50,
});

const makeRect = (id: string): FurnitureShape => ({
  type: 'rectangle',
  id,
  x: 10,
  y: 20,
  widthCm: 80,
  heightCm: 60,
});

describe('useFurniture', () => {
  beforeEach(() => {
    _resetFurnitureIdCounter();
  });

  it('starts with empty shapes and no active tool', () => {
    const { result } = renderHook(() => useFurniture());
    expect(result.current.shapes).toEqual([]);
    expect(result.current.selectedShapeId).toBeNull();
    expect(result.current.activeTool).toBeNull();
    expect(result.current.drawingStatus).toBe('idle');
    expect(result.current.activeStartPoint).toBeNull();
    expect(result.current.activeEndPoint).toBeNull();
    expect(result.current.cursorPoint).toBeNull();
    expect(result.current.isDrawing).toBe(false);
  });

  it('adds a shape', () => {
    const { result } = renderHook(() => useFurniture());
    const line = makeLine('f-1');
    act(() => result.current.addShape(line));
    expect(result.current.shapes).toHaveLength(1);
    expect(result.current.shapes[0]).toEqual(line);
  });

  it('adds multiple shapes', () => {
    const { result } = renderHook(() => useFurniture());
    act(() => result.current.addShape(makeLine('f-1')));
    act(() => result.current.addShape(makeRect('f-2')));
    expect(result.current.shapes).toHaveLength(2);
    expect(result.current.shapes[0].type).toBe('line');
    expect(result.current.shapes[1].type).toBe('rectangle');
  });

  it('removes a shape by ID', () => {
    const { result } = renderHook(() => useFurniture());
    act(() => result.current.addShape(makeLine('f-1')));
    act(() => result.current.addShape(makeRect('f-2')));
    act(() => result.current.removeShape('f-1'));
    expect(result.current.shapes).toHaveLength(1);
    expect(result.current.shapes[0].id).toBe('f-2');
  });

  it('ignores remove for non-existent ID', () => {
    const { result } = renderHook(() => useFurniture());
    act(() => result.current.addShape(makeLine('f-1')));
    act(() => result.current.removeShape('f-999'));
    expect(result.current.shapes).toHaveLength(1);
  });

  it('clears all shapes', () => {
    const { result } = renderHook(() => useFurniture());
    act(() => result.current.addShape(makeLine('f-1')));
    act(() => result.current.addShape(makeRect('f-2')));
    act(() => result.current.clearShapes());
    expect(result.current.shapes).toEqual([]);
    expect(result.current.selectedShapeId).toBeNull();
    expect(result.current.activeTool).toBeNull();
  });

  it('selects a shape by ID', () => {
    const { result } = renderHook(() => useFurniture());
    act(() => result.current.addShape(makeLine('f-1')));
    act(() => result.current.selectShape('f-1'));
    expect(result.current.selectedShapeId).toBe('f-1');
  });

  it('deselects when passing null', () => {
    const { result } = renderHook(() => useFurniture());
    act(() => result.current.addShape(makeLine('f-1')));
    act(() => result.current.selectShape('f-1'));
    act(() => result.current.selectShape(null));
    expect(result.current.selectedShapeId).toBeNull();
  });

  it('clears selection when selected shape is removed', () => {
    const { result } = renderHook(() => useFurniture());
    act(() => result.current.addShape(makeLine('f-1')));
    act(() => result.current.addShape(makeRect('f-2')));
    act(() => result.current.selectShape('f-1'));
    act(() => result.current.removeShape('f-1'));
    expect(result.current.selectedShapeId).toBeNull();
  });

  it('keeps selection when a different shape is removed', () => {
    const { result } = renderHook(() => useFurniture());
    act(() => result.current.addShape(makeLine('f-1')));
    act(() => result.current.addShape(makeRect('f-2')));
    act(() => result.current.selectShape('f-2'));
    act(() => result.current.removeShape('f-1'));
    expect(result.current.selectedShapeId).toBe('f-2');
  });

  it('sets the active drawing tool', () => {
    const { result } = renderHook(() => useFurniture());
    act(() => result.current.setActiveTool('line'));
    expect(result.current.activeTool).toBe('line');
  });

  it('clears selection when activating a tool', () => {
    const { result } = renderHook(() => useFurniture());
    act(() => result.current.addShape(makeLine('f-1')));
    act(() => result.current.selectShape('f-1'));
    act(() => result.current.setActiveTool('rectangle'));
    expect(result.current.selectedShapeId).toBeNull();
    expect(result.current.activeTool).toBe('rectangle');
  });

  it('deactivates tool when passing null', () => {
    const { result } = renderHook(() => useFurniture());
    act(() => result.current.setActiveTool('circle'));
    act(() => result.current.setActiveTool(null));
    expect(result.current.activeTool).toBeNull();
  });

  it('generates unique IDs', () => {
    const id1 = generateFurnitureId();
    const id2 = generateFurnitureId();
    expect(id1).toBe('f-1');
    expect(id2).toBe('f-2');
    expect(id1).not.toBe(id2);
  });

  // --- Drawing workflow tests ---

  it('sets drawingStatus to placing-start when activating line tool', () => {
    const { result } = renderHook(() => useFurniture());
    act(() => result.current.setActiveTool('line'));
    expect(result.current.drawingStatus).toBe('placing-start');
    expect(result.current.isDrawing).toBe(true);
  });

  it('resets drawing state when deactivating tool', () => {
    const { result } = renderHook(() => useFurniture());
    act(() => result.current.setActiveTool('line'));
    act(() => result.current.handleCanvasClick({ x: 50, y: 50 }));
    act(() => result.current.setActiveTool(null));
    expect(result.current.drawingStatus).toBe('idle');
    expect(result.current.activeStartPoint).toBeNull();
    expect(result.current.isDrawing).toBe(false);
  });

  it('places start point on first canvas click', () => {
    const { result } = renderHook(() => useFurniture());
    act(() => result.current.setActiveTool('line'));
    act(() => result.current.handleCanvasClick({ x: 100, y: 200 }));
    expect(result.current.drawingStatus).toBe('placing-end');
    expect(result.current.activeStartPoint).toEqual({ x: 100, y: 200 });
    expect(result.current.isDrawing).toBe(true);
  });

  it('places end point on second canvas click', () => {
    const { result } = renderHook(() => useFurniture());
    act(() => result.current.setActiveTool('line'));
    act(() => result.current.handleCanvasClick({ x: 100, y: 200 }));
    act(() => result.current.handleCanvasClick({ x: 400, y: 300 }));
    expect(result.current.drawingStatus).toBe('awaiting-input');
    expect(result.current.activeEndPoint).toEqual({ x: 400, y: 300 });
    expect(result.current.isDrawing).toBe(false);
  });

  it('ignores canvas click when no tool is active', () => {
    const { result } = renderHook(() => useFurniture());
    act(() => result.current.handleCanvasClick({ x: 100, y: 200 }));
    expect(result.current.drawingStatus).toBe('idle');
    expect(result.current.activeStartPoint).toBeNull();
  });

  it('tracks cursor position during placing-end', () => {
    const { result } = renderHook(() => useFurniture());
    act(() => result.current.setActiveTool('line'));
    act(() => result.current.handleCanvasClick({ x: 50, y: 50 }));
    act(() => result.current.handleMouseMove({ x: 150, y: 200 }));
    expect(result.current.cursorPoint).toEqual({ x: 150, y: 200 });
  });

  it('ignores mouse move when not placing-end', () => {
    const { result } = renderHook(() => useFurniture());
    act(() => result.current.setActiveTool('line'));
    // placing-start — should ignore
    act(() => result.current.handleMouseMove({ x: 50, y: 50 }));
    expect(result.current.cursorPoint).toBeNull();
  });

  it('confirms a line with the given length', () => {
    const { result } = renderHook(() => useFurniture());
    act(() => result.current.setActiveTool('line'));
    act(() => result.current.handleCanvasClick({ x: 0, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 200, y: 0 }));
    act(() => result.current.confirmLine(120));

    expect(result.current.shapes).toHaveLength(1);
    expect(result.current.shapes[0].type).toBe('line');
    if (result.current.shapes[0].type === 'line') {
      expect(result.current.shapes[0].startPoint).toEqual({ x: 0, y: 0 });
      expect(result.current.shapes[0].endPoint).toEqual({ x: 200, y: 0 });
      expect(result.current.shapes[0].lengthCm).toBe(120);
    }
    // Returns to placing-start for next line
    expect(result.current.drawingStatus).toBe('placing-start');
    expect(result.current.activeStartPoint).toBeNull();
    expect(result.current.activeEndPoint).toBeNull();
  });

  it('confirmLine does nothing when not in awaiting-input', () => {
    const { result } = renderHook(() => useFurniture());
    act(() => result.current.setActiveTool('line'));
    act(() => result.current.confirmLine(100));
    expect(result.current.shapes).toHaveLength(0);
  });

  it('confirmLine does nothing when tool is not line', () => {
    const { result } = renderHook(() => useFurniture());
    act(() => result.current.setActiveTool('rectangle'));
    act(() => result.current.handleCanvasClick({ x: 0, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 100, y: 100 }));
    act(() => result.current.confirmLine(50));
    expect(result.current.shapes).toHaveLength(0);
  });

  it('allows multiple consecutive lines', () => {
    const { result } = renderHook(() => useFurniture());
    act(() => result.current.setActiveTool('line'));
    // First line
    act(() => result.current.handleCanvasClick({ x: 0, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 100, y: 0 }));
    act(() => result.current.confirmLine(50));
    // Second line — continues in placing-start
    act(() => result.current.handleCanvasClick({ x: 200, y: 100 }));
    act(() => result.current.handleCanvasClick({ x: 300, y: 100 }));
    act(() => result.current.confirmLine(75));

    expect(result.current.shapes).toHaveLength(2);
    expect(result.current.shapes[0].id).toBe('f-1');
    expect(result.current.shapes[1].id).toBe('f-2');
  });

  it('cancelDrawing resets to placing-start when tool is active', () => {
    const { result } = renderHook(() => useFurniture());
    act(() => result.current.setActiveTool('line'));
    act(() => result.current.handleCanvasClick({ x: 50, y: 50 }));
    act(() => result.current.cancelDrawing());
    expect(result.current.drawingStatus).toBe('placing-start');
    expect(result.current.activeStartPoint).toBeNull();
    expect(result.current.cursorPoint).toBeNull();
  });

  it('cancelDrawing from awaiting-input resets to placing-start', () => {
    const { result } = renderHook(() => useFurniture());
    act(() => result.current.setActiveTool('line'));
    act(() => result.current.handleCanvasClick({ x: 0, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 100, y: 100 }));
    act(() => result.current.cancelDrawing());
    expect(result.current.drawingStatus).toBe('placing-start');
    expect(result.current.activeEndPoint).toBeNull();
  });

  it('cancelDrawing does not lose existing shapes', () => {
    const { result } = renderHook(() => useFurniture());
    act(() => result.current.setActiveTool('line'));
    act(() => result.current.handleCanvasClick({ x: 0, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 100, y: 0 }));
    act(() => result.current.confirmLine(50));
    // Start drawing a second line and cancel
    act(() => result.current.handleCanvasClick({ x: 200, y: 200 }));
    act(() => result.current.cancelDrawing());
    expect(result.current.shapes).toHaveLength(1);
  });

  it('clears cursor when placing end point', () => {
    const { result } = renderHook(() => useFurniture());
    act(() => result.current.setActiveTool('line'));
    act(() => result.current.handleCanvasClick({ x: 0, y: 0 }));
    act(() => result.current.handleMouseMove({ x: 100, y: 100 }));
    expect(result.current.cursorPoint).toEqual({ x: 100, y: 100 });
    act(() => result.current.handleCanvasClick({ x: 200, y: 200 }));
    expect(result.current.cursorPoint).toBeNull();
  });
});
