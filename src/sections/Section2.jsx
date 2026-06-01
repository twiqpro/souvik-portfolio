import { Section2AuroraBackground } from '../components/Section2AuroraBackground';
import './Section2.css';

/**
 * Section 2 — aurora shader background + statement overlay.
 */
function Section2({ active = false }) {
  return (
    <section
      id="section-2"
      className={`section-2${active ? ' section-2--active' : ''}`}
      aria-label="About"
      aria-hidden={!active}
    >
      <Section2AuroraBackground active={active} />
      <div className="section-2__scrim" aria-hidden="true" />

      <div className="section-2__overlay">
        <h2 className="section-2__statement">
          <span className="section-2__statement-lead">
            <span className="section-2__statement-line">I am an AI Native Product Designer</span>
            <span className="section-2__statement-line">&amp; Vibe Coder</span>
          </span>
        </h2>
      </div>
    </section>
  );
}

export { Section2 };
