import { TunnelBackground } from '../components/TunnelBackground';
import './Section3.css';

/**
 * Section 3 — continued scroll-driven tunnel (violet twist) + work headline.
 */
function Section3({ active = false, diveRef = null }) {
  return (
    <section
      id="section-3"
      className={`section-3${active ? ' section-3--active' : ''}`}
      aria-label="Work"
      aria-hidden={!active}
    >
      <TunnelBackground
        diveRef={diveRef}
        className="section-3__bg section-3__bg--tunnel"
        canvasClassName="section-3__canvas"
        scrollKey="section3TunnelPhase"
        visibilityKey="section3"
        scrollTime={16}
        speedMultiplier={0.2}
      />
      <div className="section-3__scrim" aria-hidden="true" />

      <div className="section-3__overlay">
        <h2 className="section-3__statement">
          <span className="section-3__statement-line">Building in the void</span>
          <span className="section-3__statement-sub">
            Product design · AI-native flows · Systems
          </span>
        </h2>
      </div>
    </section>
  );
}

export { Section3 };
