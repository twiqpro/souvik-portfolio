import { CaseStudyCards } from '../components/CaseStudyCards';
import { Section4ShaderBackground } from '../components/Section4ShaderBackground';
import './Section4.css';

/**
 * Section 4 — shader background + case studies.
 */
function Section4({ active = false, diveRef = null }) {
  return (
    <section
      id="section-4"
      className={`section-4${active ? ' section-4--active' : ''}`}
      aria-label="Selected work"
      aria-hidden={!active}
    >
      <div className="section-4__bg" aria-hidden="true">
        <Section4ShaderBackground active={active} diveRef={diveRef} />
      </div>

      <div className="section-4__overlay">
        <header className="section-4__header">
          <h2 className="section-4__statement">
            <span className="section-4__statement-line">Selected Work</span>
          </h2>
        </header>

        <div className="section-4__cases">
          <CaseStudyCards active={active} />
        </div>
      </div>
    </section>
  );
}

export { Section4 };
