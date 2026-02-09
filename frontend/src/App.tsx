import { useState } from 'react';
import type { UploadResponse } from './api/client';
import { getImageUrl } from './api/client';
import { FloorPlanCanvas } from './components/FloorPlanCanvas/FloorPlanCanvas';
import { ImageUploader } from './components/ImageUploader/ImageUploader';
import { CalibrationTool, CalibrationOverlay } from './components/CalibrationTool/CalibrationTool';
import { MeasurementTool, MeasurementOverlay } from './components/MeasurementTool/MeasurementTool';
import { FurnitureEditor } from './components/FurnitureEditor/FurnitureEditor';
import { useCalibration } from './hooks/useCalibration';
import { useMeasurement } from './hooks/useMeasurement';
import { useFurniture } from './hooks/useFurniture';
import { snapToAxis } from './utils/geometry';

function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [furnitureEditorOpen, setFurnitureEditorOpen] = useState(false);
  const calibration = useCalibration();
  const measurement = useMeasurement();
  const furniture = useFurniture();

  const handleUpload = (response: UploadResponse) => {
    setImageSrc(getImageUrl(response.image_id));
  };

  /** Snap a point if shift is held during placing-end */
  const applySnap = (point: { x: number; y: number }, shiftKey: boolean) => {
    if (shiftKey && measurement.status === 'placing-end' && measurement.activeStartPoint) {
      return snapToAxis(measurement.activeStartPoint, point);
    }
    return point;
  };

  /** Route canvas clicks to the active tool, with shift-key snapping for measurements */
  const handleStageClick = (point: { x: number; y: number }, shiftKey: boolean) => {
    if (calibration.isCalibrating) {
      calibration.handleCanvasClick(point);
    } else if (measurement.isMeasuring) {
      measurement.handleCanvasClick(applySnap(point, shiftKey));
    }
  };

  /** Route mouse moves for live measurement preview */
  const handleStageMouseMove = (point: { x: number; y: number }, shiftKey: boolean) => {
    if (measurement.isMeasuring) {
      measurement.handleMouseMove(applySnap(point, shiftKey));
    }
  };

  const hasActiveTool = calibration.isCalibrating || measurement.isMeasuring;

  return (
    <div className="flex flex-col h-screen bg-ruler overflow-hidden">
      {/* Top header bar — orange with logo */}
      <header className="flex-shrink-0 px-6 bg-fp-orange shadow-md flex items-center overflow-hidden border-b-2 border-fp-border">
        <img src="/logo.png" alt="FloorPlanner logo" className="h-24 -ml-4 -mr-3 self-center" />
        <h1 className="text-3xl text-white" style={{ fontFamily: "'Fredoka One', cursive", WebkitTextStroke: '1px #0f0000', textShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>
          Floor<span className="text-fp-cream">Planner</span>
        </h1>
      </header>

      {/* Body: canvas + floating sidebar */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Main canvas area — centered */}
        <main className="flex-1 min-w-0 overflow-auto p-6 flex items-start justify-center">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-fp-border">
            <FloorPlanCanvas
              imageSrc={imageSrc}
              onStageClick={hasActiveTool ? handleStageClick : undefined}
              onStageMouseMove={measurement.isMeasuring ? handleStageMouseMove : undefined}
            >
              <CalibrationOverlay
                status={calibration.status}
                startPoint={calibration.startPoint}
                endPoint={calibration.endPoint}
              />
              <MeasurementOverlay
                measurements={measurement.measurements}
                activeStartPoint={measurement.activeStartPoint}
                cursorPoint={measurement.cursorPoint}
                status={measurement.status}
                pixelRatio={calibration.pixelRatio}
                selectedId={measurement.selectedId}
              />
            </FloorPlanCanvas>
          </div>
        </main>

        {/* Floating sidebar — cream glass-morphism */}
        <aside className="w-72 flex-shrink-0 my-4 mr-4 bg-fp-cream backdrop-blur-xl rounded-2xl shadow-lg border-2 border-fp-border flex flex-col overflow-y-auto">
          {/* Upload section */}
          <div className="p-5">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-fp-teal mb-3">Floor Plan</h2>
            <ImageUploader onUpload={handleUpload} />
          </div>

          {/* Calibration section */}
          {imageSrc && (
            <div className="px-5 pb-5">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-fp-teal mb-3">Calibration</h2>
              <CalibrationTool
                status={calibration.status}
                pixelRatio={calibration.pixelRatio}
                onStartCalibration={calibration.startCalibration}
                onSetRealWorldLength={calibration.setRealWorldLength}
                onReset={calibration.resetCalibration}
              />
            </div>
          )}

          {/* Measurement section */}
          {imageSrc && (
            <div className="px-5 pb-5">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-fp-teal mb-3">Measurements</h2>
              <MeasurementTool
                status={measurement.status}
                measurements={measurement.measurements}
                pixelRatio={calibration.pixelRatio}
                selectedId={measurement.selectedId}
                onStartMeasuring={measurement.startMeasuring}
                onCancel={measurement.cancelMeasuring}
                onDeleteMeasurement={measurement.deleteMeasurement}
                onClearAll={measurement.clearAllMeasurements}
                onSelectMeasurement={measurement.selectMeasurement}
              />
            </div>
          )}

          {/* Furniture Editor section */}
          {imageSrc && (
            <div className="px-5 pb-5">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-fp-teal mb-3">Furniture</h2>
              <FurnitureEditor
                shapes={furniture.shapes}
                selectedShapeId={furniture.selectedShapeId}
                activeTool={furniture.activeTool}
                drawingStatus={furniture.drawingStatus}
                activeStartPoint={furniture.activeStartPoint}
                activeEndPoint={furniture.activeEndPoint}
                cursorPoint={furniture.cursorPoint}
                onRemoveShape={furniture.removeShape}
                onClearShapes={furniture.clearShapes}
                onSelectShape={furniture.selectShape}
                onSetActiveTool={furniture.setActiveTool}
                onCanvasClick={furniture.handleCanvasClick}
                onMouseMove={furniture.handleMouseMove}
                onConfirmLine={furniture.confirmLine}
                onCancelDrawing={furniture.cancelDrawing}
                isOpen={furnitureEditorOpen}
                onToggleOpen={() => setFurnitureEditorOpen((prev) => !prev)}
              />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default App;
