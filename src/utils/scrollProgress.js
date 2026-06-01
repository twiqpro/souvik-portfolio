const clamp01 = (v) => Math.max(0, Math.min(1, v));

/**
 * Map unified scroll progress (0→1) to layered crossfade channels.
 * Hero dive and Section 2 overlap so the transition feels continuous.
 */
export function mapScrollProgress(progress) {
  const p = clamp01(progress);

  const dive = clamp01(p / 0.58);
  const section2 = clamp01((p - 0.28) / 0.72);
  const section2Content = clamp01((p - 0.32) / 0.58);

  return { dive, section2, section2Content };
}
