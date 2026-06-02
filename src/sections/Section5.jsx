import { AmbientLoopVideo } from '../components/AmbientLoopVideo';
import './Section5.css';

const BACKGROUND_VIDEO_SRC = '/Background.mp4';

/**
 * Section 5 — looping Background.mp4 (normal playback) + overlay.
 */
function Section5({ active = false }) {
  return (
    <section
      id="section-5"
      className={`section-5${active ? ' section-5--active' : ''}`}
      aria-label="Journey"
      aria-hidden={!active}
    >
      <div className="section-5__bg" aria-hidden="true">
        <div className="section-5__bg-zoom">
          <AmbientLoopVideo
            src={BACKGROUND_VIDEO_SRC}
            active={active}
            className="section-5__video"
          />
        </div>
      </div>
      <div className="section-5__scrim" aria-hidden="true" />

      <div className="section-5__overlay">
        <h2 className="section-5__statement">
          <span className="section-5__statement-line">Through the cloud</span>
          <span className="section-5__statement-sub">Always moving forward</span>
        </h2>
      </div>
    </section>
  );
}

export { Section5, BACKGROUND_VIDEO_SRC };
