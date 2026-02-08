import { useState, useCallback } from 'react';
import type { Point } from '../types';
import { calculateDistance } from '../utils/geometry';

/** A single measurement line between two points */
export interface Measurement {
  id: string;
  startPoint: Point;
  endPoint: Point;
  /** Distance in pixels */
  pixelDistance: number;
}

/** Measurement workflow status */
export type MeasurementStatus = 'idle' | 'placing-start' | 'placing-end';

export interface MeasurementState {
  status: MeasurementStatus;
  /** All completed measurements */
  measurements: Measurement[];
  /** Start point of the measurement currently being placed */
  activeStartPoint: Point | null;
  /** Current cursor position for live preview (only set during placing-end) */
  cursorPoint: Point | null;
  /** ID of the currently selected measurement (for highlighting/editing) */
  selectedId: string | null;
}

export interface UseMeasurementReturn extends MeasurementState {
  /** Begin a new measurement — sets status to 'placing-start' */
  startMeasuring: () => void;
  /** Handle a click on the canvas to place start or end point */
  handleCanvasClick: (point: Point) => void;
  /** Remove a measurement by ID */
  deleteMeasurement: (id: string) => void;
  /** Remove all measurements */
  clearAllMeasurements: () => void;
  /** Update the cursor position for live preview */
  handleMouseMove: (point: Point) => void;
  /** Cancel the current measurement in progress */
  cancelMeasuring: () => void;
  /** Select a measurement by ID (pass null to deselect) */
  selectMeasurement: (id: string | null) => void;
  /** Whether the user is actively placing points */
  isMeasuring: boolean;
}

let nextId = 1;

/** Generate a unique measurement ID */
function generateId(): string {
  return `m-${nextId++}`;
}

/** Reset the ID counter (for testing) */
export function _resetIdCounter(): void {
  nextId = 1;
}

const initialState: MeasurementState = {
  status: 'idle',
  measurements: [],
  activeStartPoint: null,
  cursorPoint: null,
  selectedId: null,
};

/**
 * Hook for managing measurement state — draw lines on the canvas
 * and track all completed measurements with pixel distances.
 */
export const useMeasurement = (): UseMeasurementReturn => {
  const [state, setState] = useState<MeasurementState>(initialState);

  const startMeasuring = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: 'placing-start',
      activeStartPoint: null,
      cursorPoint: null,
      selectedId: null,
    }));
  }, []);

  const handleCanvasClick = useCallback((point: Point) => {
    setState((prev) => {
      if (prev.status === 'placing-start') {
        return { ...prev, status: 'placing-end', activeStartPoint: point, cursorPoint: null };
      }
      if (prev.status === 'placing-end' && prev.activeStartPoint) {
        const pixelDistance = calculateDistance(prev.activeStartPoint, point);
        const measurement: Measurement = {
          id: generateId(),
          startPoint: prev.activeStartPoint,
          endPoint: point,
          pixelDistance,
        };
        return {
          ...prev,
          status: 'placing-start',
          activeStartPoint: null,
          cursorPoint: null,
          measurements: [...prev.measurements, measurement],
        };
      }
      return prev;
    });
  }, []);

  const handleMouseMove = useCallback((point: Point) => {
    setState((prev) => {
      if (prev.status !== 'placing-end') return prev;
      return { ...prev, cursorPoint: point };
    });
  }, []);

  const deleteMeasurement = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      measurements: prev.measurements.filter((m) => m.id !== id),
      selectedId: prev.selectedId === id ? null : prev.selectedId,
    }));
  }, []);

  const clearAllMeasurements = useCallback(() => {
    setState({
      ...initialState,
    });
  }, []);

  const cancelMeasuring = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: 'idle',
      activeStartPoint: null,
      cursorPoint: null,
    }));
  }, []);

  const selectMeasurement = useCallback((id: string | null) => {
    setState((prev) => ({
      ...prev,
      selectedId: id,
    }));
  }, []);

  const isMeasuring = state.status === 'placing-start' || state.status === 'placing-end';

  return {
    ...state,
    startMeasuring,
    handleCanvasClick,
    handleMouseMove,
    deleteMeasurement,
    clearAllMeasurements,
    cancelMeasuring,
    selectMeasurement,
    isMeasuring,
  };
};
