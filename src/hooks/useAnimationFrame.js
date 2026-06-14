import { useEffect, useRef } from 'react';

export const MAX_FRAME_DELTA = 0.05;

const frameCallbacks = [];
let rafId = null;
let lastTime = performance.now();

function runFrame(now) {
  rafId = requestAnimationFrame(runFrame);
  const dt = Math.min((now - lastTime) / 1000, MAX_FRAME_DELTA);
  lastTime = now;

  for (let i = 0; i < frameCallbacks.length; i += 1) {
    frameCallbacks[i](dt);
  }
}

function ensureLoop() {
  if (rafId === null) {
    lastTime = performance.now();
    rafId = requestAnimationFrame(runFrame);
  }
}

function stopLoopIfIdle() {
  if (frameCallbacks.length === 0 && rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function addFrameCallback(callback, { priority = false } = {}) {
  if (priority) {
    frameCallbacks.unshift(callback);
  } else {
    frameCallbacks.push(callback);
  }
  ensureLoop();
  return () => {
    const index = frameCallbacks.indexOf(callback);
    if (index !== -1) frameCallbacks.splice(index, 1);
    stopLoopIfIdle();
  };
}

/**
 * Shared animation loop — one rAF, deterministic update order.
 */
export function useAnimationFrame(callback, priority = false) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const fn = (dt) => callbackRef.current(dt);
    return addFrameCallback(fn, { priority });
  }, [priority]);
}
