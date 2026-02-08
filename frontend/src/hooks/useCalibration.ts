import { useState, useCallback } from 'react';
import type { Point } from '../types';
import { calculateDistance, calculatePixelRatio } from '../utils/geometry';

/** Calibration workflow status */
export type CalibrationStatus =
  | 'idle'
  | 'placing-start'
  | 'placing-end'
  | 'awaiting-input'
  | 'calibrated';

export interface CalibrationState {
  status: CalibrationStatus;
  startPoint: Point | null;
  endPoint: Point | null;
  realWorldCm: number | null;
  /** Centimeters per pixel */
  pixelRatio: number | null;
}

export interface UseCalibrationReturn extends CalibrationState {
  /** Begin calibration — sets status to 'placing-start' */
  startCalibration: () => void;
  /** Handle a click on the canvas to place start or end point */
  handleCanvasClick: (point: Point) => void;
  /** Set the real-world length in cm and compute the pixel ratio */
  setRealWorldLength: (cm: number) => void;
  /** Reset calibration back to idle */
  resetCalibration: () => void;
  /** Whether the user is actively placing points */
  isCalibrating: boolean;
}

const initialState: CalibrationState = {
  status: 'idle',
  startPoint: null,
  endPoint: null,
  realWorldCm: null,
  pixelRatio: null,
};

/**
 * Hook for managing calibration state — draw a reference line on the canvas,
 * input a known real-world length, and compute the cm-per-pixel ratio.
 */
export const useCalibration = (): UseCalibrationReturn => {
  const [state, setState] = useState<CalibrationState>(initialState);

  const startCalibration = useCallback(() => {
    setState({
      ...initialState,
      status: 'placing-start',
    });
  }, []);

  const handleCanvasClick = useCallback((point: Point) => {
    setState((prev) => {
      if (prev.status === 'placing-start') {
        return { ...prev, status: 'placing-end', startPoint: point };
      }
      if (prev.status === 'placing-end') {
        return { ...prev, status: 'awaiting-input', endPoint: point };
      }
      return prev;
    });
  }, []);

  const setRealWorldLength = useCallback((cm: number) => {
    setState((prev) => {
      if (prev.status !== 'awaiting-input' || !prev.startPoint || !prev.endPoint) {
        return prev;
      }
      const pixelDistance = calculateDistance(prev.startPoint, prev.endPoint);
      const ratio = calculatePixelRatio(pixelDistance, cm);
      return {
        ...prev,
        status: 'calibrated',
        realWorldCm: cm,
        pixelRatio: ratio,
      };
    });
  }, []);

  const resetCalibration = useCallback(() => {
    setState(initialState);
  }, []);

  const isCalibrating = state.status === 'placing-start' || state.status === 'placing-end';

  return {
    ...state,
    startCalibration,
    handleCanvasClick,
    setRealWorldLength,
    resetCalibration,
    isCalibrating,
  };
};
