# Changelog

## [Session 9] - 2026-02-09

### Documentation: Reframe ShapeDrawer as Furniture Editor
- Updated all project `.md` files (`claude.md`, `README.md`, `initial_run.md`) to replace "ShapeDrawer / Shape Drawing" with **Furniture Editor**
- Renamed `ShapeDrawer/` → `FurnitureEditor/`, `useShapes.ts` → `useFurniture.ts` in architecture docs
- Added new Task 16b: Place saved furniture on floor plan
- Refined task descriptions to reflect the full workflow: design in pop-out editor → save → place on floor plan

### Task 12: FurnitureEditor component + useFurniture hook
- Created `useFurniture` hook managing furniture shape state:
  - `shapes` array, `selectedShapeId`, `activeTool` (line/rectangle/circle)
  - `addShape()`, `removeShape()`, `clearShapes()`, `selectShape()`, `setActiveTool()`
  - Clears selection when activating a tool or removing the selected shape
- Created `FurnitureEditorPanel` component with:
  - Teal header with "Furniture Editor" title, Pop Out / Close buttons
  - Own 800×600 Konva Stage with grid lines
  - Drawing tool palette (Line, Rectangle, Circle buttons with active highlight)
  - Shape list with per-item select, delete, and "Clear all"
  - Formatted shape labels: "Line 50.0 cm", "Rect 80.0×60.0 cm", "Circle r=25.0 cm"
- Created `FurnitureEditor` wrapper component with three modes:
  - **Closed**: shows "Open Furniture Editor" button in sidebar
  - **Inline**: full-screen centered overlay via `createPortal(…, document.body)` — escapes sidebar stacking context
  - **Popped out**: renders in a separate browser window via `window.open()` + `createPortal()`, copies stylesheets from parent
- Created `PopoutWindow` helper component for the pop-out window lifecycle
- Added furniture shape types to `types/index.ts`: `FurnitureShapeLine`, `FurnitureShapeRectangle`, `FurnitureShapeCircle`, `FurnitureShape` union
- Created 14 tests for `useFurniture` hook
- Created 28 tests for `FurnitureEditor` and `FurnitureEditorPanel` components
- Integrated into `App.tsx` with "Furniture" section in sidebar
- Files created:
  - `frontend/src/hooks/useFurniture.ts`
  - `frontend/src/hooks/useFurniture.test.ts`
  - `frontend/src/components/FurnitureEditor/FurnitureEditor.tsx`
  - `frontend/src/components/FurnitureEditor/FurnitureEditor.test.tsx`
- Files modified:
  - `frontend/src/types/index.ts` (furniture shape types)
  - `frontend/src/App.tsx` (FurnitureEditor integration)

### Task 13: Line drawing tool with length input (cm)
- Extended `useFurniture` hook with interactive drawing state machine:
  - `drawingStatus`: `idle` → `placing-start` → `placing-end` → `awaiting-input` → (line created, back to `placing-start`)
  - `activeStartPoint`, `activeEndPoint`, `cursorPoint` for tracking drawing progress
  - `handleCanvasClick()`: places start/end points based on current status
  - `handleMouseMove()`: updates cursor for live preview during `placing-end`
  - `confirmLine(lengthCm)`: creates a `FurnitureShapeLine` from active points + entered length
  - `cancelDrawing()`: resets to `placing-start` without losing existing shapes
  - `isDrawing` computed boolean
- Updated `FurnitureCanvas` to handle Konva stage click/mousemove events:
  - Crosshair cursor when drawing is active
  - Live dashed preview line with endpoint circles during `placing-end`
  - Start point indicator before mouse moves
  - Solid confirmed line with "? cm" label during `awaiting-input`
- Updated `FurnitureEditorPanel` sidebar with:
  - Step-by-step drawing instructions ("Click the start point…", "Click the end point…")
  - Cancel button during all drawing steps
  - Length input form with numeric input + "cm" label when `awaiting-input`
  - Confirm button to finalize line with entered length
