import type { Point } from '../types';

/**
 * Calculate the Euclidean distance between two points in pixels.
 */
export function calculateDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the centimeters-per-pixel ratio from a known reference measurement.
 * @param pixelDistance - The measured distance in pixels.
 * @param realWorldCm - The known real-world distance in centimeters.
 * @returns The ratio of centimeters per pixel.
 */
export function calculatePixelRatio(pixelDistance: number, realWorldCm: number): number {
  if (pixelDistance === 0) {
    return 0;
  }
  return realWorldCm / pixelDistance;
}

/**
 * Convert a pixel measurement to centimeters using the calibration ratio.
 * @param pixels - The distance in pixels.
 * @param ratio - The centimeters-per-pixel ratio.
 */
export function pixelsToCm(pixels: number, ratio: number): number {
  return pixels * ratio;
}

/**
 * Convert a centimeter measurement to pixels using the calibration ratio.
 * @param cm - The distance in centimeters.
 * @param ratio - The centimeters-per-pixel ratio.
 */
export function cmToPixels(cm: number, ratio: number): number {
  if (ratio === 0) {
    return 0;
  }
  return cm / ratio;
}

/**
 * Snap an endpoint to the nearest axis-aligned direction relative to a start point.
 * If the line is more horizontal, snaps to a perfectly horizontal line (same y).
 * If the line is more vertical, snaps to a perfectly vertical line (same x).
 * @param start - The fixed start point.
 * @param end - The raw end point to snap.
 * @returns A new point snapped to the nearest axis.
 */
export function snapToAxis(start: Point, end: Point): Point {
  const dx = Math.abs(end.x - start.x);
  const dy = Math.abs(end.y - start.y);
  if (dx >= dy) {
    // More horizontal → lock y
    return { x: end.x, y: start.y };
  }
  // More vertical → lock x
  return { x: start.x, y: end.y };
}
