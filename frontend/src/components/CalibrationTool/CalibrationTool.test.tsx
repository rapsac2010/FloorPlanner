import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CalibrationTool, CalibrationOverlay } from './CalibrationTool';

// Mock react-konva since Konva requires a real canvas
vi.mock('react-konva', () => ({
  Layer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="konva-layer">{children}</div>
  ),
  Line: ({ points, stroke }: { points: number[]; stroke: string }) => (
    <div data-testid="konva-line" data-points={points.join(',')} data-stroke={stroke} />
  ),
  Circle: ({ x, y }: { x: number; y: number }) => (
    <div data-testid="konva-circle" data-x={x} data-y={y} />
  ),
}));

const defaultProps = {
  status: 'idle' as const,
  pixelRatio: null,
  onStartCalibration: vi.fn(),
  onSetRealWorldLength: vi.fn(),
  onReset: vi.fn(),
};

describe('CalibrationTool', () => {
  it('renders the calibrate button in idle state', () => {
    render(<CalibrationTool {...defaultProps} />);
    expect(screen.getByTestId('calibration-start-btn')).toBeInTheDocument();
    expect(screen.getByTestId('calibration-start-btn')).toHaveTextContent('Calibrate');
  });

  it('calls onStartCalibration when calibrate button is clicked', async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<CalibrationTool {...defaultProps} onStartCalibration={onStart} />);
    await user.click(screen.getByTestId('calibration-start-btn'));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('shows start point instruction when placing-start', () => {
    render(<CalibrationTool {...defaultProps} status="placing-start" />);
    expect(screen.getByTestId('calibration-instruction')).toHaveTextContent(
      /click the start point/i
    );
    expect(screen.queryByTestId('calibration-start-btn')).not.toBeInTheDocument();
  });

  it('shows end point instruction when placing-end', () => {
    render(<CalibrationTool {...defaultProps} status="placing-end" />);
    expect(screen.getByTestId('calibration-instruction')).toHaveTextContent(
      /click the end point/i
    );
  });

  it('shows the length input form when awaiting-input', () => {
    render(<CalibrationTool {...defaultProps} status="awaiting-input" />);
    expect(screen.getByTestId('calibration-form')).toBeInTheDocument();
    expect(screen.getByTestId('calibration-length-input')).toBeInTheDocument();
    expect(screen.getByTestId('calibration-submit-btn')).toBeInTheDocument();
  });

  it('submits the real-world length when form is submitted', async () => {
    const user = userEvent.setup();
    const onSetLength = vi.fn();
    render(
      <CalibrationTool
        {...defaultProps}
        status="awaiting-input"
        onSetRealWorldLength={onSetLength}
      />
    );
    await user.type(screen.getByTestId('calibration-length-input'), '150');
    await user.click(screen.getByTestId('calibration-submit-btn'));
    expect(onSetLength).toHaveBeenCalledWith(150);
  });

  it('does not submit invalid input (zero)', async () => {
    const user = userEvent.setup();
    const onSetLength = vi.fn();
    render(
      <CalibrationTool
        {...defaultProps}
        status="awaiting-input"
        onSetRealWorldLength={onSetLength}
      />
    );
    await user.type(screen.getByTestId('calibration-length-input'), '0');
    await user.click(screen.getByTestId('calibration-submit-btn'));
    expect(onSetLength).not.toHaveBeenCalled();
  });

  it('does not submit empty input', async () => {
    const user = userEvent.setup();
    const onSetLength = vi.fn();
    render(
      <CalibrationTool
        {...defaultProps}
        status="awaiting-input"
        onSetRealWorldLength={onSetLength}
      />
    );
    await user.click(screen.getByTestId('calibration-submit-btn'));
    expect(onSetLength).not.toHaveBeenCalled();
  });

  it('shows calibration result when calibrated', () => {
    render(
      <CalibrationTool
        {...defaultProps}
        status="calibrated"
        pixelRatio={0.5}
      />
    );
    expect(screen.getByTestId('calibration-result')).toBeInTheDocument();
    expect(screen.getByTestId('calibration-result')).toHaveTextContent('0.5000 cm/px');
    expect(screen.getByTestId('calibration-recalibrate-btn')).toBeInTheDocument();
  });

  it('calls onReset when recalibrate button is clicked', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    render(
      <CalibrationTool
        {...defaultProps}
        status="calibrated"
        pixelRatio={0.5}
        onReset={onReset}
      />
    );
    await user.click(screen.getByTestId('calibration-recalibrate-btn'));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  // Status badge tests
  it('shows "Not calibrated" status in idle state', () => {
    render(<CalibrationTool {...defaultProps} />);
    expect(screen.getByTestId('calibration-status')).toHaveTextContent('Not calibrated');
  });

  it('shows "Calibrating..." status when placing points', () => {
    render(<CalibrationTool {...defaultProps} status="placing-start" />);
    expect(screen.getByTestId('calibration-status')).toHaveTextContent('Calibrating...');
  });

  it('shows "Calibrated" status when calibrated', () => {
    render(<CalibrationTool {...defaultProps} status="calibrated" pixelRatio={0.5} />);
    expect(screen.getByTestId('calibration-status')).toHaveTextContent('Calibrated');
  });

  // Cancel button tests
  it('shows cancel button when placing-start', () => {
    render(<CalibrationTool {...defaultProps} status="placing-start" />);
    expect(screen.getByTestId('calibration-cancel-btn')).toBeInTheDocument();
  });

  it('shows cancel button when placing-end', () => {
    render(<CalibrationTool {...defaultProps} status="placing-end" />);
    expect(screen.getByTestId('calibration-cancel-btn')).toBeInTheDocument();
  });

  it('shows cancel button when awaiting-input', () => {
    render(<CalibrationTool {...defaultProps} status="awaiting-input" />);
    expect(screen.getByTestId('calibration-cancel-btn')).toBeInTheDocument();
  });

  it('calls onReset when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    render(<CalibrationTool {...defaultProps} status="placing-start" onReset={onReset} />);
    await user.click(screen.getByTestId('calibration-cancel-btn'));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});

describe('CalibrationOverlay', () => {
  it('does not render when no start point', () => {
    render(<CalibrationOverlay status="idle" startPoint={null} endPoint={null} />);
    expect(screen.queryByTestId('konva-circle')).not.toBeInTheDocument();
    expect(screen.queryByTestId('konva-line')).not.toBeInTheDocument();
  });

  it('renders start point circle when placing-end', () => {
    render(
      <CalibrationOverlay
        status="placing-end"
        startPoint={{ x: 100, y: 200 }}
        endPoint={null}
      />
    );
    const circles = screen.getAllByTestId('konva-circle');
    expect(circles).toHaveLength(1);
    expect(circles[0]).toHaveAttribute('data-x', '100');
    expect(circles[0]).toHaveAttribute('data-y', '200');
  });

  it('renders both circles and line when awaiting-input', () => {
    render(
      <CalibrationOverlay
        status="awaiting-input"
        startPoint={{ x: 10, y: 20 }}
        endPoint={{ x: 310, y: 420 }}
      />
    );
    const circles = screen.getAllByTestId('konva-circle');
    expect(circles).toHaveLength(2);
    expect(screen.getByTestId('konva-line')).toHaveAttribute('data-points', '10,20,310,420');
  });

  it('renders reference line when calibrated', () => {
    render(
      <CalibrationOverlay
        status="calibrated"
        startPoint={{ x: 0, y: 0 }}
        endPoint={{ x: 300, y: 0 }}
      />
    );
    expect(screen.getByTestId('konva-line')).toBeInTheDocument();
    expect(screen.getAllByTestId('konva-circle')).toHaveLength(2);
  });
});