- Added 15 drawing workflow tests for `useFurniture` hook
- Added 8 drawing UI tests for `FurnitureEditorPanel` component
- All 194 frontend tests passing, all 12 backend tests passing
- Files modified:
  - `frontend/src/hooks/useFurniture.ts` (drawing state + handlers)
  - `frontend/src/hooks/useFurniture.test.ts` (15 new tests)
  - `frontend/src/components/FurnitureEditor/FurnitureEditor.tsx` (canvas events, preview, length input, portal fix)
  - `frontend/src/components/FurnitureEditor/FurnitureEditor.test.tsx` (8 new tests)
  - `frontend/src/App.tsx` (new drawing props wiring)

## [Session 8] - 2026-02-08

### Task 11: Allow deleting/editing measurements + Shift-key straight lines
- Added **measurement selection**: clicking a measurement item in the sidebar selects it
  - Selected measurement is highlighted on the canvas (thicker line, larger endpoint circles, darker color)
  - Clicking the same item again deselects it
  - Selection clears automatically when starting a new measurement or deleting the selected item
  - Delete button click does not trigger selection (event propagation stopped)
- Added `selectedId` state and `selectMeasurement(id)` to `useMeasurement` hook
- Added **shift-key axis snapping** for straight measurement lines:
  - Holding Shift while placing the end point snaps to the nearest axis (horizontal or vertical)
  - If the line is more horizontal (dx >= dy), snaps to a perfectly horizontal line
  - If the line is more vertical (dy > dx), snaps to a perfectly vertical line
  - Added `snapToAxis(start, end)` utility function in `geometry.ts`
  - Shift hint displayed in the sidebar instruction during end-point placement
- Extended `FloorPlanCanvas.onStageClick` to pass `shiftKey` boolean from the DOM event
- Added 6 tests for `snapToAxis` utility
- Added 5 tests for selection in `useMeasurement` hook
- Added 5 tests for selection + shift hint in `MeasurementTool` component
- Updated 1 existing FloorPlanCanvas test for `shiftKey` parameter
- All 123 frontend tests passing, all 12 backend tests passing
- Files modified:
  - `frontend/src/utils/geometry.ts` (added `snapToAxis`)
  - `frontend/src/utils/geometry.test.ts` (6 new tests)
  - `frontend/src/hooks/useMeasurement.ts` (added `selectedId`, `selectMeasurement`)
  - `frontend/src/hooks/useMeasurement.test.ts` (5 new tests)
  - `frontend/src/components/MeasurementTool/MeasurementTool.tsx` (selection UI, shift hint, overlay highlighting)
  - `frontend/src/components/MeasurementTool/MeasurementTool.test.tsx` (5 new tests)
  - `frontend/src/components/FloorPlanCanvas/FloorPlanCanvas.tsx` (`shiftKey` passthrough)
  - `frontend/src/components/FloorPlanCanvas/FloorPlanCanvas.test.tsx` (updated mock event)
  - `frontend/src/App.tsx` (shift-key snap routing, selection wiring)

## [Session 7] - 2026-02-08

### Task 9: MeasurementTool component + useMeasurement hook
- Created `useMeasurement` hook managing the full measurement workflow:
  - States: `idle` → `placing-start` → `placing-end` → (measurement saved, back to `placing-start`)
  - After completing a measurement, automatically continues in measuring mode for consecutive measurements
  - `startMeasuring()`, `handleCanvasClick()`, `deleteMeasurement()`, `clearAllMeasurements()`, `cancelMeasuring()`
  - Each measurement stores start/end points, pixel distance, and a unique ID
- Created `MeasurementOverlay` component (Konva Layer) that renders:
  - Orange measurement lines between start and end points
  - Circle markers at each endpoint
  - Active start point indicator while placing the end point
- Created `MeasurementTool` sidebar component with:
  - "Measure" button to start measuring
  - Instructions during point placement
  - "Stop measuring" cancel button
  - List of completed measurements with delete buttons per item
  - "Clear all" button to remove all measurements
- Integrated into `App.tsx` with canvas click routing between calibration and measurement tools
- Created 13 tests for `useMeasurement` hook covering all state transitions and edge cases
- Created 21 tests for `MeasurementTool` and `MeasurementOverlay` components
- Files created:
  - `frontend/src/hooks/useMeasurement.ts`
  - `frontend/src/hooks/useMeasurement.test.ts`
  - `frontend/src/components/MeasurementTool/MeasurementTool.tsx`
  - `frontend/src/components/MeasurementTool/MeasurementTool.test.tsx`
