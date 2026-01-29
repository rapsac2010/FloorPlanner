# FloorPlanner Agent - Continuation Prompt

You are a coding agent continuing work on the **FloorPlanner** application. This is a continuation run.

## Your Workflow

1. **Read `claude.md`** - Find the current status and next uncompleted task
2. **Read `changelog.md`** - Understand what was done in previous sessions
3. **Complete the next 1-3 tasks** (depending on complexity)
4. **Run tests** - Verify all tests pass before marking complete
5. **Update `claude.md`** - Check off completed tasks, update status
6. **Update `changelog.md`** - Document what you did

---

## Critical Rules

### Before Starting
```bash
# Always start by reading project state
cat claude.md
cat changelog.md

# Check current test status
# IMPORTANT: Backend uses uv (not pip/pytest directly)
cd backend && uv run pytest -v
cd ../frontend && npx vitest --run
```

### Task Completion Checklist
For EACH task, you must:
- [ ] Write/update tests FIRST (or alongside)
- [ ] Implement the feature
- [ ] Run tests locally: `uv run pytest -v` (backend) and/or `npx vitest --run` (frontend)
- [ ] ALL tests must pass (including previous tests)
- [ ] Update `claude.md` - mark task complete with [x]
- [ ] Update `changelog.md` - document changes

### Code Quality Standards
- **Modularity**: One component/module per file
- **Types**: Use TypeScript strictly (no `any` unless absolutely necessary)
- **Comments**: Add JSDoc/docstrings for public functions
- **Naming**: Descriptive names, no abbreviations
- **Tests**: Aim for >80% coverage on utilities, test key component behaviors

### If Tests Fail
1. Read the error message carefully
2. Fix the issue
3. Re-run tests
4. Do NOT mark task complete until tests pass

### If Stuck
- Document the blocker in `claude.md` under a "## Blockers" section
- Move to the next task if possible
- Leave detailed notes for the next session

---

## File Templates

### React Component Template
```tsx
// frontend/src/components/ComponentName/ComponentName.tsx
import React from 'react';

interface ComponentNameProps {
  // Define props
}

/**
 * Brief description of what this component does
 */
export const ComponentName: React.FC<ComponentNameProps> = (props) => {
  return (
    <div data-testid="component-name">
      {/* Implementation */}
    </div>
  );
};
```

### React Component Test Template
```tsx
// frontend/src/components/ComponentName/ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByTestId('component-name')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<ComponentName />);
    // Test interactions
  });
});
```

### FastAPI Router Template
```python
# backend/app/routers/feature.py
from fastapi import APIRouter, HTTPException, UploadFile
from app.models.schemas import FeatureRequest, FeatureResponse

router = APIRouter(prefix="/feature", tags=["feature"])

@router.post("/", response_model=FeatureResponse)
async def create_feature(request: FeatureRequest):
    """
    Brief description of endpoint.
    """
    # Implementation
    return FeatureResponse(...)
```

### Pytest Test Template
```python
# backend/tests/test_feature.py
# NOTE: pytest-asyncio is configured with asyncio_mode="auto" in pyproject.toml,
# so you do NOT need the @pytest.mark.asyncio decorator.
# The `client` fixture is defined in conftest.py using httpx AsyncClient + ASGITransport.

async def test_feature_endpoint(client):
    response = await client.post("/feature/", json={"key": "value"})
    assert response.status_code == 200
    assert response.json()["key"] == "expected"
```

### Custom Hook Template
```tsx
// frontend/src/hooks/useFeature.ts
import { useState, useCallback } from 'react';

interface UseFeatureReturn {
  // Define return type
}

/**
 * Hook for managing feature state
 */
export const useFeature = (): UseFeatureReturn => {
  const [state, setState] = useState<StateType>(initialState);
  
  const action = useCallback(() => {
    // Implementation
  }, []);

  return { state, action };
};
```

---

## Changelog Entry Format

```markdown
## [Session N] - YYYY-MM-DD

### Task X: Task Name
- What was implemented
- What tests were added
- Any notable decisions made
- Files created/modified:
  - `path/to/file1.ts`
  - `path/to/file2.py`

### Task Y: Task Name
...
```

---

## Quick Reference: Project Commands

```bash
# Backend (uses uv, NOT pip)
cd backend
uv sync                          # Install/sync all dependencies
uv run pytest -v                 # Run all tests
uv run pytest -v -k "test_name" # Run specific test
uv run uvicorn app.main:app --reload  # Start dev server (port 8000)

# Frontend
cd frontend
npm install                      # Install dependencies
npx vitest --run                 # Run tests once (CI/verification)
npm test                         # Run tests in watch mode (development)
npm run dev                      # Start Vite dev server
npm run build                    # Production build (tsc + vite build)
npm run lint                     # ESLint check
```

---

## Environment Notes

- **Python**: Managed by `uv`. Do NOT use `pip` or bare `pytest` — always use `uv run pytest`.
- **ROS workaround**: `source /opt/ros/kilted/setup.bash` was commented out in `~/.bashrc` because `launch_testing` registers as a pytest plugin and crashes. If ROS is re-enabled, prefix pytest commands with `PYTHONPATH=""`.
- **pytest-asyncio**: `asyncio_mode = "auto"` is set in `pyproject.toml` — no need for `@pytest.mark.asyncio` decorator.
- **Tailwind CSS v4**: Uses Vite plugin, no `tailwind.config.js`. CSS config via `@import "tailwindcss"` in `src/index.css`.
- **vitest**: Configured in `vite.config.ts` with `jsdom` env, `globals: true`, setup file at `src/setupTests.ts`.
- **conftest.py**: Provides async `client` fixture using `httpx.AsyncClient` with `ASGITransport`.

---

## State Verification Commands

Run these to verify project health:

```bash
# Check nothing is broken
cd backend && uv run pytest -v && cd ../frontend && npx vitest --run

# Check git status
git status
git log --oneline -5
```

---

## BEGIN

1. Read `claude.md` to find your next task
2. Read `changelog.md` to understand context
3. Run existing tests to verify starting state
4. Complete the next task(s)
5. Update documentation
6. Commit your changes