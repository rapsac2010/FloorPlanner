import { useState } from 'react';
import type { UploadResponse } from './api/client';
import { getImageUrl } from './api/client';
import { FloorPlanCanvas } from './components/FloorPlanCanvas/FloorPlanCanvas';
import { ImageUploader } from './components/ImageUploader/ImageUploader';
import { CalibrationTool, CalibrationOverlay } from './components/CalibrationTool/CalibrationTool';
import { useCalibration } from './hooks/useCalibration';

function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const calibration = useCalibration();

  const handleUpload = (response: UploadResponse) => {
    setImageSrc(getImageUrl(response.image_id));
  };

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
              onStageClick={calibration.isCalibrating ? calibration.handleCanvasClick : undefined}
            >
              <CalibrationOverlay
                status={calibration.status}
                startPoint={calibration.startPoint}
                endPoint={calibration.endPoint}
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
        </aside>
      </div>
    </div>
  );
}

export default App;
