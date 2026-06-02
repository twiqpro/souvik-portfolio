import { useEffect, useRef } from 'react';
import { mapScrollProgress } from '../utils/scrollProgress';
import './ScrollScrubVideo.css';

const SCROLL_PHASE_KEYS = [
  'section2Phase',
  'section3Phase',
  'section4Phase',
  'section5Phase',
  'tunnelProgress',
  'forwardProgress',
];

/**
 * Full-bleed video background — currentTime follows scroll (Z-axis forward feel).
 */
function ScrollScrubVideo({
  diveRef = null,
  src,
  className = 'scroll-scrub-video',
  scrollPhaseKey = 'section5Phase',
  visibilityKey = 'section5',
  phaseCssVar = 'section5-phase',
  speedMultiplier = 1,
}) {
  const videoRef = useRef(null);
  const durationRef = useRef(0);
  const lastSeekRef = useRef(-1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const onLoaded = () => {
      durationRef.current = video.duration || 0;
    };

    video.addEventListener('loadedmetadata', onLoaded);
    if (video.readyState >= 1) onLoaded();

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frameId = 0;

    const tick = () => {
      frameId = requestAnimationFrame(tick);

      const duration = durationRef.current;
      if (!duration || video.readyState < 2) return;

      const progress = diveRef?.current?.current ?? 0;
      const mapped = diveRef?.current?.mapped ?? mapScrollProgress(progress);
      const visibility = mapped[visibilityKey] ?? 0;
      if (visibility < 0.02) return;

      const phase = SCROLL_PHASE_KEYS.includes(scrollPhaseKey)
        ? mapped[scrollPhaseKey]
        : mapped.section5Phase;
      const target = phase * duration * speedMultiplier;

      if (reducedMotion) {
        if (video.currentTime > 0.05) video.currentTime = 0;
        return;
      }

      if (Math.abs(lastSeekRef.current - target) < 0.03) return;
      lastSeekRef.current = target;
      video.currentTime = Math.min(target, duration - 0.05);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      video.removeEventListener('loadedmetadata', onLoaded);
    };
  }, [diveRef, scrollPhaseKey, visibilityKey, speedMultiplier]);

  return (
    <div className={`${className} ${className}--layer`} aria-hidden="true">
      <div
        className={`${className}__zoom`}
        style={{ transform: `scale(calc(1 + var(--${phaseCssVar}, 0) * 0.12))` }}
      >
        <video
          ref={videoRef}
          className={`${className}__el`}
          src={src}
          muted
          playsInline
          preload="auto"
        />
      </div>
    </div>
  );
}

export { ScrollScrubVideo };
