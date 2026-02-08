import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useMeasurement, _resetIdCounter } from './useMeasurement';

describe('useMeasurement', () => {
  beforeEach(() => {
    _resetIdCounter();
  });

  it('starts in idle state with no measurements', () => {
    const { result } = renderHook(() => useMeasurement());
    expect(result.current.status).toBe('idle');
    expect(result.current.measurements).toEqual([]);
    expect(result.current.activeStartPoint).toBeNull();
    expect(result.current.isMeasuring).toBe(false);
  });

  it('transitions to placing-start when startMeasuring is called', () => {
    const { result } = renderHook(() => useMeasurement());
    act(() => result.current.startMeasuring());
    expect(result.current.status).toBe('placing-start');
    expect(result.current.isMeasuring).toBe(true);
  });

  it('places start point on first canvas click', () => {
    const { result } = renderHook(() => useMeasurement());
    act(() => result.current.startMeasuring());
    act(() => result.current.handleCanvasClick({ x: 50, y: 75 }));
    expect(result.current.status).toBe('placing-end');
    expect(result.current.activeStartPoint).toEqual({ x: 50, y: 75 });
    expect(result.current.isMeasuring).toBe(true);
  });

  it('creates a measurement on second canvas click and returns to placing-start', () => {
    const { result } = renderHook(() => useMeasurement());
    act(() => result.current.startMeasuring());
    act(() => result.current.handleCanvasClick({ x: 0, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 300, y: 0 }));

    expect(result.current.status).toBe('placing-start');
    expect(result.current.activeStartPoint).toBeNull();
    expect(result.current.measurements).toHaveLength(1);
    expect(result.current.measurements[0]).toEqual({
      id: 'm-1',
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 300, y: 0 },
      pixelDistance: 300,
    });
  });

  it('calculates correct pixel distance for diagonal line (3-4-5)', () => {
    const { result } = renderHook(() => useMeasurement());
    act(() => result.current.startMeasuring());
    act(() => result.current.handleCanvasClick({ x: 0, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 300, y: 400 }));

    expect(result.current.measurements[0].pixelDistance).toBe(500);
  });

  it('allows multiple consecutive measurements', () => {
    const { result } = renderHook(() => useMeasurement());
    act(() => result.current.startMeasuring());
    // First measurement
    act(() => result.current.handleCanvasClick({ x: 0, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 100, y: 0 }));
    // Second measurement (automatically continues since status goes back to placing-start)
    act(() => result.current.handleCanvasClick({ x: 200, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 200, y: 150 }));

    expect(result.current.measurements).toHaveLength(2);
    expect(result.current.measurements[0].id).toBe('m-1');
    expect(result.current.measurements[0].pixelDistance).toBe(100);
    expect(result.current.measurements[1].id).toBe('m-2');
    expect(result.current.measurements[1].pixelDistance).toBe(150);
  });

  it('ignores canvas clicks in idle state', () => {
    const { result } = renderHook(() => useMeasurement());
    act(() => result.current.handleCanvasClick({ x: 100, y: 200 }));
    expect(result.current.status).toBe('idle');
    expect(result.current.measurements).toEqual([]);
  });

  it('deletes a measurement by ID', () => {
    const { result } = renderHook(() => useMeasurement());
    act(() => result.current.startMeasuring());
    act(() => result.current.handleCanvasClick({ x: 0, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 100, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 200, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 200, y: 200 }));

    expect(result.current.measurements).toHaveLength(2);
    act(() => result.current.deleteMeasurement('m-1'));
    expect(result.current.measurements).toHaveLength(1);
    expect(result.current.measurements[0].id).toBe('m-2');
  });

  it('ignores delete for non-existent ID', () => {
    const { result } = renderHook(() => useMeasurement());
    act(() => result.current.startMeasuring());
    act(() => result.current.handleCanvasClick({ x: 0, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 100, y: 0 }));

    act(() => result.current.deleteMeasurement('m-999'));
    expect(result.current.measurements).toHaveLength(1);
  });

  it('clears all measurements', () => {
    const { result } = renderHook(() => useMeasurement());
    act(() => result.current.startMeasuring());
    act(() => result.current.handleCanvasClick({ x: 0, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 100, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 200, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 300, y: 0 }));

    expect(result.current.measurements).toHaveLength(2);
    act(() => result.current.clearAllMeasurements());
    expect(result.current.measurements).toEqual([]);
    expect(result.current.status).toBe('idle');
    expect(result.current.activeStartPoint).toBeNull();
  });

  it('cancels current measurement without losing existing ones', () => {
    const { result } = renderHook(() => useMeasurement());
    act(() => result.current.startMeasuring());
    // Complete one measurement
    act(() => result.current.handleCanvasClick({ x: 0, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 100, y: 0 }));
    // Start placing a second
    act(() => result.current.handleCanvasClick({ x: 50, y: 50 }));
    expect(result.current.status).toBe('placing-end');

    // Cancel mid-placement
    act(() => result.current.cancelMeasuring());
    expect(result.current.status).toBe('idle');
    expect(result.current.activeStartPoint).toBeNull();
    expect(result.current.measurements).toHaveLength(1);
  });

  it('cancelMeasuring in idle state is a no-op', () => {
    const { result } = renderHook(() => useMeasurement());
    act(() => result.current.cancelMeasuring());
    expect(result.current.status).toBe('idle');
  });

  it('selects a measurement by ID', () => {
    const { result } = renderHook(() => useMeasurement());
    act(() => result.current.startMeasuring());
    act(() => result.current.handleCanvasClick({ x: 0, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 100, y: 0 }));
    act(() => result.current.cancelMeasuring());

    act(() => result.current.selectMeasurement('m-1'));
    expect(result.current.selectedId).toBe('m-1');
  });

  it('deselects when passing null', () => {
    const { result } = renderHook(() => useMeasurement());
    act(() => result.current.startMeasuring());
    act(() => result.current.handleCanvasClick({ x: 0, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 100, y: 0 }));
    act(() => result.current.cancelMeasuring());

    act(() => result.current.selectMeasurement('m-1'));
    expect(result.current.selectedId).toBe('m-1');
    act(() => result.current.selectMeasurement(null));
    expect(result.current.selectedId).toBeNull();
  });

  it('clears selection when starting to measure', () => {
    const { result } = renderHook(() => useMeasurement());
    act(() => result.current.startMeasuring());
    act(() => result.current.handleCanvasClick({ x: 0, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 100, y: 0 }));
    act(() => result.current.cancelMeasuring());

    act(() => result.current.selectMeasurement('m-1'));
    expect(result.current.selectedId).toBe('m-1');
    act(() => result.current.startMeasuring());
    expect(result.current.selectedId).toBeNull();
  });

  it('clears selection when deleting the selected measurement', () => {
    const { result } = renderHook(() => useMeasurement());
    act(() => result.current.startMeasuring());
    act(() => result.current.handleCanvasClick({ x: 0, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 100, y: 0 }));
    act(() => result.current.cancelMeasuring());

    act(() => result.current.selectMeasurement('m-1'));
    act(() => result.current.deleteMeasurement('m-1'));
    expect(result.current.selectedId).toBeNull();
  });

  it('keeps selection when deleting a different measurement', () => {
    const { result } = renderHook(() => useMeasurement());
    act(() => result.current.startMeasuring());
    act(() => result.current.handleCanvasClick({ x: 0, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 100, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 200, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 300, y: 0 }));
    act(() => result.current.cancelMeasuring());

    act(() => result.current.selectMeasurement('m-2'));
    act(() => result.current.deleteMeasurement('m-1'));
    expect(result.current.selectedId).toBe('m-2');
  });

  it('tracks cursor position during placing-end', () => {
    const { result } = renderHook(() => useMeasurement());
    act(() => result.current.startMeasuring());
    act(() => result.current.handleCanvasClick({ x: 0, y: 0 }));
    expect(result.current.cursorPoint).toBeNull();

    act(() => result.current.handleMouseMove({ x: 50, y: 75 }));
    expect(result.current.cursorPoint).toEqual({ x: 50, y: 75 });

    act(() => result.current.handleMouseMove({ x: 100, y: 200 }));
    expect(result.current.cursorPoint).toEqual({ x: 100, y: 200 });
  });

  it('ignores mouse move when not placing-end', () => {
    const { result } = renderHook(() => useMeasurement());
    act(() => result.current.handleMouseMove({ x: 50, y: 75 }));
    expect(result.current.cursorPoint).toBeNull();

    act(() => result.current.startMeasuring());
    act(() => result.current.handleMouseMove({ x: 50, y: 75 }));
    expect(result.current.cursorPoint).toBeNull();
  });

  it('clears cursor point when measurement is completed', () => {
    const { result } = renderHook(() => useMeasurement());
    act(() => result.current.startMeasuring());
    act(() => result.current.handleCanvasClick({ x: 0, y: 0 }));
    act(() => result.current.handleMouseMove({ x: 100, y: 100 }));
    expect(result.current.cursorPoint).toEqual({ x: 100, y: 100 });

    act(() => result.current.handleCanvasClick({ x: 100, y: 100 }));
    expect(result.current.cursorPoint).toBeNull();
  });

  it('clears cursor point when measuring is cancelled', () => {
    const { result } = renderHook(() => useMeasurement());
    act(() => result.current.startMeasuring());
    act(() => result.current.handleCanvasClick({ x: 0, y: 0 }));
    act(() => result.current.handleMouseMove({ x: 100, y: 100 }));

    act(() => result.current.cancelMeasuring());
    expect(result.current.cursorPoint).toBeNull();
  });

  it('startMeasuring does not clear existing measurements', () => {
    const { result } = renderHook(() => useMeasurement());
    act(() => result.current.startMeasuring());
    act(() => result.current.handleCanvasClick({ x: 0, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 100, y: 0 }));
    act(() => result.current.cancelMeasuring());
    expect(result.current.measurements).toHaveLength(1);

    // Start measuring again — should keep existing measurement
    act(() => result.current.startMeasuring());
    expect(result.current.status).toBe('placing-start');
    expect(result.current.measurements).toHaveLength(1);
  });
});
