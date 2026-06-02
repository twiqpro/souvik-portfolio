import { TunnelBackground } from '../components/TunnelBackground';
import './Section2.css';

/**
 * Section 2 — scroll-driven tunnel shader + statement overlay.
 */
function Section2({ active = false, diveRef = null }) {
  return (
    <section
      id="section-2"
      className={`section-2${active ? ' section-2--active' : ''}`}
      aria-label="About"
      aria-hidden={!active}
    >
      <TunnelBackground
        diveRef={diveRef}
        className="section-2__bg section-2__bg--tunnel"
        scrollKey="tunnelProgress"
        visibilityKey="section2"
        scrollTime={16}
        speedMultiplier={0.2}
      />
      <div className="section-2__scrim" aria-hidden="true" />

      <div className="section-2__overlay">
        <h2 className="section-2__statement">
          <span className="section-2__statement-lead">
            <span className="section-2__statement-line">I am an AI Native Product Designer</span>
            <span className="section-2__statement-line">
              &amp; <s>Vibe Coder</s> Builder
            </span>
          </span>
        </h2>
      </div>
    </section>
  );
}

export { Section2 };
