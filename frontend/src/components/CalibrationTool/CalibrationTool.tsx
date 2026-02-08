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
    <div data-testid="calibration-tool" className="flex flex-col gap-3">
      {/* Status pill */}
      <div data-testid="calibration-status" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 shadow-sm w-fit">
        <span
          data-testid="calibration-status-indicator"
          className={`inline-block w-2 h-2 rounded-full ${
            status === 'calibrated'
              ? 'bg-fp-sage'
              : isActive
                ? 'bg-fp-orange'
                : 'bg-gray-300'
          }`}
        />
        <span className="text-xs text-gray-600 font-bold">
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
          className="w-full px-4 py-2.5 bg-fp-sage text-white rounded-full text-sm font-bold shadow-sm border-2 border-fp-border hover:bg-fp-sage-dark hover:shadow-md transition-all"
        >
          Calibrate
        </button>
      )}

      {status === 'placing-start' && (
        <div className="flex flex-col gap-2">
          <div className="bg-fp-teal/10 rounded-xl px-3 py-2.5">
            <p data-testid="calibration-instruction" className="text-xs text-fp-teal-dark font-bold leading-relaxed">
              Click the start point of your reference line on the floor plan.
            </p>
          </div>
          <button
            data-testid="calibration-cancel-btn"
            onClick={onReset}
            className="w-full px-3 py-2 bg-white text-gray-500 rounded-full text-xs font-bold shadow-sm border-2 border-fp-border hover:bg-gray-50 hover:text-gray-700 transition-all"
          >
            Cancel
          </button>
        </div>
      )}

      {status === 'placing-end' && (
        <div className="flex flex-col gap-2">
          <div className="bg-fp-teal/10 rounded-xl px-3 py-2.5">
            <p data-testid="calibration-instruction" className="text-xs text-fp-teal-dark font-bold leading-relaxed">
              Click the end point of your reference line.
            </p>
          </div>
          <button
            data-testid="calibration-cancel-btn"
            onClick={onReset}
            className="w-full px-3 py-2 bg-white text-gray-500 rounded-full text-xs font-bold shadow-sm border-2 border-fp-border hover:bg-gray-50 hover:text-gray-700 transition-all"
          >
            Cancel
          </button>
        </div>
      )}

      {status === 'awaiting-input' && (
        <div className="flex flex-col gap-2.5">
          <form
            data-testid="calibration-form"
            onSubmit={handleSubmitLength}
            className="flex flex-col gap-2.5"
          >
            <label htmlFor="calibration-length" className="text-xs font-bold text-gray-600">
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
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-fp-teal/30 focus:border-fp-teal"
              autoFocus
            />
            <button
              type="submit"
              data-testid="calibration-submit-btn"
              className="w-full px-4 py-2.5 bg-fp-sage text-white rounded-full text-sm font-bold shadow-sm border-2 border-fp-border hover:bg-fp-sage-dark hover:shadow-md transition-all"
            >
              Apply
            </button>
          </form>
          <button
            data-testid="calibration-cancel-btn"
            onClick={onReset}
            className="w-full px-3 py-2 bg-white text-gray-500 rounded-full text-xs font-bold shadow-sm border-2 border-fp-border hover:bg-gray-50 hover:text-gray-700 transition-all"
          >
            Cancel
          </button>
        </div>
      )}

      {status === 'calibrated' && (
        <div data-testid="calibration-result" className="flex flex-col gap-2.5">
          <div className="px-3 py-2 bg-fp-sage/10 rounded-xl text-center">
            <span className="text-sm text-fp-sage-dark font-semibold">
              {pixelRatio?.toFixed(4)} cm/px
            </span>
          </div>
          <button
            data-testid="calibration-recalibrate-btn"
            onClick={onReset}
            className="w-full px-3 py-2 bg-white text-gray-500 rounded-full text-xs font-bold shadow-sm border-2 border-fp-border hover:bg-gray-50 hover:text-gray-700 transition-all"
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
        radius={4}
        fill="#000000"
        stroke="#000000"
        strokeWidth={1}
      />
      {/* End point marker + line */}
      {endPoint && (
        <>
          <Circle
            x={endPoint.x}
            y={endPoint.y}
            radius={4}
            fill="#000000"
            stroke="#000000"
            strokeWidth={1}
          />
        </>
      )}
      {showLine && (
        <Line
          points={[startPoint.x, startPoint.y, endPoint!.x, endPoint!.y]}
          stroke="#000000"
          strokeWidth={1}
          dash={[6, 3]}
        />
      )}
    </Layer>
  );
};
