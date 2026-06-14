import { useCallback, useRef, useState } from 'react';
import { GLSLHills } from './components/GLSLHills';
import { HeroHang } from './components/HeroHang';
import { TunnelCardGallery } from './components/TunnelCardGallery';
import { Section2 } from './sections/Section2';
import { Section3 } from './sections/Section3';
import { Section4 } from './sections/Section4';
import { useDiveScroll } from './hooks/useDiveScroll';
import { useScrollFrame } from './hooks/useScrollFrame';
import { mapScrollProgress, SCROLL_RANGE } from './utils/scrollProgress';
import './App.css';
import './components/TunnelCardStack.css';

const SCROLL_SMOOTHING = 0.14;

function App() {
  const dive = useDiveScroll({ max: SCROLL_RANGE, sensitivity: 0.00115 });
  const [section2Active, setSection2Active] = useState(false);
  const [section3Active, setSection3Active] = useState(false);
  const [section4Active, setSection4Active] = useState(false);
  const section2ActiveRef = useRef(false);
  const section3ActiveRef = useRef(false);
  const section4ActiveRef = useRef(false);

  const handleScrollFrame = useCallback((dt) => {
    const { target, current } = dive.current;
    const factor = 1 - (1 - SCROLL_SMOOTHING) ** (dt * 60);
    dive.current.current += (target - current) * factor;

    const mapped = mapScrollProgress(dive.current.current);
    dive.current.mapped = mapped;

    document.documentElement.style.setProperty('--dive', String(mapped.dive));
    document.documentElement.style.setProperty('--section2', String(mapped.section2));
    document.documentElement.style.setProperty('--section2-content', String(mapped.section2Content));
    document.documentElement.style.setProperty('--section3', String(mapped.section3));
    document.documentElement.style.setProperty('--section3-content', String(mapped.section3Content));
    document.documentElement.style.setProperty('--section4', String(mapped.section4));
    document.documentElement.style.setProperty('--section4-content', String(mapped.section4Content));
    document.documentElement.style.setProperty('--tunnel-progress', String(mapped.tunnelProgress));
    document.documentElement.style.setProperty('--forward-progress', String(mapped.forwardProgress));

    const nextS2 = mapped.section2 > 0.08;
    if (nextS2 !== section2ActiveRef.current) {
      section2ActiveRef.current = nextS2;
      setSection2Active(nextS2);
    }

    const nextS3 = mapped.section3 > 0.08;
    if (nextS3 !== section3ActiveRef.current) {
      section3ActiveRef.current = nextS3;
      setSection3Active(nextS3);
    }

    const nextS4 = mapped.section4 > 0.02;
    if (nextS4 !== section4ActiveRef.current) {
      section4ActiveRef.current = nextS4;
      setSection4Active(nextS4);
    }
  }, [dive]);

  useScrollFrame(handleScrollFrame);

  const scrollHint = section4Active
    ? 'Scroll · explore case studies'
    : section3Active
      ? 'Scroll to continue'
      : section2Active
        ? 'Scroll to continue'
        : 'Scroll to enter';

  return (
    <div className="app">
      <HeroHang diveRef={dive} />

      <div className="app__hills">
        <GLSLHills
          diveRef={dive}
          cameraZ={125}
          cameraZEnd={8}
          planeSize={256}
          speed={0.5}
        />
      </div>

      <div className="ui">
        <p className="scroll-hint" aria-live="polite">
          {scrollHint}
        </p>
      </div>

      <Section2 active={section2Active} diveRef={dive} />
      <Section3 active={section3Active} diveRef={dive} />

      <div className="tunnel-card-stack" aria-hidden={!(section2Active || section3Active)}>
        <TunnelCardGallery
          diveRef={dive}
          active={section2Active || section3Active}
        />
      </div>

      <Section4 active={section4Active} />

      <div className="dive-vignette" aria-hidden="true" />
    </div>
  );
}

export default App;
