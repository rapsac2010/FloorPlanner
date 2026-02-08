import React from 'react';
import { Layer, Line, Circle, Text } from 'react-konva';
import type { Measurement, MeasurementStatus } from '../../hooks/useMeasurement';
import type { Point } from '../../types';
import { calculateDistance, pixelsToCm } from '../../utils/geometry';

interface MeasurementToolProps {
  /** Current measurement workflow status */
  status: MeasurementStatus;
  /** All completed measurements */
  measurements: Measurement[];
  /** cm-per-pixel calibration ratio (null if not calibrated) */
  pixelRatio: number | null;
  /** ID of the currently selected measurement */
  selectedId: string | null;
  /** Begin the measurement workflow */
  onStartMeasuring: () => void;
  /** Cancel the current measurement */
  onCancel: () => void;
  /** Delete a measurement by ID */
  onDeleteMeasurement: (id: string) => void;
  /** Clear all measurements */
  onClearAll: () => void;
  /** Select a measurement (pass null to deselect) */
  onSelectMeasurement: (id: string | null) => void;
}

/**
 * Sidebar UI controls for measuring distances on the floor plan.
 * Shows a list of measurements with their distances and delete buttons.
 */
export const MeasurementTool: React.FC<MeasurementToolProps> = ({
  status,
  measurements,
  pixelRatio,
  selectedId,
  onStartMeasuring,
  onCancel,
  onDeleteMeasurement,
  onClearAll,
  onSelectMeasurement,
}) => {
  const isMeasuring = status === 'placing-start' || status === 'placing-end';

  /** Format a measurement's distance for display */
  const formatDistance = (m: Measurement): string => {
    if (pixelRatio !== null && pixelRatio > 0) {
      const cm = pixelsToCm(m.pixelDistance, pixelRatio);
      return `${cm.toFixed(1)} cm`;
    }
    return `${m.pixelDistance.toFixed(1)} px`;
  };

  return (
    <div data-testid="measurement-tool" className="flex flex-col gap-3">
      {/* Action button */}
      {!isMeasuring && (
        <button
          data-testid="measurement-start-btn"
          onClick={onStartMeasuring}
          className="w-full px-4 py-2.5 bg-fp-teal text-white rounded-full text-sm font-bold shadow-sm border-2 border-fp-border hover:bg-fp-teal-dark hover:shadow-md transition-all"
        >
          Measure
        </button>
      )}

      {status === 'placing-start' && (
        <div className="flex flex-col gap-2">
          <div className="bg-fp-teal/10 rounded-xl px-3 py-2.5">
            <p data-testid="measurement-instruction" className="text-xs text-fp-teal-dark font-bold leading-relaxed">
              Click the start point of your measurement line.
            </p>
          </div>
          <button
            data-testid="measurement-cancel-btn"
            onClick={onCancel}
            className="w-full px-3 py-2 bg-white text-gray-500 rounded-full text-xs font-bold shadow-sm border-2 border-fp-border hover:bg-gray-50 hover:text-gray-700 transition-all"
          >
            Stop measuring
          </button>
        </div>
      )}

      {status === 'placing-end' && (
        <div className="flex flex-col gap-2">
          <div className="bg-fp-teal/10 rounded-xl px-3 py-2.5">
            <p data-testid="measurement-instruction" className="text-xs text-fp-teal-dark font-bold leading-relaxed">
              Click the end point to complete the measurement.
            </p>
            <p className="text-[10px] text-fp-teal-dark/60 font-semibold mt-1">
              Hold <kbd className="px-1 py-0.5 bg-white/60 rounded text-[9px] font-bold">Shift</kbd> for straight lines
            </p>
          </div>
          <button
            data-testid="measurement-cancel-btn"
            onClick={onCancel}
            className="w-full px-3 py-2 bg-white text-gray-500 rounded-full text-xs font-bold shadow-sm border-2 border-fp-border hover:bg-gray-50 hover:text-gray-700 transition-all"
          >
            Stop measuring
          </button>
        </div>
      )}

      {/* Measurement list */}
      {measurements.length > 0 && (
        <div data-testid="measurement-list" className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Measurements
            </span>
            <button
              data-testid="measurement-clear-all-btn"
              onClick={onClearAll}
              className="text-[10px] text-fp-orange font-bold hover:text-fp-orange-dark transition-colors"
            >
              Clear all
            </button>
          </div>
          {measurements.map((m, index) => {
            const isSelected = selectedId === m.id;
            return (
              <div
                key={m.id}
                data-testid={`measurement-item-${m.id}`}
                onClick={() => onSelectMeasurement(isSelected ? null : m.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl shadow-sm cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-fp-orange/15 ring-2 ring-fp-orange/40'
                    : 'bg-white/70 hover:bg-white/90'
                }`}
              >
                <span className={`text-xs font-semibold ${isSelected ? 'text-fp-orange-dark' : 'text-gray-600'}`}>
                  #{index + 1}: {formatDistance(m)}
                </span>
                <button
                  data-testid={`measurement-delete-${m.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteMeasurement(m.id);
                  }}
                  className="text-gray-300 hover:text-fp-orange text-sm font-bold transition-colors leading-none"
                  aria-label={`Delete measurement ${index + 1}`}
                >
                  &times;
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * Konva Layer that draws measurement lines, endpoint markers, and distance labels.
 * Must be rendered inside a Konva Stage (via FloorPlanCanvas children).
 */
export const MeasurementOverlay: React.FC<{
  measurements: Measurement[];
  activeStartPoint: Point | null;
  cursorPoint: Point | null;
  status: MeasurementStatus;
  /** cm-per-pixel calibration ratio (null if not calibrated) */
  pixelRatio: number | null;
  /** ID of the currently selected measurement */
  selectedId?: string | null;
}> = ({ measurements, activeStartPoint, cursorPoint, status, pixelRatio, selectedId }) => {
  const showPreview = status === 'placing-end' && activeStartPoint && cursorPoint;
  if (measurements.length === 0 && !activeStartPoint && !showPreview) return null;

  /** Format distance for the Konva text label */
  const formatLabel = (pixelDistance: number): string => {
    if (pixelRatio !== null && pixelRatio > 0) {
      const cm = pixelsToCm(pixelDistance, pixelRatio);
      return `${cm.toFixed(1)} cm`;
    }
    return `${pixelDistance.toFixed(1)} px`;
  };

  /** Calculate midpoint of a line for label placement */
  const midpoint = (start: Point, end: Point): Point => ({
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
  });

  return (
    <Layer>
      {/* Completed measurement lines */}
      {measurements.map((m) => {
        const mid = midpoint(m.startPoint, m.endPoint);
        const isSelected = selectedId === m.id;
        const lineColor = isSelected ? '#C45E24' : '#E37434';
        const lineWidth = isSelected ? 3 : 2;
        const circleRadius = isSelected ? 6 : 4;
        return (
          <React.Fragment key={m.id}>
            <Line
              points={[m.startPoint.x, m.startPoint.y, m.endPoint.x, m.endPoint.y]}
              stroke={lineColor}
              strokeWidth={lineWidth}
            />
            <Circle
              x={m.startPoint.x}
              y={m.startPoint.y}
              radius={circleRadius}
              fill={lineColor}
              stroke="#C45E24"
              strokeWidth={1}
            />
            <Circle
              x={m.endPoint.x}
              y={m.endPoint.y}
              radius={circleRadius}
              fill={lineColor}
              stroke="#C45E24"
              strokeWidth={1}
            />
            <Text
              x={mid.x + 6}
              y={mid.y - 16}
              text={formatLabel(m.pixelDistance)}
              fontSize={isSelected ? 14 : 13}
              fontStyle="bold"
              fill="#C45E24"
              shadowColor="white"
              shadowBlur={3}
              shadowOffsetX={0}
              shadowOffsetY={0}
            />
          </React.Fragment>
        );
      })}

      {/* Live preview line with distance label (while placing-end) */}
      {showPreview && (
        <>
          <Line
            points={[activeStartPoint.x, activeStartPoint.y, cursorPoint.x, cursorPoint.y]}
            stroke="#E37434"
            strokeWidth={2}
            dash={[6, 3]}
          />
          <Circle
            x={activeStartPoint.x}
            y={activeStartPoint.y}
            radius={5}
            fill="#E37434"
            stroke="#C45E24"
            strokeWidth={1.5}
          />
          <Circle
            x={cursorPoint.x}
            y={cursorPoint.y}
            radius={5}
            fill="#E37434"
            stroke="#C45E24"
            strokeWidth={1.5}
          />
          <Text
            x={(activeStartPoint.x + cursorPoint.x) / 2 + 6}
            y={(activeStartPoint.y + cursorPoint.y) / 2 - 16}
            text={formatLabel(calculateDistance(activeStartPoint, cursorPoint))}
            fontSize={13}
            fontStyle="bold"
            fill="#C45E24"
            shadowColor="white"
            shadowBlur={3}
            shadowOffsetX={0}
            shadowOffsetY={0}
          />
        </>
      )}
      {/* Active start point indicator (before mouse has moved) */}
      {status === 'placing-end' && activeStartPoint && !cursorPoint && (
        <Circle
          x={activeStartPoint.x}
          y={activeStartPoint.y}
          radius={5}
          fill="#E37434"
          stroke="#C45E24"
          strokeWidth={1.5}
        />
      )}
    </Layer>
  );
};
