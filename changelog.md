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
