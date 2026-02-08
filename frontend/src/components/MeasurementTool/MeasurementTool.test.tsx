import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MeasurementTool, MeasurementOverlay } from './MeasurementTool';
import type { Measurement } from '../../hooks/useMeasurement';

// Mock react-konva since Konva requires a real canvas
vi.mock('react-konva', () => ({
  Layer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="konva-layer">{children}</div>
  ),
  Line: ({ points, stroke, strokeWidth }: { points: number[]; stroke: string; strokeWidth: number }) => (
    <div data-testid="konva-line" data-points={points.join(',')} data-stroke={stroke} data-stroke-width={strokeWidth} />
  ),
  Circle: ({ x, y, radius }: { x: number; y: number; radius: number }) => (
    <div data-testid="konva-circle" data-x={x} data-y={y} data-radius={radius} />
  ),
  Text: ({ text }: { text: string }) => (
    <div data-testid="konva-text">{text}</div>
  ),
}));

const sampleMeasurements: Measurement[] = [
  {
    id: 'm-1',
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 300, y: 0 },
    pixelDistance: 300,
  },
  {
    id: 'm-2',
    startPoint: { x: 100, y: 100 },
    endPoint: { x: 100, y: 350 },
    pixelDistance: 250,
  },
];

const defaultProps = {
  status: 'idle' as const,
  measurements: [] as Measurement[],
  pixelRatio: null,
  selectedId: null,
  onStartMeasuring: vi.fn(),
  onCancel: vi.fn(),
  onDeleteMeasurement: vi.fn(),
  onClearAll: vi.fn(),
  onSelectMeasurement: vi.fn(),
};

