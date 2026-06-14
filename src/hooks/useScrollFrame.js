import { useAnimationFrame } from './useAnimationFrame';

/**
 * Scroll smoothing runs before scene renders on the shared animation loop.
 */
export function useScrollFrame(callback) {
  useAnimationFrame(callback, true);
}
