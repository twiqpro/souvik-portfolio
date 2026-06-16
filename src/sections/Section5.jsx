import { DottedSurface } from '../components/DottedSurface';
import { Testimonials } from '../components/Testimonials';
import './Section5.css';

/**
 * Section 5 — dotted wave surface + testimonials.
 */
function Section5({ active = false }) {
  return (
    <section
      id="section-5"
      className={`section-5${active ? ' section-5--active' : ''}`}
      aria-label="Testimonials"
      aria-hidden={!active}
    >
      <div className="section-5__bg" aria-hidden="true">
        <DottedSurface active={active} />
      </div>

      <div className="section-5__scrim" aria-hidden="true" />

      <div className="section-5__overlay">
        <Testimonials />
      </div>
    </section>
  );
}

export { Section5 };
