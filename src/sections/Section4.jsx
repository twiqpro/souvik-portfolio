import { Starfield } from '../components/Starfield';
import './Section4.css';

/**
 * Section 4 — starfield background + contact / closing headline.
 */
function Section4({ active = false }) {
  return (
    <section
      id="section-4"
      className={`section-4${active ? ' section-4--active' : ''}`}
      aria-label="Contact"
      aria-hidden={!active}
    >
      <div className="section-4__bg" aria-hidden="true">
        <Starfield active={active} mouseAdjust clickToWarp speed={1.2} quantity={512} />
      </div>
      <div className="section-4__scrim" aria-hidden="true" />

      <div className="section-4__overlay">
        <h2 className="section-4__statement">
          <span className="section-4__statement-line">Let&apos;s build something</span>
          <span className="section-4__statement-sub">Scroll the void · Move the stars</span>
        </h2>
      </div>
    </section>
  );
}

export { Section4 };
