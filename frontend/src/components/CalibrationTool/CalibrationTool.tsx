import React, { useState } from 'react';
import { Layer, Line, Circle } from 'react-konva';
import type { CalibrationStatus } from '../../hooks/useCalibration';
import type { Point } from '../../types';

interface CalibrationToolProps {
  /** Current calibration workflow status */
  status: CalibrationStatus;
  /** The computed cm-per-pixel ratio (when calibrated) */
  pixelRatio: number | null;
  /** Begin the calibration workflow */
  onStartCalibration: () => void;
  /** Submit the real-world length in cm */
  onSetRealWorldLength: (cm: number) => void;
  /** Reset calibration */
  onReset: () => void;
}

/**
 * Renders the calibration reference line on the canvas (as a Konva Layer)
 * and provides UI controls for entering the real-world measurement.
 */
export const CalibrationTool: React.FC<CalibrationToolProps> = ({
  status,
  pixelRatio,
  onStartCalibration,
  onSetRealWorldLength,
  onReset,
}) => {
  const [lengthInput, setLengthInput] = useState('');

  const handleSubmitLength = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(lengthInput);
    if (!isNaN(value) && value > 0) {
      onSetRealWorldLength(value);
      setLengthInput('');
    }
  };

  const isActive = status === 'placing-start' || status === 'placing-end' || status === 'awaiting-input';

  return (
    <div data-testid="calibration-tool" className="mt-4 flex flex-col gap-2">
      {/* Status badge */}
      <div data-testid="calibration-status" className="flex items-center gap-2">
        <span
          data-testid="calibration-status-indicator"
          className={`inline-block w-2.5 h-2.5 rounded-full ${
            status === 'calibrated'
              ? 'bg-green-500'
              : isActive
                ? 'bg-yellow-500'
                : 'bg-gray-400'
          }`}
        />
        <span className="text-sm text-gray-600">
          {status === 'calibrated' && 'Calibrated'}
          {isActive && 'Calibrating...'}
          {status === 'idle' && 'Not calibrated'}
        </span>
      </div>

      {/* Controls */}
      {status === 'idle' && (
        <button
          data-testid="calibration-start-btn"
          onClick={onStartCalibration}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-fit"
        >
          Calibrate
        </button>
      )}

      {status === 'placing-start' && (
        <div className="flex items-center gap-3">
          <p data-testid="calibration-instruction" className="text-blue-600 font-medium">
            Click the start point of your reference line on the floor plan.
          </p>
          <button
            data-testid="calibration-cancel-btn"
            onClick={onReset}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
        </div>
      )}

      {status === 'placing-end' && (
        <div className="flex items-center gap-3">
          <p data-testid="calibration-instruction" className="text-blue-600 font-medium">
            Click the end point of your reference line.
          </p>
          <button
            data-testid="calibration-cancel-btn"
            onClick={onReset}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
        </div>
      )}

      {status === 'awaiting-input' && (
        <div className="flex items-center gap-2">
          <form
            data-testid="calibration-form"
            onSubmit={handleSubmitLength}
            className="flex items-center gap-2"
          >
            <label htmlFor="calibration-length" className="text-sm font-medium text-gray-700">
              Reference length (cm):
            </label>
            <input
              id="calibration-length"
              data-testid="calibration-length-input"
              type="number"
              step="any"
              min="0.01"
              value={lengthInput}
              onChange={(e) => setLengthInput(e.target.value)}
              className="w-24 px-2 py-1 border border-gray-300 rounded"
              autoFocus
            />
            <button
              type="submit"
              data-testid="calibration-submit-btn"
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Apply
            </button>
          </form>
          <button
            data-testid="calibration-cancel-btn"
            onClick={onReset}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
        </div>
      )}

      {status === 'calibrated' && (
        <div data-testid="calibration-result" className="flex items-center gap-3">
          <span className="text-sm text-green-700 font-medium">
            {pixelRatio?.toFixed(4)} cm/px
          </span>
          <button
            data-testid="calibration-recalibrate-btn"
            onClick={onReset}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Recalibrate
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Konva Layer that draws the reference line and endpoint markers.
 * Must be rendered inside a Konva Stage (via FloorPlanCanvas children).
 */
export const CalibrationOverlay: React.FC<{
  status: CalibrationStatus;
  startPoint: Point | null;
  endPoint: Point | null;
}> = ({ status, startPoint, endPoint }) => {
  // Only show overlay when points exist
  if (!startPoint) return null;

  const showLine = status !== 'idle' && startPoint && endPoint;

  return (
    <Layer>
      {/* Start point marker */}
      <Circle
        x={startPoint.x}
        y={startPoint.y}
        radius={5}
        fill="#2563eb"
        stroke="#1d4ed8"
        strokeWidth={1}
      />
      {/* End point marker + line */}
      {endPoint && (
        <>
          <Circle
            x={endPoint.x}
            y={endPoint.y}
            radius={5}
            fill="#2563eb"
            stroke="#1d4ed8"
            strokeWidth={1}
          />
        </>
      )}
      {showLine && (
        <Line
          points={[startPoint.x, startPoint.y, endPoint!.x, endPoint!.y]}
          stroke="#2563eb"
          strokeWidth={2}
          dash={[6, 3]}
        />
      )}
    </Layer>
  );
};
