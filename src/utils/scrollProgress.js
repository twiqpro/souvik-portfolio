const clamp01 = (v) => Math.max(0, Math.min(1, v));

/** Raw wheel progress runs 0 → SCROLL_RANGE before the experience is fully complete. */
export const SCROLL_RANGE = 4.5;

/** Normalized scroll (0→1) at which hero dive / --dive reaches full strength. */
export const HERO_DIVE_END_P = 0.48;

/**
 * Map unified scroll progress to layered crossfade channels.
 * Hero → Section 2 → Section 3 → Section 4 (starfield).
 */
export function mapScrollProgress(progress) {
  const p = clamp01(progress / SCROLL_RANGE);

  const dive = clamp01(p / HERO_DIVE_END_P);

  const section2In = clamp01((p - 0.26) / 0.14);
  const section2Out = 1 - clamp01((p - 0.48) / 0.16);
  const section2 = Math.min(section2In, section2Out);

  const section3In = clamp01((p - 0.44) / 0.14);
  const section3Out = 1 - clamp01((p - 0.68) / 0.16);
  const section3 = Math.min(section3In, section3Out);

  const section4 = clamp01((p - 0.58) / 0.28);

  /**
   * Tunnel scrub — runs through all of S2 + S3 including fade-out to S4.
   * (Previously capped at p≈0.62 while S3 faded until ~0.76 → looked frozen.)
   */
  const tunnelProgress = clamp01((p - 0.26) / 0.5);

  const section2Phase = clamp01((p - 0.26) / 0.22);
  const section2Content = clamp01((section2Phase - 0.02) / 0.014);

  /** Local 0→1 while Section 3 is on screen — keeps scrubbing during S3→S4 crossfade. */
  const section3Phase = clamp01((p - 0.44) / 0.32);
  const section3Content = clamp01((section3Phase - 0.02) / 0.014);

  const section4Phase = clamp01((p - 0.58) / 0.34);
  const section4Content = clamp01((section4Phase - 0.02) / 0.014);

  return {
    dive,
    section2,
    section2Content,
    section2Phase,
    section3,
    section3Content,
    section3Phase,
    section4,
    section4Content,
    section4Phase,
    tunnelProgress,
  };
}
