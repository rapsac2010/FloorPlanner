import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FurnitureEditor, FurnitureEditorPanel } from './FurnitureEditor';
import type { FurnitureShape } from '../../types';

// Mock react-konva since Konva requires a real canvas
vi.mock('react-konva', () => ({
  Stage: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="konva-stage">{children}</div>
  ),
  Layer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="konva-layer">{children}</div>
  ),
  Line: ({ points, stroke, strokeWidth }: { points: number[]; stroke: string; strokeWidth: number }) => (
    <div data-testid="konva-line" data-points={points.join(',')} data-stroke={stroke} data-stroke-width={strokeWidth} />
  ),
  Circle: ({ x, y, radius }: { x: number; y: number; radius: number }) => (
    <div data-testid="konva-circle" data-x={x} data-y={y} data-radius={radius} />
  ),
  Rect: ({ x, y, width, height, stroke }: { x: number; y: number; width: number; height: number; stroke?: string }) => (
    <div data-testid="konva-rect" data-x={x} data-y={y} data-width={width} data-height={height} data-stroke={stroke} />
  ),
  Text: ({ text }: { text: string }) => (
    <div data-testid="konva-text">{text}</div>
  ),
}));

const sampleShapes: FurnitureShape[] = [
  {
    type: 'line',
    id: 'f-1',
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 100, y: 0 },
    lengthCm: 50,
  },
  {
    type: 'rectangle',
    id: 'f-2',
    x: 10,
    y: 20,
    widthCm: 80,
    heightCm: 60,
  },
];

const defaultEditorProps = {
  shapes: [] as FurnitureShape[],
  selectedShapeId: null,
  activeTool: null as FurnitureShape['type'] | null,
  drawingStatus: 'idle' as const,
  activeStartPoint: null,
  activeEndPoint: null,
  cursorPoint: null,
  onRemoveShape: vi.fn(),
  onClearShapes: vi.fn(),
  onSelectShape: vi.fn(),
  onSetActiveTool: vi.fn(),
  onCanvasClick: vi.fn(),
  onMouseMove: vi.fn(),
  onConfirmLine: vi.fn(),
  onCancelDrawing: vi.fn(),
  isOpen: false,
  onToggleOpen: vi.fn(),
};

const defaultPanelProps = {
  shapes: [] as FurnitureShape[],
  selectedShapeId: null,
  activeTool: null as FurnitureShape['type'] | null,
  drawingStatus: 'idle' as const,
  activeStartPoint: null,
  activeEndPoint: null,
  cursorPoint: null,
  onRemoveShape: vi.fn(),
  onClearShapes: vi.fn(),
  onSelectShape: vi.fn(),
  onSetActiveTool: vi.fn(),
  onCanvasClick: vi.fn(),
  onMouseMove: vi.fn(),
  onConfirmLine: vi.fn(),
  onCancelDrawing: vi.fn(),
  onClose: vi.fn(),
  onTogglePopout: vi.fn(),
  isPoppedOut: false,
};