- Files modified:
  - `frontend/src/App.tsx`

### Task 10: Display real-world measurements on each line
- Measurement overlay renders `Text` labels at the midpoint of each measurement line
- When calibrated: displays distance in cm (e.g. "150.0 cm") using `pixelsToCm` utility
- When not calibrated: displays distance in pixels (e.g. "300.0 px") as fallback
- Sidebar measurement list also shows cm/px values matching the overlay labels
- Labels use orange color scheme with white shadow for readability over floor plan images
- All 107 frontend tests passing, all 12 backend tests passing

## [Session 6] - 2026-02-08

### UI Refactor: Modern bubbly design with vintage measurement aesthetic
- Introduced custom color palette (sage, teal, cream, orange) as Tailwind v4 `@theme` variables in `index.css`
- **Layout**: Orange header bar with logo + two-tone "FloorPlanner" text (Fredoka One font), canvas area (centered in white rounded card), floating cream sidebar with rounded corners
- **Logo**: Added `logo.png` to `frontend/public/` — circular framed in header with text stroke
- **Bubbly style**: All buttons are pill-shaped (`rounded-full`), status badge is a pill, instruction text in rounded-xl cards, inputs in rounded-xl, canvas card in rounded-2xl with shadow-lg
- **Floating sidebar**: Cream background (`bg-fp-cream`), rounded-2xl, detached from header with margin, shadow-lg
- **Typography**: Fredoka One for logo text, Nunito for all UI elements, bold text throughout
- **Borders**: `#0f0000` border on header, sidebar, floor plan card, and all buttons; text stroke on logo
- **Ruler background**: Vintage graph-paper grid pattern on main area — warm parchment base with sepia-toned major/minor grid lines
- Restyled all components (ImageUploader, CalibrationTool, FloorPlanCanvas empty state) to match
- Added color palette documentation to `claude.md`
- All 73 frontend tests still passing
- Files modified:
  - `frontend/src/index.css` (color palette, ruler background, border color)
  - `frontend/index.html` (Google Fonts: Fredoka One + Nunito, page title)
  - `frontend/src/App.tsx` (sidebar layout, orange header with logo, floating sidebar, ruler bg)
  - `frontend/src/components/ImageUploader/ImageUploader.tsx` (pill button, bold, border)
  - `frontend/src/components/CalibrationTool/CalibrationTool.tsx` (pill buttons, bold, borders)
  - `frontend/src/components/FloorPlanCanvas/FloorPlanCanvas.tsx` (rounded empty state)
  - `frontend/public/logo.png` (copied from project root)
  - `claude.md` (color palette table)

## [Session 5] - 2026-02-08

### Task 7: CalibrationTool component + useCalibration hook
- Created `useCalibration` hook managing the full calibration workflow:
  - States: `idle` → `placing-start` → `placing-end` → `awaiting-input` → `calibrated`
  - `startCalibration()`, `handleCanvasClick()`, `setRealWorldLength()`, `resetCalibration()`
  - Computes cm-per-pixel ratio using existing `calculateDistance` and `calculatePixelRatio` utilities
- Created `CalibrationOverlay` component (Konva Layer) that renders:
  - Reference line (dashed blue) between start and end points
  - Circle markers at each endpoint
- Modified `FloorPlanCanvas` to accept:
  - `children` prop for additional Konva layers (overlay rendering)
  - `onStageClick` prop forwarding pointer position from Konva stage events
- Created 11 tests for `useCalibration` hook covering all state transitions and edge cases
- Updated FloorPlanCanvas tests with 3 new tests for `onStageClick` and `children`
- Files created:
  - `frontend/src/hooks/useCalibration.ts`
  - `frontend/src/hooks/useCalibration.test.ts`
  - `frontend/src/components/CalibrationTool/CalibrationTool.tsx`
  - `frontend/src/components/CalibrationTool/CalibrationTool.test.tsx`
- Files modified:
  - `frontend/src/components/FloorPlanCanvas/FloorPlanCanvas.tsx`
  - `frontend/src/components/FloorPlanCanvas/FloorPlanCanvas.test.tsx`
  - `frontend/src/App.tsx`

