# FloorPlanner Agent - Initial Setup Prompt

You are a coding agent tasked with building the **FloorPlanner** application. This is your first run. Your primary goals are:

1. Initialize the project structure
2. Document the full app specification in `claude.md`
3. Break down ALL work into small, testable tasks in `claude.md`
4. Complete only the first 1-2 foundational tasks

## Important Principles

- **Modularity**: Every feature should be its own module/component. The human reviewer has limited JS experience.
- **Small PRs**: Each task should be completable in ~50-150 lines of code max.
- **Tests First**: Write tests before or alongside implementation. Never mark a task done without passing tests.
- **Self-Verify**: You have CLI access. Run tests yourself before marking complete.
- **Document Everything**: Update `changelog.md` after each task.

---

## Application Specification: FloorPlanner

### Overview
A web application that allows users to:
1. Upload incomplete floor plan images (PNG, JPEG)
2. Calibrate pixel-to-centimeter ratio by drawing a reference line
3. Measure distances by drawing lines anywhere on the floor plan
4. Create shapes (lines, rectangles, circles) with real-world dimensions in a separate drawing canvas
5. (Optional) Generate furniture images via AI within drawn bounding boxes

### Tech Stack (Required)
- **Backend**: FastAPI (Python) - for API endpoints and image model proxy
- **Frontend**: React 18+ with TypeScript
- **Canvas Library**: react-konva (Konva.js React bindings)
- **Build Tool**: Vite
- **Testing**: 
  - Backend: pytest + httpx (for async testing)
  - Frontend: vitest + @testing-library/react
- **Styling**: Tailwind CSS (utility classes, easy to read)

### Architecture

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
│   ├── requirements.txt
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── FloorPlanCanvas/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── FloorPlanCanvas.tsx
│   │   │   │   ├── FloorPlanCanvas.test.tsx
│   │   │   │   └── types.ts
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
│   │   │   ├── geometry.ts      # Pure functions for calculations
│   │   │   ├── geometry.test.ts
│   │   │   └── conversions.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── api/
│   │       └── client.ts
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── tailwind.config.js
├── claude.md                    # This file - app spec + task tracking
├── changelog.md                 # Log of all changes
└── README.md
```

---

## Your First Run Tasks

### Task 0: Initialize Project Structure
- [ ] Create the directory structure as shown above
- [ ] Initialize backend with FastAPI, create `requirements.txt`
- [ ] Initialize frontend with Vite + React + TypeScript
- [ ] Set up Tailwind CSS
- [ ] Set up testing frameworks (pytest, vitest)
- [ ] Create initial `claude.md` with full task breakdown
- [ ] Create `changelog.md`
- [ ] Verify both `npm test` and `pytest` run (even if no tests yet)

### Task 1: Geometry Utilities (Frontend)
- [ ] Create `frontend/src/utils/geometry.ts` with pure functions:
  - `calculateDistance(point1, point2): number` - Euclidean distance in pixels
  - `calculatePixelRatio(pixelDistance, realWorldCm): number` - cm per pixel
  - `pixelsToCm(pixels, ratio): number` - convert pixels to cm
  - `cmToPixels(cm, ratio): number` - convert cm to pixels
- [ ] Write comprehensive tests in `geometry.test.ts`
- [ ] All tests must pass

---

## Full Task Breakdown (Write to claude.md)

You must write ALL of these tasks to `claude.md`. Mark Task 0 and Task 1 as your current focus.

### Phase 1: Foundation
- [ ] Task 0: Initialize Project Structure
- [ ] Task 1: Geometry Utilities (pure functions + tests)
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

---

## Output Format

After completing your work, your `claude.md` should look like:

```markdown
# FloorPlanner

## Application Description
[Full description here]

## Tech Stack
[List here]

## Architecture
[Diagram/description here]

## Task List

### Phase 1: Foundation
- [x] Task 0: Initialize Project Structure
- [x] Task 1: Geometry Utilities
- [ ] Task 2: Backend - Basic FastAPI setup
...

## Current Status
Last completed: Task 1
Next task: Task 2
```

Your `changelog.md` should look like:

```markdown
# Changelog

## [Session 1] - YYYY-MM-DD

### Task 0: Initialize Project Structure
- Created directory structure
- Initialized FastAPI backend with requirements.txt
- Initialized Vite + React + TypeScript frontend
- Configured Tailwind CSS
- Set up pytest and vitest
- Verified test commands run

### Task 1: Geometry Utilities
- Created geometry.ts with distance/ratio calculations
- Added 12 unit tests covering edge cases
- All tests passing
```

---

## Commands Reference

```bash
# Backend
cd backend
pip install -r requirements.txt
pytest -v

# Frontend  
cd frontend
npm install
npm test
npm run dev
```

---

## BEGIN

Start by creating the project structure. Initialize git. Then proceed with Task 0 and Task 1 only. Update `claude.md` and `changelog.md` before finishing.