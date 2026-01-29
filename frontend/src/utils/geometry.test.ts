import { describe, it, expect } from 'vitest';
import { calculateDistance, calculatePixelRatio, pixelsToCm, cmToPixels } from './geometry';

describe('calculateDistance', () => {
  it('returns 0 for the same point', () => {
    expect(calculateDistance({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0);
  });

  it('calculates horizontal distance', () => {
    expect(calculateDistance({ x: 0, y: 0 }, { x: 10, y: 0 })).toBe(10);
  });

  it('calculates vertical distance', () => {
    expect(calculateDistance({ x: 0, y: 0 }, { x: 0, y: 7 })).toBe(7);
  });

  it('calculates 3-4-5 triangle distance', () => {
    expect(calculateDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it('handles negative coordinates', () => {
    expect(calculateDistance({ x: -3, y: -4 }, { x: 0, y: 0 })).toBe(5);
  });

  it('is symmetric (order of points does not matter)', () => {
    const p1 = { x: 1, y: 2 };
    const p2 = { x: 4, y: 6 };
    expect(calculateDistance(p1, p2)).toBe(calculateDistance(p2, p1));
  });

  it('handles large coordinates', () => {
    const dist = calculateDistance({ x: 0, y: 0 }, { x: 10000, y: 10000 });
    expect(dist).toBeCloseTo(14142.1356, 2);
  });
});

describe('calculatePixelRatio', () => {
  it('calculates cm per pixel correctly', () => {
    // 100 pixels represents 50 cm → 0.5 cm/pixel
    expect(calculatePixelRatio(100, 50)).toBe(0.5);
  });

  it('returns 0 when pixel distance is 0', () => {
    expect(calculatePixelRatio(0, 50)).toBe(0);
  });

  it('handles 1:1 ratio', () => {
    expect(calculatePixelRatio(100, 100)).toBe(1);
  });

  it('handles ratio greater than 1', () => {
    // 10 pixels represents 50 cm → 5 cm/pixel
    expect(calculatePixelRatio(10, 50)).toBe(5);
  });
});

describe('pixelsToCm', () => {
  it('converts pixels to cm using ratio', () => {
    // 200 pixels at 0.5 cm/pixel = 100 cm
    expect(pixelsToCm(200, 0.5)).toBe(100);
  });

  it('returns 0 for 0 pixels', () => {
    expect(pixelsToCm(0, 0.5)).toBe(0);
  });

  it('returns 0 when ratio is 0', () => {
    expect(pixelsToCm(100, 0)).toBe(0);
  });
});

describe('cmToPixels', () => {
  it('converts cm to pixels using ratio', () => {
    // 100 cm at 0.5 cm/pixel = 200 pixels
    expect(cmToPixels(100, 0.5)).toBe(200);
  });

  it('returns 0 for 0 cm', () => {
    expect(cmToPixels(0, 0.5)).toBe(0);
  });

  it('returns 0 when ratio is 0', () => {
    expect(cmToPixels(100, 0)).toBe(0);
  });
});

describe('round-trip conversions', () => {
  it('pixels → cm → pixels returns the original value', () => {
    const ratio = 0.25;
    const originalPixels = 400;
    const cm = pixelsToCm(originalPixels, ratio);
    const backToPixels = cmToPixels(cm, ratio);
    expect(backToPixels).toBeCloseTo(originalPixels);
  });

  it('cm → pixels → cm returns the original value', () => {
    const ratio = 2.5;
    const originalCm = 75;
    const pixels = cmToPixels(originalCm, ratio);
    const backToCm = pixelsToCm(pixels, ratio);
    expect(backToCm).toBeCloseTo(originalCm);
  });
});
