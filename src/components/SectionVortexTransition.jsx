import './SectionVortexTransition.css';

/**
 * Scroll-linked vortex bridge between sections.
 * `--bridge-exit` is set inline from `--section3-exit` or `--section4-exit`.
 */
function SectionVortexTransition({ exitVar = 'section3-exit', zIndex = 6.5 }) {
  return (
    <div
      className="section-vortex-bridge"
      style={{
        zIndex,
        '--bridge-exit': `var(--${exitVar}, 0)`,
      }}
      aria-hidden="true"
    >
      <div className="section-vortex-bridge__tunnel" />
      <div className="section-vortex-bridge__rings" />
      <div className="section-vortex-bridge__chromatic" />
      <div className="section-vortex-bridge__scanlines" />
      <div className="section-vortex-bridge__burst" />
      <div className="section-vortex-bridge__streaks" />
    </div>
  );
}

export { SectionVortexTransition };
