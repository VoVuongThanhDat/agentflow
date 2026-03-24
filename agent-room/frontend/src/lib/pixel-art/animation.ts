/**
 * React hook for driving pixel-art sprite animation on a canvas element.
 */

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { CharacterData, AgentState } from './types';
import { clearCanvas, drawPixelGrid } from './renderer';

/** Character dimensions in pixels (before scale) */
const CHAR_WIDTH = 24;
const CHAR_HEIGHT = 32;

/**
 * Drives a pixel-art animation loop for a single canvas element.
 *
 * - Starts/restarts the RAF loop whenever `state` changes, resetting to frame 0
 * - Advances frames at the FPS defined in the animation config (not every RAF tick)
 * - Loops back to frame 0 when `loop=true`, holds last frame when `loop=false`
 * - Cancels the RAF loop on unmount to prevent memory leaks
 */
export function usePixelAnimation(
  canvasRef: RefObject<HTMLCanvasElement>,
  character: CharacterData,
  state: AgentState,
  scale: number,
): void {
  // Keep scale in a ref so the RAF callback always has the latest value
  // without needing to restart the loop when scale changes.
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animation = character.animations[state];
    const { frames, frameRate, loop } = animation;

    let frameIndex = 0;
    let lastFrameTime = Date.now();
    let rafId: number;

    function tick() {
      rafId = requestAnimationFrame(tick);

      const now = Date.now();
      const frameDuration = 1000 / frameRate;

      if (now - lastFrameTime < frameDuration) {
        return;
      }

      lastFrameTime = now;

      const currentScale = scaleRef.current;
      clearCanvas(ctx!, CHAR_WIDTH, CHAR_HEIGHT, currentScale);
      drawPixelGrid(ctx!, frames[frameIndex], character.palette, currentScale);

      if (frameIndex < frames.length - 1) {
        frameIndex++;
      } else if (loop) {
        frameIndex = 0;
      }
      // if loop=false and on last frame, hold: do not increment
    }

    // Draw the first frame immediately before starting the loop
    clearCanvas(ctx, CHAR_WIDTH, CHAR_HEIGHT, scale);
    drawPixelGrid(ctx, frames[0], character.palette, scale);

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef, character, state]);
}
