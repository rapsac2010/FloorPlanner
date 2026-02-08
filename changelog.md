# Changelog

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
