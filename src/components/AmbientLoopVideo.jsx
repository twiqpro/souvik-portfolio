import { useEffect, useRef } from 'react';
import './AmbientLoopVideo.css';

/**
 * Full-bleed looping background video (autoplay, not scroll-scrubbed).
 */
function AmbientLoopVideo({ src, active = true, className = 'ambient-loop-video' }) {
  const videoRef = useRef(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const play = () => {
      if (activeRef.current) video.play().catch(() => {});
    };

    play();
    video.addEventListener('canplay', play);

    const onVisibility = () => {
      if (document.hidden || !activeRef.current) video.pause();
      else play();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      video.removeEventListener('canplay', play);
      document.removeEventListener('visibilitychange', onVisibility);
      video.pause();
    };
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) video.play().catch(() => {});
    else video.pause();
  }, [active]);

  return (
    <video
      ref={videoRef}
      className={`${className}__el`}
      src={src}
      loop
      muted
      playsInline
      autoPlay
      preload="auto"
    />
  );
}

export { AmbientLoopVideo };
