const clamp01 = (v) => Math.max(0, Math.min(1, v));

/** Raw wheel progress runs 0 → SCROLL_RANGE before the experience is fully complete. */
export const SCROLL_RANGE = 7.5;

/** Normalized scroll (0→1) at which hero dive / --dive reaches full strength. */
export const HERO_DIVE_END_P = 0.48;

/**
 * Map unified scroll progress to layered crossfade channels.
 * Hero → S2/S3 tunnel → S4 starfield (long) → S5 video with Z dive handoff.
 */
export function mapScrollProgress(progress) {
  const p = clamp01(progress / SCROLL_RANGE);

  const dive = clamp01(p / HERO_DIVE_END_P);

  const section2In = clamp01((p - 0.26) / 0.14);
  const section2Out = 1 - clamp01((p - 0.48) / 0.16);
  const section2 = Math.min(section2In, section2Out);

  /** Section 3 — full transition window (unchanged from earlier tuning). */
  const section3In = clamp01((p - 0.44) / 0.14);
  const section3Out = 1 - clamp01((p - 0.68) / 0.16);
  const section3 = Math.min(section3In, section3Out);

  /** Section 4 — long band for case studies (starts after S3 handoff). */
  const section4In = clamp01((p - 0.58) / 0.12);
  const section4Out = 1 - clamp01((p - 0.86) / 0.1);
  const section4 = Math.min(section4In, section4Out);

  const section5 = clamp01((p - 0.8) / 0.16);

  /** Tunnel scrub through S2 + full S3 fade (incl. S3→S4 crossfade). */
  const tunnelProgress = clamp01((p - 0.26) / 0.5);

  const forwardProgress = clamp01((p - 0.26) / 0.72);

  const section2Phase = clamp01((p - 0.26) / 0.22);
  const section2Content = clamp01((section2Phase - 0.02) / 0.014);

  const section3Phase = clamp01((p - 0.44) / 0.32);
  const section3Content = clamp01((section3Phase - 0.02) / 0.014);

  const section4Phase = clamp01((p - 0.58) / 0.36);
  const section4Content = clamp01((section4Phase - 0.02) / 0.014);

  const section5Phase = clamp01((p - 0.8) / 0.18);
  const section5Content = clamp01((section5Phase - 0.02) / 0.014);

  /** 0→1 during S4→S5 overlap — drives Z zoom (S4 flies in, S5 settles). */
  const s45Dive = clamp01((p - 0.78) / 0.14);

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
    section5,
    section5Content,
    section5Phase,
    tunnelProgress,
    forwardProgress,
    s45Dive,
  };
}
