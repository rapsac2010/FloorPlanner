# FloorPlanner

## Application Description
A web application that allows users to:
1. Upload incomplete floor plan images (PNG, JPEG)
2. Calibrate pixel-to-centimeter ratio by drawing a reference line
3. Measure distances by drawing lines anywhere on the floor plan
4. Design furniture in a dedicated **Furniture Editor** (pop-out window) — draw lines, rectangles, and circles with real-world dimensions (cm), save furniture designs, then **place saved furniture onto the main floor plan** canvas
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
│   │   │   ├── FurnitureEditor/
│   │   │   └── Toolbar/
│   │   ├── hooks/
│   │   │   ├── useCalibration.ts
│   │   │   ├── useMeasurement.ts
│   │   │   └── useFurniture.ts
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
- [x] Task 2: Backend - Health endpoint test + CORS middleware for frontend (port 5173)
- [x] Task 3: Backend - CORS middleware configuration (allow frontend on port 5173) + test
- [x] Task 4: Backend - Image upload endpoint (accept PNG/JPEG, store in memory/temp) + tests

### Phase 2: Core Canvas
- [x] Task 5: FloorPlanCanvas component - display uploaded image on Konva Stage
- [x] Task 6: ImageUploader component - file input, preview, upload to backend, wire into App.tsx with FloorPlanCanvas to display the uploaded image

### Phase 3: Calibration
- [x] Task 7: CalibrationTool component + useCalibration hook - draw a reference line on canvas, input real-world length (cm), calculate and store pixel ratio
- [x] Task 8: Calibration UI - display calibration status, current ratio, and allow recalibration

### Phase 4: Measurement
- [x] Task 9: MeasurementTool component + useMeasurement hook - draw lines on canvas, track all measurements
- [x] Task 10: Display real-world measurements on each line (using calibration ratio)
- [x] Task 11: Allow deleting/editing measurements

### Phase 5: Furniture Editor
- [x] Task 12: FurnitureEditor component + useFurniture hook — dedicated panel with its own Konva canvas for designing furniture, pop-out into a separate browser window, manage furniture shape state
- [x] Task 13: Line drawing tool with length input (cm) in Furniture Editor
- [ ] Task 14: Rectangle drawing tool with width/height inputs (cm) in Furniture Editor
- [ ] Task 15: Circle drawing tool with radius input (cm) in Furniture Editor
- [ ] Task 16: Save/load furniture designs — serialize shapes to JSON, persist to localStorage, load saved designs back into the editor
- [ ] Task 16b: Place saved furniture on floor plan — select from saved furniture library, click to place on main canvas, drag to reposition, scale respects calibration ratio

### Phase 6: AI Integration (Optional)
- [ ] Task 17: Backend - image generation proxy endpoint
- [ ] Task 18: Frontend - prompt input for selected bounding box
- [ ] Task 19: Display generated image within bounds

### Phase 7: Polish
- [ ] Task 20: Toolbar component - tool selection UI
- [ ] Task 21: Undo/redo functionality
- [ ] Task 22: Export measurements as JSON/CSV
- [ ] Task 23: Save/load project state

## Color Palette

Defined as Tailwind v4 theme variables in `frontend/src/index.css` under `@theme`.

| Token          | Hex       | Usage                                    |
|----------------|-----------|------------------------------------------|
| `fp-sage`      | `#91C6BC` | Calibration buttons, success accents     |
| `fp-sage-light`| `#B5D8D1` | Borders, subtle fills                    |
| `fp-sage-dark` | `#6FA99F` | Hover states, calibrated status          |
| `fp-teal`      | `#4B9DA9` | Primary buttons (upload), header bg, section labels |
| `fp-teal-light`| `#6FB4BE` | Light accent                             |
| `fp-teal-dark` | `#3A7F89` | Header border, text on cream             |
| `fp-cream`     | `#F6F3C2` | Sidebar background                       |
| `fp-cream-light`| `#FAF8DC`| Page background, status badge bg         |
| `fp-cream-dark`| `#EDE8A0` | Section dividers, idle status dots       |
| `fp-orange`    | `#E37434` | Error text, active calibration dot       |
| `fp-orange-light`| `#F09A66`| Hover accent                           |
| `fp-orange-dark`| `#C45E24` | Emphasis                                |

## Environment Notes

- **Python**: 3.12, managed by `uv` (not pip). Pinned via `backend/.python-version`. The backend uses `uv run` to execute commands within the project venv.
- **ROS workaround**: The system has ROS Kilted installed. The `source /opt/ros/kilted/setup.bash` line in `~/.bashrc` was commented out to prevent `launch_testing` from conflicting with pytest (it registers as a pytest plugin and crashes due to a missing `lark` module). If ROS is re-enabled, use `PYTHONPATH="" uv run pytest -v` to clear the ROS Python path.
- **Node**: v22 managed by nvm.
- **Frontend testing**: vitest is configured with `jsdom` environment, `globals: true`, and a setup file at `src/setupTests.ts` that imports `@testing-library/jest-dom`.
- **Tailwind CSS v4**: Uses the Vite plugin (`@tailwindcss/vite`), imported in `src/index.css` as `@import "tailwindcss"`. No `tailwind.config.js` needed — v4 uses CSS-based config.
- **TypeScript**: `tsconfig.app.json` has `vitest/globals` in types array for global test helpers.
- **Backend app**: FastAPI app is in `backend/app/main.py`. The `/health` endpoint already exists. The conftest at `backend/tests/conftest.py` provides an async `client` fixture using `httpx.AsyncClient` with `ASGITransport`.
- **pytest-asyncio**: Configured with `asyncio_mode = "strict"` in `pyproject.toml`. Auto mode conflicts with the `anyio` plugin (transitive dep of httpx). Async test functions need `@pytest.mark.asyncio` and async fixtures need `@pytest_asyncio.fixture`.

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
Last completed: Task 13
Next task: Task 14
