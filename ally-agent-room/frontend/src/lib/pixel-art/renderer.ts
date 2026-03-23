/**
 * Canvas-based pixel art rendering utilities.
 * Renders PixelGrid + ColorPalette to a canvas element at a given scale,
 * with retina (HiDPI) support.
 */

import type { ColorPalette, PixelGrid } from './types';

/**
 * Creates a canvas element sized for pixel-art rendering at the given scale.
 *
 * - CSS size: width*scale x height*scale px
 * - Buffer size: CSS size * devicePixelRatio (for HiDPI/retina displays)
 * - imageSmoothingEnabled is set to false
 * - image-rendering: pixelated is applied via inline style
 * - The 2D context is pre-scaled by devicePixelRatio so callers draw
 *   in CSS pixel space
 *
 * Example: createPixelCanvas(24, 32, 2) on a 2x retina display
 *   → buffer 96×128, CSS 48×64 px
 */
export function createPixelCanvas(
  width: number,
  height: number,
  scale: number,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const dpr = window.devicePixelRatio ?? 1;

  const cssWidth = width * scale;
  const cssHeight = height * scale;

  // Physical buffer size accounts for device pixel ratio
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;

  // Keep CSS display size fixed regardless of DPR
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;

  // Prevent browser from blurring pixel art
  canvas.style.imageRendering = 'pixelated';

  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = false;
    // Scale context so all subsequent draw calls use CSS pixel coordinates
    ctx.scale(dpr, dpr);
  }

  return canvas;
}

/**
 * Draws a PixelGrid onto the given 2D context using the supplied ColorPalette.
 *
 * - Iterates row-by-row (outer loop = row/y, inner loop = col/x)
 * - null indices and out-of-bounds palette indices are silently skipped (transparent)
 * - Caller is responsible for clearing the canvas before each frame if needed
 */
export function drawPixelGrid(
  ctx: CanvasRenderingContext2D,
  pixelData: PixelGrid,
  palette: ColorPalette,
  scale: number,
): void {
  for (let row = 0; row < pixelData.length; row++) {
    const rowData = pixelData[row];
    for (let col = 0; col < rowData.length; col++) {
      const index = rowData[col];
      if (index === null || index < 0 || index >= palette.length) {
        continue;
      }
      ctx.fillStyle = palette[index];
      ctx.fillRect(col * scale, row * scale, scale, scale);
    }
  }
}

/**
 * Clears the canvas area corresponding to the pixel grid dimensions.
 *
 * Call this before drawPixelGrid to erase the previous frame.
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scale: number,
): void {
  ctx.clearRect(0, 0, width * scale, height * scale);
}
