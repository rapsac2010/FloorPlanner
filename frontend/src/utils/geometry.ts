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
