import { Starfield } from '../components/Starfield';
import './Section4.css';

/**
 * Section 4 — starfield + case studies (long scroll band).
 */
function Section4({ active = false }) {
  return (
    <section
      id="section-4"
      className={`section-4${active ? ' section-4--active' : ''}`}
      aria-label="Case studies"
      aria-hidden={!active}
    >
      <div className="section-4__bg" aria-hidden="true">
        <Starfield active={active} mouseAdjust clickToWarp speed={1.2} quantity={512} />
      </div>
      <div className="section-4__scrim" aria-hidden="true" />

      <div className="section-4__overlay">
        <header className="section-4__header">
          <h2 className="section-4__statement">
            <span className="section-4__statement-line">Selected Work</span>
            <span className="section-4__statement-sub">Case studies</span>
          </h2>
        </header>

        <div className="section-4__cases" aria-label="Case study list">
          {/* Add case study cards here */}
          <p className="section-4__cases-placeholder">
            Case studies — scroll to explore
          </p>
        </div>
      </div>
    </section>
  );
}

export { Section4 };
