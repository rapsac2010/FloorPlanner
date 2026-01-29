# Changelog

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
