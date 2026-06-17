const clamp01 = (v) => Math.max(0, Math.min(1, v));

/** Raw wheel progress runs 0 → SCROLL_RANGE before the experience is fully complete. */
export const SCROLL_RANGE = 22;

/** Normalized scroll (0→1) at which hero dive / --dive reaches full strength. */
export const HERO_DIVE_END_P = 0.26;

/** Section 2 band (≈2× previous scroll distance). */
export const SECTION2_P_START = 0.22;
export const SECTION2_P_END = 0.62;
export const SECTION2_FADE_IN = 0.08;
export const SECTION2_FADE_OUT = 0.14;

/** Section 3 band (≈2× previous scroll distance). */
export const SECTION3_P_START = 0.5;
export const SECTION3_P_END = 0.76;
export const SECTION3_FADE_IN = 0.1;
export const SECTION3_FADE_OUT = 0.16;

/** Section 4 — case studies. */
export const SECTION4_P_START = 0.75;
export const SECTION4_P_END = 0.9;
export const SECTION4_FADE_IN = 0.08;
export const SECTION4_FADE_OUT = 0.08;

/** Section 5 — testimonials (after case studies). */
export const SECTION5_P_START = 0.86;
export const SECTION5_FADE_IN = 0.12;

/** S3 → S4 handoff — drives vortex exit + burst entrance. */
export const SECTION3_TO4_START = SECTION4_P_START;
export const SECTION3_TO4_SPAN = 0.14;

/**
 * Case Studies button target — S4 fully visible, before S5 fade or S4 exit vortex.
 * (Must stay below SECTION5_P_START; the old post-vortex target overlapped S5.)
 */
export const SECTION4_SETTLED_P = SECTION5_P_START - 0.02;

/** S4 → S5 handoff — drives vortex exit + burst entrance. */
export const SECTION4_TO5_START = SECTION5_P_START;
export const SECTION4_TO5_SPAN = 0.14;

/** Wheel progress value that lands in Section 4 (uses existing scroll smoothing). */
export function getSection4ScrollTarget() {
  return SECTION4_SETTLED_P * SCROLL_RANGE;
}

/** Tunnel scroll spans S2 + S3 (drives backgrounds + card stack). */
export const TUNNEL_P_START = SECTION2_P_START;
export const TUNNEL_P_END = 0.88;
export const TUNNEL_P_SPAN = TUNNEL_P_END - TUNNEL_P_START;
export const TUNNEL_SECTION2_END = (SECTION2_P_END - SECTION2_P_START) / TUNNEL_P_SPAN;

/**
 * Map unified scroll progress to layered crossfade channels.
 * Hero → S2/S3 tunnel → S4 case studies → S5 testimonials.
 */
export function mapScrollProgress(progress) {
  const p = clamp01(progress / SCROLL_RANGE);

  const dive = clamp01(p / HERO_DIVE_END_P);

  const section2In = clamp01((p - SECTION2_P_START) / SECTION2_FADE_IN);
  const section2Out = 1 - clamp01((p - SECTION2_P_END) / SECTION2_FADE_OUT);
  const section2 = Math.min(section2In, section2Out);

  const section3In = clamp01((p - SECTION3_P_START) / SECTION3_FADE_IN);
  const section3Out = 1 - clamp01((p - SECTION3_P_END) / SECTION3_FADE_OUT);
  const section3 = Math.min(section3In, section3Out);

  const section4In = clamp01((p - SECTION4_P_START) / SECTION4_FADE_IN);
  const section4Out = 1 - clamp01((p - SECTION4_P_END) / SECTION4_FADE_OUT);
  const section4 = Math.min(section4In, section4Out);

  const section5 = clamp01((p - SECTION5_P_START) / SECTION5_FADE_IN);

  const section3Exit = clamp01((p - SECTION3_TO4_START) / SECTION3_TO4_SPAN);
  const section4Exit = clamp01((p - SECTION4_TO5_START) / SECTION4_TO5_SPAN);

  const tunnelProgress = clamp01((p - TUNNEL_P_START) / TUNNEL_P_SPAN);
  const section2TunnelPhase = clamp01(tunnelProgress / TUNNEL_SECTION2_END);
  const section3TunnelPhase = clamp01(
    (tunnelProgress - TUNNEL_SECTION2_END) / Math.max(1e-6, 1 - TUNNEL_SECTION2_END),
  );

  const forwardProgress = clamp01((p - TUNNEL_P_START) / (1 - TUNNEL_P_START));

  const section2Span = SECTION2_P_END - SECTION2_P_START + SECTION2_FADE_OUT;
  const section2Phase = clamp01((p - SECTION2_P_START) / section2Span);
  const section2Content = clamp01((section2Phase - 0.04) / 0.02);

  const section2StackPhase = clamp01((p - (SECTION2_P_START + 0.04)) / (section2Span - 0.04));

  const section3Span = SECTION3_P_END - SECTION3_P_START + SECTION3_FADE_OUT;
  const section3Phase = clamp01((p - SECTION3_P_START) / section3Span);
  const section3Content = clamp01((section3Phase - 0.02) / 0.014);

  const section4Span = SECTION4_P_END - SECTION4_P_START + SECTION4_FADE_OUT;
  const section4Phase = clamp01((p - SECTION4_P_START) / section4Span);
  const section4Content = clamp01((section4Phase - 0.04) / 0.06);

  const section5Phase = clamp01((p - SECTION5_P_START) / (1 - SECTION5_P_START));
  const section5Content = clamp01((section5Phase - 0.04) / 0.06);

  return {
    dive,
    section2,
    section2Content,
    section2Phase,
    section2StackPhase,
    section2TunnelPhase,
    section3TunnelPhase,
    section3,
    section3Content,
    section3Phase,
    section4,
    section4Content,
    section4Phase,
    section5,
    section5Content,
    section5Phase,
    section3Exit,
    section4Exit,
    tunnelProgress,
    forwardProgress,
  };
}
