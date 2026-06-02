import { useEffect, useRef } from 'react';
import { mapScrollProgress } from '../utils/scrollProgress';

const SECTION2_VIDEO_SRC = '/section-2/This_is_a_space_cloud_vide_wit.mp4';

/**
 * Full-screen Section 2 background — currentTime follows scroll (--section2).
 */
function Section2ScrollVideo({ diveRef }) {
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
      const { section2 } = mapScrollProgress(progress);
      const target = section2 * duration;

      if (reducedMotion) {
        if (video.currentTime > 0.05) video.currentTime = 0;
        return;
      }

      if (Math.abs(lastSeekRef.current - target) < 0.035) return;
      lastSeekRef.current = target;
      video.currentTime = target;
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      video.removeEventListener('loadedmetadata', onLoaded);
    };
  }, [diveRef]);

  return (
    <div className="section-2__bg section-2__bg--video" aria-hidden="true">
      <video
        ref={videoRef}
        className="section-2__video"
        src={SECTION2_VIDEO_SRC}
        muted
        playsInline
        preload="auto"
      />
    </div>
  );
}

export { Section2ScrollVideo, SECTION2_VIDEO_SRC };