### Task 8: Calibration UI - status display, ratio, recalibration
- Added persistent status badge with colored indicator dot:
  - Gray dot + "Not calibrated" (idle)
  - Yellow dot + "Calibrating..." (placing-start/placing-end/awaiting-input)
  - Green dot + "Calibrated" (calibrated)
- Added Cancel button during all calibration steps (placing-start, placing-end, awaiting-input)
- CalibrationTool shows "Calibrate" button when idle, instructions during point placement, length input form when line is drawn, and ratio + "Recalibrate" button when complete
- CalibrationTool only renders below canvas when an image is uploaded
- Added 7 new tests for status badge and cancel button functionality
- All 73 frontend tests passing, all 12 backend tests passing
- Files modified:
  - `frontend/src/components/CalibrationTool/CalibrationTool.tsx`
  - `frontend/src/components/CalibrationTool/CalibrationTool.test.tsx`

## [Session 4] - 2026-02-08

### Bug Fix: Duplicate Image on Upload
- Removed local preview from `ImageUploader` component — the image was displayed both as a blob preview in ImageUploader and on the FloorPlanCanvas, causing it to appear twice
- Removed unused `preview` state, `URL.createObjectURL` call, and preview `<img>` element
- Removed corresponding preview test and `createObjectURL`/`revokeObjectURL` mocks
- All 38 frontend tests passing
- Files modified:
  - `frontend/src/components/ImageUploader/ImageUploader.tsx`
  - `frontend/src/components/ImageUploader/ImageUploader.test.tsx`

## [Session 1] - 2026-01-29

### Task 0: Initialize Project Structure
- Created full directory structure (backend + frontend with all component subdirs)
- Initialized FastAPI backend with uv: fastapi, uvicorn, python-multipart
- Added dev dependencies: pytest, pytest-asyncio, httpx
- Created minimal FastAPI app with /health endpoint
- Created pytest conftest with async client fixture
- Initialized Vite + React + TypeScript frontend
- Installed react-konva, konva
- Configured vitest with jsdom environment
- Set up Tailwind CSS v4 with @tailwindcss/vite plugin
- Pinned Python to 3.12 via `.python-version` (uv defaulted to 3.14)
- Commented out ROS setup.bash in ~/.bashrc to avoid pytest conflicts
- Verified pytest runs (0 tests collected, clean exit)
- Verified vitest runs
- Files created/modified:
  - `backend/pyproject.toml`
  - `backend/app/__init__.py`, `backend/app/main.py`
  - `backend/app/routers/__init__.py`, `backend/app/services/__init__.py`, `backend/app/models/__init__.py`
  - `backend/app/models/schemas.py`
  - `backend/tests/__init__.py`, `backend/tests/conftest.py`
  - `frontend/` (full Vite scaffold)
  - `frontend/vite.config.ts` (tailwind + vitest config)
  - `frontend/src/setupTests.ts`
  - `frontend/src/index.css` (tailwind import)

### Task 1: Geometry Utilities
- Created `frontend/src/types/index.ts` with Point interface
- Created `frontend/src/utils/geometry.ts` with 4 pure functions:
  - `calculateDistance` - Euclidean distance between two points
  - `calculatePixelRatio` - cm-per-pixel ratio from reference measurement
  - `pixelsToCm` - convert pixels to centimeters
  - `cmToPixels` - convert centimeters to pixels
- Created `frontend/src/utils/geometry.test.ts` with 19 tests covering:
  - Distance: same point, horizontal, vertical, 3-4-5 triangle, negatives, symmetry, large values
  - Pixel ratio: normal, zero distance, 1:1, ratio > 1
  - Pixels-to-cm: normal, zero pixels, zero ratio
  - Cm-to-pixels: normal, zero cm, zero ratio
  - Round-trip: pixels→cm→pixels, cm→pixels→cm
- All 19 tests passing

## [Session 2] - 2026-01-29

### Task 2: Health Endpoint Test + CORS Middleware
- Created `backend/tests/test_health.py` with 2 tests:
  - `test_health_check` - verifies GET /health returns `{"status": "ok"}`
  - `test_health_check_method_not_allowed` - verifies POST /health returns 405