describe('MeasurementTool', () => {
  it('renders the measure button in idle state', () => {
    render(<MeasurementTool {...defaultProps} />);
    expect(screen.getByTestId('measurement-start-btn')).toBeInTheDocument();
    expect(screen.getByTestId('measurement-start-btn')).toHaveTextContent('Measure');
  });

  it('calls onStartMeasuring when measure button is clicked', async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<MeasurementTool {...defaultProps} onStartMeasuring={onStart} />);
    await user.click(screen.getByTestId('measurement-start-btn'));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('shows start point instruction when placing-start', () => {
    render(<MeasurementTool {...defaultProps} status="placing-start" />);
    expect(screen.getByTestId('measurement-instruction')).toHaveTextContent(
      /click the start point/i
    );
    expect(screen.queryByTestId('measurement-start-btn')).not.toBeInTheDocument();
  });

  it('shows end point instruction when placing-end', () => {
    render(<MeasurementTool {...defaultProps} status="placing-end" />);
    expect(screen.getByTestId('measurement-instruction')).toHaveTextContent(
      /click the end point/i
    );
  });

  it('shows cancel button when measuring', () => {
    render(<MeasurementTool {...defaultProps} status="placing-start" />);
    expect(screen.getByTestId('measurement-cancel-btn')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<MeasurementTool {...defaultProps} status="placing-start" onCancel={onCancel} />);
    await user.click(screen.getByTestId('measurement-cancel-btn'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('does not show measurement list when empty', () => {
    render(<MeasurementTool {...defaultProps} />);
    expect(screen.queryByTestId('measurement-list')).not.toBeInTheDocument();
  });

  it('shows measurement list with items', () => {
    render(<MeasurementTool {...defaultProps} measurements={sampleMeasurements} />);
    expect(screen.getByTestId('measurement-list')).toBeInTheDocument();
    expect(screen.getByTestId('measurement-item-m-1')).toBeInTheDocument();
    expect(screen.getByTestId('measurement-item-m-2')).toBeInTheDocument();
  });

  it('displays measurements in pixels when not calibrated', () => {
    render(<MeasurementTool {...defaultProps} measurements={sampleMeasurements} />);
    expect(screen.getByTestId('measurement-item-m-1')).toHaveTextContent('#1: 300.0 px');
    expect(screen.getByTestId('measurement-item-m-2')).toHaveTextContent('#2: 250.0 px');
  });

  it('displays measurements in cm when calibrated', () => {
    render(
      <MeasurementTool
        {...defaultProps}
        measurements={sampleMeasurements}
        pixelRatio={0.5}
      />
    );
    // 300 px * 0.5 cm/px = 150.0 cm
    expect(screen.getByTestId('measurement-item-m-1')).toHaveTextContent('#1: 150.0 cm');
    // 250 px * 0.5 cm/px = 125.0 cm
    expect(screen.getByTestId('measurement-item-m-2')).toHaveTextContent('#2: 125.0 cm');
  });

  it('calls onDeleteMeasurement when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <MeasurementTool
        {...defaultProps}
        measurements={sampleMeasurements}
        onDeleteMeasurement={onDelete}
      />
    );
    await user.click(screen.getByTestId('measurement-delete-m-1'));
    expect(onDelete).toHaveBeenCalledWith('m-1');
  });

  it('shows clear all button when measurements exist', () => {
    render(<MeasurementTool {...defaultProps} measurements={sampleMeasurements} />);
    expect(screen.getByTestId('measurement-clear-all-btn')).toBeInTheDocument();
  });

  it('calls onClearAll when clear all button is clicked', async () => {
    const user = userEvent.setup();
    const onClearAll = vi.fn();
    render(
      <MeasurementTool
        {...defaultProps}
        measurements={sampleMeasurements}
        onClearAll={onClearAll}
      />
    );
    await user.click(screen.getByTestId('measurement-clear-all-btn'));
    expect(onClearAll).toHaveBeenCalledTimes(1);
  });

  it('shows measurement list alongside instructions when measuring', () => {
    render(
      <MeasurementTool
        {...defaultProps}
        status="placing-start"
        measurements={sampleMeasurements}
      />
    );
    expect(screen.getByTestId('measurement-instruction')).toBeInTheDocument();
    expect(screen.getByTestId('measurement-list')).toBeInTheDocument();
  });

  it('calls onSelectMeasurement when clicking a measurement item', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <MeasurementTool
        {...defaultProps}
        measurements={sampleMeasurements}
        onSelectMeasurement={onSelect}
      />
    );
    await user.click(screen.getByTestId('measurement-item-m-1'));
    expect(onSelect).toHaveBeenCalledWith('m-1');
  });

  it('deselects when clicking an already selected item', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <MeasurementTool
        {...defaultProps}
        measurements={sampleMeasurements}
        selectedId="m-1"
        onSelectMeasurement={onSelect}
      />
    );
    await user.click(screen.getByTestId('measurement-item-m-1'));
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('does not call onSelectMeasurement when clicking delete button', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onDelete = vi.fn();
    render(
      <MeasurementTool
        {...defaultProps}
        measurements={sampleMeasurements}
        onSelectMeasurement={onSelect}
        onDeleteMeasurement={onDelete}
      />
    );
    await user.click(screen.getByTestId('measurement-delete-m-1'));
    expect(onDelete).toHaveBeenCalledWith('m-1');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('shows shift-key hint when placing-end', () => {
    render(<MeasurementTool {...defaultProps} status="placing-end" />);
    expect(screen.getByText(/shift/i)).toBeInTheDocument();
  });
});

describe('MeasurementOverlay', () => {
  it('does not render when no measurements and no active point', () => {
    render(
      <MeasurementOverlay
        measurements={[]}
        activeStartPoint={null}
        cursorPoint={null}
        status="idle"
        pixelRatio={null}
      />
    );
    expect(screen.queryByTestId('konva-layer')).not.toBeInTheDocument();
  });

  it('renders active start point marker when placing-end without cursor', () => {
    render(
      <MeasurementOverlay
        measurements={[]}
        activeStartPoint={{ x: 50, y: 75 }}
        cursorPoint={null}
        status="placing-end"
        pixelRatio={null}
      />
    );
    const circles = screen.getAllByTestId('konva-circle');
    expect(circles).toHaveLength(1);
    expect(circles[0]).toHaveAttribute('data-x', '50');
    expect(circles[0]).toHaveAttribute('data-y', '75');
  });

  it('does not render active start point when not placing-end', () => {
    render(
      <MeasurementOverlay
        measurements={[]}
        activeStartPoint={{ x: 50, y: 75 }}
        cursorPoint={null}
        status="placing-start"
        pixelRatio={null}
      />
    );
    expect(screen.queryByTestId('konva-circle')).not.toBeInTheDocument();
  });

  it('renders measurement lines with endpoint circles', () => {
    render(
      <MeasurementOverlay
        measurements={sampleMeasurements}
        activeStartPoint={null}
        cursorPoint={null}
        status="idle"
        pixelRatio={null}
      />
    );
    const lines = screen.getAllByTestId('konva-line');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toHaveAttribute('data-points', '0,0,300,0');
    expect(lines[1]).toHaveAttribute('data-points', '100,100,100,350');
    // 2 measurements * 2 endpoints = 4 circles
    const circles = screen.getAllByTestId('konva-circle');
    expect(circles).toHaveLength(4);
  });

  it('renders distance labels in pixels when not calibrated', () => {
    render(
      <MeasurementOverlay
        measurements={[sampleMeasurements[0]]}
        activeStartPoint={null}
        cursorPoint={null}
        status="idle"
        pixelRatio={null}
      />
    );
    const texts = screen.getAllByTestId('konva-text');
    expect(texts).toHaveLength(1);
    expect(texts[0]).toHaveTextContent('300.0 px');
  });

  it('renders distance labels in cm when calibrated', () => {
    render(
      <MeasurementOverlay
        measurements={[sampleMeasurements[0]]}
        activeStartPoint={null}
        cursorPoint={null}
        status="idle"
        pixelRatio={0.5}
      />
    );
    const texts = screen.getAllByTestId('konva-text');
    expect(texts).toHaveLength(1);
    expect(texts[0]).toHaveTextContent('150.0 cm');
  });

  it('renders live preview line with cursor point', () => {
    render(
      <MeasurementOverlay
        measurements={[]}
        activeStartPoint={{ x: 0, y: 0 }}
        cursorPoint={{ x: 300, y: 400 }}
        status="placing-end"
        pixelRatio={null}
      />
    );
    // Preview line from start to cursor
    const lines = screen.getAllByTestId('konva-line');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toHaveAttribute('data-points', '0,0,300,400');
    // Start circle + cursor circle = 2
    const circles = screen.getAllByTestId('konva-circle');
    expect(circles).toHaveLength(2);
    // Live distance label (3-4-5 triangle → 500 px)
    const texts = screen.getAllByTestId('konva-text');
    expect(texts).toHaveLength(1);
    expect(texts[0]).toHaveTextContent('500.0 px');
  });

  it('renders live preview distance in cm when calibrated', () => {
    render(
      <MeasurementOverlay
        measurements={[]}
        activeStartPoint={{ x: 0, y: 0 }}
        cursorPoint={{ x: 100, y: 0 }}
        status="placing-end"
        pixelRatio={2.0}
      />
    );
    // 100 px * 2.0 cm/px = 200.0 cm
    const texts = screen.getAllByTestId('konva-text');
    expect(texts[0]).toHaveTextContent('200.0 cm');
  });

  it('renders preview alongside completed measurements', () => {
    render(
      <MeasurementOverlay
        measurements={[sampleMeasurements[0]]}
        activeStartPoint={{ x: 50, y: 50 }}
        cursorPoint={{ x: 150, y: 50 }}
        status="placing-end"
        pixelRatio={null}
      />
    );
    // 1 completed line + 1 preview line = 2 lines
    const lines = screen.getAllByTestId('konva-line');
    expect(lines).toHaveLength(2);
    // 1 completed * 2 endpoints + preview start + preview cursor = 4 circles
    const circles = screen.getAllByTestId('konva-circle');
    expect(circles).toHaveLength(4);
    // 1 completed label + 1 preview label = 2 texts
    const texts = screen.getAllByTestId('konva-text');
    expect(texts).toHaveLength(2);
  });

  it('highlights the selected measurement with thicker line and larger circles', () => {
    render(
      <MeasurementOverlay
        measurements={sampleMeasurements}
        activeStartPoint={null}
        cursorPoint={null}
        status="idle"
        pixelRatio={null}
        selectedId="m-1"
      />
    );
    const lines = screen.getAllByTestId('konva-line');
    // Selected line (m-1) has strokeWidth 3, unselected (m-2) has 2
    expect(lines[0]).toHaveAttribute('data-stroke-width', '3');
    expect(lines[1]).toHaveAttribute('data-stroke-width', '2');
    // Selected circles have radius 6, unselected have 4
    const circles = screen.getAllByTestId('konva-circle');
    // m-1 start, m-1 end (radius 6), m-2 start, m-2 end (radius 4)
    expect(circles[0]).toHaveAttribute('data-radius', '6');
    expect(circles[1]).toHaveAttribute('data-radius', '6');
    expect(circles[2]).toHaveAttribute('data-radius', '4');
    expect(circles[3]).toHaveAttribute('data-radius', '4');
  });
});