describe('FurnitureEditor', () => {
  it('renders open button when closed', () => {
    render(<FurnitureEditor {...defaultEditorProps} />);
    expect(screen.getByTestId('furniture-open-btn')).toBeInTheDocument();
    expect(screen.getByTestId('furniture-open-btn')).toHaveTextContent('Open Furniture Editor');
  });

  it('calls onToggleOpen when open button is clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<FurnitureEditor {...defaultEditorProps} onToggleOpen={onToggle} />);
    await user.click(screen.getByTestId('furniture-open-btn'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('does not render panel when closed', () => {
    render(<FurnitureEditor {...defaultEditorProps} />);
    expect(screen.queryByTestId('furniture-editor-panel')).not.toBeInTheDocument();
  });

  it('renders editor overlay when open', () => {
    render(<FurnitureEditor {...defaultEditorProps} isOpen={true} />);
    expect(screen.getByTestId('furniture-editor-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('furniture-editor-panel')).toBeInTheDocument();
  });

  it('renders canvas when open', () => {
    render(<FurnitureEditor {...defaultEditorProps} isOpen={true} />);
    expect(screen.getByTestId('furniture-canvas')).toBeInTheDocument();
  });

  it('closes when close button is clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<FurnitureEditor {...defaultEditorProps} isOpen={true} onToggleOpen={onToggle} />);
    await user.click(screen.getByTestId('furniture-close-btn'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('closes when clicking the overlay backdrop', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<FurnitureEditor {...defaultEditorProps} isOpen={true} onToggleOpen={onToggle} />);
    await user.click(screen.getByTestId('furniture-editor-overlay'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});

describe('FurnitureEditorPanel', () => {
  it('renders the panel with header', () => {
    render(<FurnitureEditorPanel {...defaultPanelProps} />);
    expect(screen.getByTestId('furniture-editor-panel')).toBeInTheDocument();
    expect(screen.getByText('Furniture Editor')).toBeInTheDocument();
  });

  it('renders pop-out button', () => {
    render(<FurnitureEditorPanel {...defaultPanelProps} />);
    expect(screen.getByTestId('furniture-popout-btn')).toHaveTextContent('Pop Out');
  });

  it('shows "Pop In" when already popped out', () => {
    render(<FurnitureEditorPanel {...defaultPanelProps} isPoppedOut={true} />);
    expect(screen.getByTestId('furniture-popout-btn')).toHaveTextContent('Pop In');
  });

  it('calls onTogglePopout when pop-out button is clicked', async () => {
    const user = userEvent.setup();
    const onPopout = vi.fn();
    render(<FurnitureEditorPanel {...defaultPanelProps} onTogglePopout={onPopout} />);
    await user.click(screen.getByTestId('furniture-popout-btn'));
    expect(onPopout).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<FurnitureEditorPanel {...defaultPanelProps} onClose={onClose} />);
    await user.click(screen.getByTestId('furniture-close-btn'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders the Konva canvas', () => {
    render(<FurnitureEditorPanel {...defaultPanelProps} />);
    expect(screen.getByTestId('furniture-canvas')).toBeInTheDocument();
  });

  it('renders drawing tool buttons', () => {
    render(<FurnitureEditorPanel {...defaultPanelProps} />);
    expect(screen.getByTestId('furniture-tool-line')).toHaveTextContent('Line');
    expect(screen.getByTestId('furniture-tool-rectangle')).toHaveTextContent('Rectangle');
    expect(screen.getByTestId('furniture-tool-circle')).toHaveTextContent('Circle');
  });

  it('highlights the active tool button', () => {
    render(<FurnitureEditorPanel {...defaultPanelProps} activeTool="line" />);
    const lineBtn = screen.getByTestId('furniture-tool-line');
    expect(lineBtn.className).toContain('bg-fp-teal');
    const rectBtn = screen.getByTestId('furniture-tool-rectangle');
    expect(rectBtn.className).not.toContain('bg-fp-teal text-white');
  });

  it('calls onSetActiveTool when a tool button is clicked', async () => {
    const user = userEvent.setup();
    const onSetTool = vi.fn();
    render(<FurnitureEditorPanel {...defaultPanelProps} onSetActiveTool={onSetTool} />);
    await user.click(screen.getByTestId('furniture-tool-rectangle'));
    expect(onSetTool).toHaveBeenCalledWith('rectangle');
  });

  it('deactivates tool when clicking the active tool again', async () => {
    const user = userEvent.setup();
    const onSetTool = vi.fn();
    render(<FurnitureEditorPanel {...defaultPanelProps} activeTool="line" onSetActiveTool={onSetTool} />);
    await user.click(screen.getByTestId('furniture-tool-line'));
    expect(onSetTool).toHaveBeenCalledWith(null);
  });

  it('shows "No shapes" message when empty', () => {
    render(<FurnitureEditorPanel {...defaultPanelProps} />);
    expect(screen.getByTestId('furniture-no-shapes')).toBeInTheDocument();
  });

  it('does not show clear-all button when no shapes', () => {
    render(<FurnitureEditorPanel {...defaultPanelProps} />);
    expect(screen.queryByTestId('furniture-clear-all-btn')).not.toBeInTheDocument();
  });

  it('shows shape list with items', () => {
    render(<FurnitureEditorPanel {...defaultPanelProps} shapes={sampleShapes} />);
    expect(screen.getByTestId('furniture-shape-list')).toBeInTheDocument();
    expect(screen.getByTestId('furniture-shape-f-1')).toBeInTheDocument();
    expect(screen.getByTestId('furniture-shape-f-2')).toBeInTheDocument();
    expect(screen.queryByTestId('furniture-no-shapes')).not.toBeInTheDocument();
  });

  it('formats line shape label', () => {
    render(<FurnitureEditorPanel {...defaultPanelProps} shapes={sampleShapes} />);
    expect(screen.getByTestId('furniture-shape-f-1')).toHaveTextContent('#1: Line 50.0 cm');
  });

  it('formats rectangle shape label', () => {
    render(<FurnitureEditorPanel {...defaultPanelProps} shapes={sampleShapes} />);
    expect(screen.getByTestId('furniture-shape-f-2')).toHaveTextContent('#2: Rect 80.0×60.0 cm');
  });

  it('formats circle shape label', () => {
    const circle: FurnitureShape = { type: 'circle', id: 'f-3', center: { x: 50, y: 50 }, radiusCm: 25 };
    render(<FurnitureEditorPanel {...defaultPanelProps} shapes={[circle]} />);
    expect(screen.getByTestId('furniture-shape-f-3')).toHaveTextContent('#1: Circle r=25.0 cm');
  });

  it('calls onSelectShape when clicking a shape item', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<FurnitureEditorPanel {...defaultPanelProps} shapes={sampleShapes} onSelectShape={onSelect} />);
    await user.click(screen.getByTestId('furniture-shape-f-1'));
    expect(onSelect).toHaveBeenCalledWith('f-1');
  });

  it('deselects when clicking the already selected shape', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<FurnitureEditorPanel {...defaultPanelProps} shapes={sampleShapes} selectedShapeId="f-1" onSelectShape={onSelect} />);
    await user.click(screen.getByTestId('furniture-shape-f-1'));
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('calls onRemoveShape when clicking delete on a shape', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const onSelect = vi.fn();
    render(
      <FurnitureEditorPanel
        {...defaultPanelProps}
        shapes={sampleShapes}
        onRemoveShape={onRemove}
        onSelectShape={onSelect}
      />
    );
    await user.click(screen.getByTestId('furniture-delete-f-1'));
    expect(onRemove).toHaveBeenCalledWith('f-1');
    // Delete click should not trigger selection
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('calls onClearShapes when clear-all is clicked', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<FurnitureEditorPanel {...defaultPanelProps} shapes={sampleShapes} onClearShapes={onClear} />);
    await user.click(screen.getByTestId('furniture-clear-all-btn'));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('shows clear-all button when shapes exist', () => {
    render(<FurnitureEditorPanel {...defaultPanelProps} shapes={sampleShapes} />);
    expect(screen.getByTestId('furniture-clear-all-btn')).toBeInTheDocument();
  });

  // --- Line drawing workflow tests ---

  it('shows start point instruction when line tool active and placing-start', () => {
    render(<FurnitureEditorPanel {...defaultPanelProps} activeTool="line" drawingStatus="placing-start" />);
    expect(screen.getByTestId('furniture-instruction')).toHaveTextContent(/click the start point/i);
  });

  it('shows end point instruction when line tool active and placing-end', () => {
    render(
      <FurnitureEditorPanel
        {...defaultPanelProps}
        activeTool="line"
        drawingStatus="placing-end"
        activeStartPoint={{ x: 50, y: 50 }}
      />
    );
    expect(screen.getByTestId('furniture-instruction')).toHaveTextContent(/click the end point/i);
  });

  it('shows cancel button during drawing', () => {
    render(<FurnitureEditorPanel {...defaultPanelProps} activeTool="line" drawingStatus="placing-start" />);
    expect(screen.getByTestId('furniture-cancel-drawing-btn')).toBeInTheDocument();
  });

  it('calls onCancelDrawing when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<FurnitureEditorPanel {...defaultPanelProps} activeTool="line" drawingStatus="placing-start" onCancelDrawing={onCancel} />);
    await user.click(screen.getByTestId('furniture-cancel-drawing-btn'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows length input form when awaiting-input', () => {
    render(
      <FurnitureEditorPanel
        {...defaultPanelProps}
        activeTool="line"
        drawingStatus="awaiting-input"
        activeStartPoint={{ x: 0, y: 0 }}
        activeEndPoint={{ x: 200, y: 0 }}
      />
    );
    expect(screen.getByTestId('furniture-length-form')).toBeInTheDocument();
    expect(screen.getByTestId('furniture-length-input')).toBeInTheDocument();
    expect(screen.getByTestId('furniture-confirm-line-btn')).toBeInTheDocument();
  });

  it('calls onConfirmLine with the entered length', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <FurnitureEditorPanel
        {...defaultPanelProps}
        activeTool="line"
        drawingStatus="awaiting-input"
        activeStartPoint={{ x: 0, y: 0 }}
        activeEndPoint={{ x: 200, y: 0 }}
        onConfirmLine={onConfirm}
      />
    );
    await user.type(screen.getByTestId('furniture-length-input'), '120.5');
    await user.click(screen.getByTestId('furniture-confirm-line-btn'));
    expect(onConfirm).toHaveBeenCalledWith(120.5);
  });

  it('does not call onConfirmLine with invalid input', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <FurnitureEditorPanel
        {...defaultPanelProps}
        activeTool="line"
        drawingStatus="awaiting-input"
        activeStartPoint={{ x: 0, y: 0 }}
        activeEndPoint={{ x: 200, y: 0 }}
        onConfirmLine={onConfirm}
      />
    );
    // Submit empty input
    await user.click(screen.getByTestId('furniture-confirm-line-btn'));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('does not show drawing instructions when no tool is active', () => {
    render(<FurnitureEditorPanel {...defaultPanelProps} />);
    expect(screen.queryByTestId('furniture-instruction')).not.toBeInTheDocument();
    expect(screen.queryByTestId('furniture-length-form')).not.toBeInTheDocument();
  });
});