- Added CORS middleware to FastAPI app allowing `http://localhost:5173` (Vite dev server)
- Files created/modified:
  - `backend/tests/test_health.py`
  - `backend/app/main.py`

### Task 3: CORS Middleware Test
- Created `backend/tests/test_cors.py` with 3 tests:
  - `test_cors_allows_frontend_origin` - preflight from localhost:5173 returns correct headers
  - `test_cors_blocks_unknown_origin` - preflight from unknown origin is rejected
  - `test_cors_allows_credentials` - credentials are allowed for frontend origin
- Files created:
  - `backend/tests/test_cors.py`

### Task 4: Image Upload Endpoint
- Created `backend/app/models/schemas.py` with `UploadResponse` Pydantic model (image_id, filename, content_type, width, height)
- Created `backend/app/routers/upload.py` with:
  - `ImageStore` class - in-memory image storage with save/get/clear
  - `_get_image_dimensions` - extracts width/height from PNG (IHDR) and JPEG (SOF0/SOF2) headers without external deps
  - `POST /upload/` - validates file type (PNG/JPEG), size (10 MB max), extracts dimensions, stores in memory
  - `GET /upload/{image_id}` - retrieves stored image by ID
- Created `backend/tests/test_upload.py` with 7 tests:
  - Upload valid PNG, upload valid JPEG, reject invalid type, reject empty file, reject corrupt image, retrieve uploaded image, 404 for nonexistent image
  - Includes helpers `_make_png` and `_make_jpeg` to generate minimal valid image bytes for testing
- Registered upload router in `main.py`
- All 12 backend tests passing, all 19 frontend tests passing
- Files created/modified:
  - `backend/app/routers/upload.py`
  - `backend/app/models/schemas.py`
  - `backend/app/main.py`
  - `backend/tests/test_upload.py`

## [Session 3] - 2026-01-29

### Task 5: FloorPlanCanvas Component
- Created `FloorPlanCanvas` component using react-konva `Stage`, `Layer`, and `Image`
- Component accepts `imageSrc` (URL), optional `width`/`height` props
- Shows empty state placeholder when no image is loaded
- Auto-sizes stage to image natural dimensions, with fallback to 800x600
- Loads image via `HTMLImageElement` in a `useEffect`, handles load errors gracefully
- Created 11 tests with mocked react-konva (Konva requires real canvas, unavailable in jsdom):
  - Empty state rendering, Konva stage presence, image loading, natural dimension sizing,
    custom dimension override, default dimensions before load, no image before load,
    clearing image on null src, error handling
- All 30 frontend tests passing
- Files created:
  - `frontend/src/components/FloorPlanCanvas/FloorPlanCanvas.tsx`
  - `frontend/src/components/FloorPlanCanvas/FloorPlanCanvas.test.tsx`

### Task 6: ImageUploader Component + App Integration
- Created API client at `frontend/src/api/client.ts` with:
  - `UploadResponse` interface matching backend schema
  - `uploadImage(file)` - POSTs file as FormData to `/upload/`, returns metadata
  - `getImageUrl(imageId)` - builds URL to retrieve uploaded image by ID
- Created `ImageUploader` component with:
  - Hidden file input (PNG/JPEG only) triggered by styled upload button
  - Local preview via `URL.createObjectURL` shown after file selection
  - Async upload to backend with loading/disabled state during upload
  - Error display for invalid file types and upload failures
  - Error clearing on subsequent valid file selection
- Created 9 tests with mocked API client:
  - Button rendering, hidden input, file dialog trigger, invalid type error,
    preview display, onUpload callback, uploading state, error on failure,
    error clearing on retry
- Rewired `App.tsx` to use `ImageUploader` + `FloorPlanCanvas`:
  - Upload triggers `getImageUrl` which is passed as `imageSrc` to canvas
- All 39 frontend tests passing, all 12 backend tests passing
- Files created/modified:
  - `frontend/src/api/client.ts`
  - `frontend/src/components/ImageUploader/ImageUploader.tsx`
  - `frontend/src/components/ImageUploader/ImageUploader.test.tsx`
  - `frontend/src/App.tsx` (rewritten)
