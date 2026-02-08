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
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">FloorPlanner</h1>
      </header>

      <div className="flex flex-col items-center gap-6">
        <ImageUploader onUpload={handleUpload} />
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
        {imageSrc && (
          <CalibrationTool
            status={calibration.status}
            pixelRatio={calibration.pixelRatio}
            onStartCalibration={calibration.startCalibration}
            onSetRealWorldLength={calibration.setRealWorldLength}
            onReset={calibration.resetCalibration}
          />
        )}
      </div>
    </div>
  );
}

export default App;
