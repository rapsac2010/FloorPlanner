/**
 * A 2D point with x and y coordinates (in pixels).
 */
export interface Point {
  x: number;
  y: number;
}

/** Available shape types in the Furniture Editor */
export type FurnitureShapeType = 'line' | 'rectangle' | 'circle';

/** A line shape defined by two endpoints */
export interface FurnitureShapeLine {
  type: 'line';
  id: string;
  startPoint: Point;
  endPoint: Point;
  /** Length in centimeters */
  lengthCm: number;
}

/** A rectangle shape */
export interface FurnitureShapeRectangle {
  type: 'rectangle';
  id: string;
  /** Top-left corner in pixels on the editor canvas */
  x: number;
  y: number;
  /** Width in centimeters */
  widthCm: number;
  /** Height in centimeters */
  heightCm: number;
}

/** A circle shape */
export interface FurnitureShapeCircle {
  type: 'circle';
  id: string;
  /** Center point in pixels on the editor canvas */
  center: Point;
  /** Radius in centimeters */
  radiusCm: number;
}

/** Union of all furniture shape types */
export type FurnitureShape = FurnitureShapeLine | FurnitureShapeRectangle | FurnitureShapeCircle;
