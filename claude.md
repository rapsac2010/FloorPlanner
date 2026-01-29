# FloorPlanner

## Application Description
A web application that allows users to:
1. Upload incomplete floor plan images (PNG, JPEG)
2. Calibrate pixel-to-centimeter ratio by drawing a reference line
3. Measure distances by drawing lines anywhere on the floor plan
4. Create shapes (lines, rectangles, circles) with real-world dimensions in a separate drawing canvas
5. (Optional) Generate furniture images via AI within drawn bounding boxes

## Tech Stack
- **Backend**: FastAPI (Python) with uv for package management
- **Frontend**: React 18+ with TypeScript
- **Canvas Library**: react-konva (Konva.js React bindings)
- **Build Tool**: Vite
- **Testing**: pytest + httpx (backend), vitest + @testing-library/react (frontend)
- **Styling**: Tailwind CSS v4

## Architecture

```
floorplanner/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app entry
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── upload.py        # Image upload endpoints
│   │   │   └── generate.py      # AI image generation proxy
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── image_gen.py     # Image generation service
│   │   └── models/
│   │       ├── __init__.py
│   │       └── schemas.py       # Pydantic models
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── test_upload.py
│   │   └── test_generate.py
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── FloorPlanCanvas/
│   │   │   ├── ImageUploader/
│   │   │   ├── CalibrationTool/
│   │   │   ├── MeasurementTool/
│   │   │   ├── ShapeDrawer/
│   │   │   └── Toolbar/
│   │   ├── hooks/
│   │   │   ├── useCalibration.ts
│   │   │   ├── useMeasurement.ts
│   │   │   └── useShapes.ts
│   │   ├── utils/
│   │   │   ├── geometry.ts
│   │   │   └── geometry.test.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── api/
│   │       └── client.ts
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── claude.md
├── changelog.md
└── README.md
```

## Task List

### Phase 1: Foundation
- [x] Task 0: Initialize Project Structure
- [x] Task 1: Geometry Utilities (pure functions + tests)
- [ ] Task 2: Backend - Basic FastAPI setup with health endpoint + test
- [ ] Task 3: Backend - Image upload endpoint (accept PNG/JPEG, store in memory/temp) + tests

### Phase 2: Core Canvas
- [ ] Task 4: FloorPlanCanvas component - display uploaded image on Konva Stage
- [ ] Task 5: ImageUploader component - file input, preview, upload to backend
- [ ] Task 6: Integration - upload image and display on canvas

### Phase 3: Calibration
- [ ] Task 7: CalibrationTool component - draw a single line on canvas
- [ ] Task 8: CalibrationTool - input field for real-world length (cm)
- [ ] Task 9: useCalibration hook - store calibration state, calculate ratio
- [ ] Task 10: Display calibration status and current ratio

### Phase 4: Measurement
- [ ] Task 11: MeasurementTool component - draw lines anywhere on canvas
- [ ] Task 12: useMeasurement hook - track all measurement lines
- [ ] Task 13: Display real-world measurements on each line (using calibration)
- [ ] Task 14: Allow deleting/editing measurements

### Phase 5: Shape Drawing
- [ ] Task 15: ShapeDrawer component - separate canvas/stage for shapes
- [ ] Task 16: Line drawing tool with length input (cm)
- [ ] Task 17: Rectangle drawing tool with width/height inputs (cm)
- [ ] Task 18: Circle drawing tool with radius input (cm)
- [ ] Task 19: useShapes hook - manage shape state
- [ ] Task 20: Shape merging/grouping functionality

### Phase 6: AI Integration (Optional)
- [ ] Task 21: Backend - image generation proxy endpoint
- [ ] Task 22: Frontend - prompt input for selected bounding box
- [ ] Task 23: Display generated image within bounds

### Phase 7: Polish
- [ ] Task 24: Toolbar component - tool selection UI
- [ ] Task 25: Undo/redo functionality
- [ ] Task 26: Export measurements as JSON/CSV
- [ ] Task 27: Save/load project state

## Environment Notes

- **Python**: 3.12, managed by `uv` (not pip). Pinned via `backend/.python-version`. The backend uses `uv run` to execute commands within the project venv.
- **ROS workaround**: The system has ROS Kilted installed. The `source /opt/ros/kilted/setup.bash` line in `~/.bashrc` was commented out to prevent `launch_testing` from conflicting with pytest (it registers as a pytest plugin and crashes due to a missing `lark` module). If ROS is re-enabled, use `PYTHONPATH="" uv run pytest -v` to clear the ROS Python path.
- **Node**: v22 managed by nvm.
- **Frontend testing**: vitest is configured with `jsdom` environment, `globals: true`, and a setup file at `src/setupTests.ts` that imports `@testing-library/jest-dom`.
- **Tailwind CSS v4**: Uses the Vite plugin (`@tailwindcss/vite`), imported in `src/index.css` as `@import "tailwindcss"`. No `tailwind.config.js` needed — v4 uses CSS-based config.
- **TypeScript**: `tsconfig.app.json` has `vitest/globals` in types array for global test helpers.
- **Backend app**: FastAPI app is in `backend/app/main.py`. The `/health` endpoint already exists. The conftest at `backend/tests/conftest.py` provides an async `client` fixture using `httpx.AsyncClient` with `ASGITransport`.
- **pytest-asyncio**: Configured with `asyncio_mode = "auto"` in `pyproject.toml` so async test functions don't need the `@pytest.mark.asyncio` decorator.

## Commands Reference

```bash
# Backend - install deps and run tests
cd backend
uv sync                        # install/sync all dependencies
uv run pytest -v               # run all tests
uv run pytest -v -k "test_name"  # run specific test
uv run uvicorn app.main:app --reload  # start dev server on port 8000

# Frontend - install deps and run tests
cd frontend
npm install                    # install all dependencies
npx vitest --run               # run tests once (for CI / verification)
npm test                       # run tests in watch mode (for development)
npm run dev                    # start Vite dev server
npm run build                  # production build (runs tsc + vite build)
npm run lint                   # ESLint check

# If ROS is re-enabled in ~/.bashrc and pytest crashes:
PYTHONPATH="" uv run pytest -v
```

## Current Status
Last completed: Task 1
Next task: Task 2
