import { useEffect, useRef } from 'react';
import { mapScrollProgress } from '../utils/scrollProgress';

/**
 * Scroll wheel / touch drives 0→1 progress — no vertical page scroll.
 * App maps progress to overlapping hero dive + Section 2 crossfade.
 * @returns {React.MutableRefObject<{ target: number, current: number }>}
 */
export function useDiveScroll({ sensitivity = 0.0028, max = 1 } = {}) {
  const dive = useRef({
    target: 0,
    current: 0,
    mapped: mapScrollProgress(0),
  });
  const touchY = useRef(null);

  useEffect(() => {
    const clamp = (v) => Math.max(0, Math.min(max, v));

    const onWheel = (e) => {
      e.preventDefault();
      dive.current.target = clamp(dive.current.target + e.deltaY * sensitivity);
    };

    const onTouchStart = (e) => {
      if (e.touches.length === 1) touchY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      if (touchY.current === null || e.touches.length !== 1) return;
      e.preventDefault();
      const y = e.touches[0].clientY;
      const delta = touchY.current - y;
      touchY.current = y;
      dive.current.target = clamp(dive.current.target + delta * sensitivity * 2.5);
    };

    const onTouchEnd = () => {
      touchY.current = null;
    };

    const onKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        dive.current.target = clamp(dive.current.target + 0.028);
      }
      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        dive.current.target = clamp(dive.current.target - 0.028);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [sensitivity, max]);

  return dive;
}
