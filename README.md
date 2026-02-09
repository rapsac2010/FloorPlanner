# FloorPlanner

A web application for working with floor plan images. Upload incomplete floor plans, calibrate pixel-to-real-world measurements, measure distances, design furniture in a pop-out editor with real-world dimensions, place furniture on the floor plan, and optionally generate furniture images via AI.

## Features

- **Image Upload** - Upload floor plan images (PNG, JPEG)
- **Calibration** - Draw a reference line and set its real-world length to establish a pixel-to-cm ratio
- **Measurement** - Draw lines on the floor plan to measure real-world distances
- **Furniture Editor** - Design furniture in a pop-out editor using lines, rectangles, and circles with real-world dimensions (cm), save designs, then place them onto the floor plan
- **AI Generation** *(optional)* - Generate furniture images within drawn bounding boxes

## Tech Stack

- **Backend**: FastAPI (Python 3.12) with uv
- **Frontend**: React + TypeScript, Vite, react-konva
- **Styling**: Tailwind CSS v4
- **Testing**: pytest (backend), vitest (frontend)

## Getting Started

### Prerequisites

- [uv](https://docs.astral.sh/uv/) (Python package manager)
- [Node.js](https://nodejs.org/) v22+ (via nvm)

### Backend

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

The API server starts at `http://localhost:8000`. Health check: `http://localhost:8000/health`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`.

### Running Tests

```bash
# Backend
cd backend
uv run pytest -v

# Frontend
cd frontend
npx vitest --run
```

## Project Structure

```
floorplanner/
├── backend/           # FastAPI Python backend
│   ├── app/
│   │   ├── main.py    # App entry point
│   │   ├── routers/   # API route handlers
│   │   ├── services/  # Business logic
│   │   └── models/    # Pydantic schemas
│   └── tests/         # pytest tests
├── frontend/          # React + TypeScript frontend
│   └── src/
│       ├── components/  # UI components (Konva canvas, tools, etc.)
│       ├── hooks/       # Custom React hooks
│       ├── utils/       # Pure utility functions (geometry, conversions)
│       ├── types/       # TypeScript type definitions
│       └── api/         # API client
├── claude.md          # Task tracker and project spec
└── changelog.md       # Session-by-session change log
```
