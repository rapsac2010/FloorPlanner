import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCalibration } from './useCalibration';

describe('useCalibration', () => {
  it('starts in idle state', () => {
    const { result } = renderHook(() => useCalibration());
    expect(result.current.status).toBe('idle');
    expect(result.current.startPoint).toBeNull();
    expect(result.current.endPoint).toBeNull();
    expect(result.current.realWorldCm).toBeNull();
    expect(result.current.pixelRatio).toBeNull();
    expect(result.current.isCalibrating).toBe(false);
  });

  it('transitions to placing-start when startCalibration is called', () => {
    const { result } = renderHook(() => useCalibration());
    act(() => result.current.startCalibration());
    expect(result.current.status).toBe('placing-start');
    expect(result.current.isCalibrating).toBe(true);
  });

  it('places start point on first canvas click', () => {
    const { result } = renderHook(() => useCalibration());
    act(() => result.current.startCalibration());
    act(() => result.current.handleCanvasClick({ x: 100, y: 200 }));
    expect(result.current.status).toBe('placing-end');
    expect(result.current.startPoint).toEqual({ x: 100, y: 200 });
    expect(result.current.endPoint).toBeNull();
    expect(result.current.isCalibrating).toBe(true);
  });

  it('places end point on second canvas click', () => {
    const { result } = renderHook(() => useCalibration());
    act(() => result.current.startCalibration());
    act(() => result.current.handleCanvasClick({ x: 100, y: 200 }));
    act(() => result.current.handleCanvasClick({ x: 400, y: 600 }));
    expect(result.current.status).toBe('awaiting-input');
    expect(result.current.startPoint).toEqual({ x: 100, y: 200 });
    expect(result.current.endPoint).toEqual({ x: 400, y: 600 });
    expect(result.current.isCalibrating).toBe(false);
  });

  it('ignores canvas clicks in idle state', () => {
    const { result } = renderHook(() => useCalibration());
    act(() => result.current.handleCanvasClick({ x: 100, y: 200 }));
    expect(result.current.status).toBe('idle');
    expect(result.current.startPoint).toBeNull();
  });

  it('ignores canvas clicks in awaiting-input state', () => {
    const { result } = renderHook(() => useCalibration());
    act(() => result.current.startCalibration());
    act(() => result.current.handleCanvasClick({ x: 0, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 300, y: 0 }));
    expect(result.current.status).toBe('awaiting-input');
    act(() => result.current.handleCanvasClick({ x: 999, y: 999 }));
    expect(result.current.status).toBe('awaiting-input');
    expect(result.current.endPoint).toEqual({ x: 300, y: 0 });
  });

  it('calculates pixel ratio from horizontal reference line', () => {
    const { result } = renderHook(() => useCalibration());
    act(() => result.current.startCalibration());
    // Horizontal line: 300 pixels
    act(() => result.current.handleCanvasClick({ x: 0, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 300, y: 0 }));
    // Real-world: 150 cm → ratio = 150/300 = 0.5 cm/px
    act(() => result.current.setRealWorldLength(150));
    expect(result.current.status).toBe('calibrated');
    expect(result.current.realWorldCm).toBe(150);
    expect(result.current.pixelRatio).toBe(0.5);
  });

  it('calculates pixel ratio from diagonal reference line (3-4-5 triangle)', () => {
    const { result } = renderHook(() => useCalibration());
    act(() => result.current.startCalibration());
    // 3-4-5 triangle: distance = 500 pixels
    act(() => result.current.handleCanvasClick({ x: 0, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 300, y: 400 }));
    // Real-world: 250 cm → ratio = 250/500 = 0.5 cm/px
    act(() => result.current.setRealWorldLength(250));
    expect(result.current.status).toBe('calibrated');
    expect(result.current.pixelRatio).toBe(0.5);
  });

  it('ignores setRealWorldLength when not in awaiting-input state', () => {
    const { result } = renderHook(() => useCalibration());
    act(() => result.current.setRealWorldLength(100));
    expect(result.current.status).toBe('idle');
    expect(result.current.pixelRatio).toBeNull();
  });

  it('resets calibration back to idle', () => {
    const { result } = renderHook(() => useCalibration());
    act(() => result.current.startCalibration());
    act(() => result.current.handleCanvasClick({ x: 0, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 300, y: 0 }));
    act(() => result.current.setRealWorldLength(150));
    expect(result.current.status).toBe('calibrated');

    act(() => result.current.resetCalibration());
    expect(result.current.status).toBe('idle');
    expect(result.current.startPoint).toBeNull();
    expect(result.current.endPoint).toBeNull();
    expect(result.current.realWorldCm).toBeNull();
    expect(result.current.pixelRatio).toBeNull();
    expect(result.current.isCalibrating).toBe(false);
  });

  it('startCalibration clears previous calibration', () => {
    const { result } = renderHook(() => useCalibration());
    // Complete a calibration
    act(() => result.current.startCalibration());
    act(() => result.current.handleCanvasClick({ x: 0, y: 0 }));
    act(() => result.current.handleCanvasClick({ x: 300, y: 0 }));
    act(() => result.current.setRealWorldLength(150));
    expect(result.current.pixelRatio).toBe(0.5);

    // Start again — should clear old data
    act(() => result.current.startCalibration());
    expect(result.current.status).toBe('placing-start');
    expect(result.current.startPoint).toBeNull();
    expect(result.current.endPoint).toBeNull();
    expect(result.current.pixelRatio).toBeNull();
  });
});
