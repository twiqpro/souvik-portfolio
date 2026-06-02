import { useCallback, useRef, useState } from 'react';
import { GLSLHills } from './components/GLSLHills';
import { HeroHang } from './components/HeroHang';
import { Section2 } from './sections/Section2';
import { Section3 } from './sections/Section3';
import { Section4 } from './sections/Section4';
import { Section5 } from './sections/Section5';
import { useDiveScroll } from './hooks/useDiveScroll';
import { mapScrollProgress, SCROLL_RANGE } from './utils/scrollProgress';
import './App.css';

const SCROLL_SMOOTHING = 0.14;

function App() {
  const dive = useDiveScroll({ max: SCROLL_RANGE, sensitivity: 0.00115 });
  const [section2Active, setSection2Active] = useState(false);
  const [section3Active, setSection3Active] = useState(false);
  const [section4Active, setSection4Active] = useState(false);
  const [section5Active, setSection5Active] = useState(false);
  const section2ActiveRef = useRef(false);
  const section3ActiveRef = useRef(false);
  const section4ActiveRef = useRef(false);
  const section5ActiveRef = useRef(false);

  const handleScrollFrame = useCallback(() => {
    const { target, current } = dive.current;
    dive.current.current += (target - current) * SCROLL_SMOOTHING;

    const mapped = mapScrollProgress(dive.current.current);
    dive.current.mapped = mapped;

    document.documentElement.style.setProperty('--dive', String(mapped.dive));
    document.documentElement.style.setProperty('--section2', String(mapped.section2));
    document.documentElement.style.setProperty('--section2-content', String(mapped.section2Content));
    document.documentElement.style.setProperty('--section3', String(mapped.section3));
    document.documentElement.style.setProperty('--section3-content', String(mapped.section3Content));
    document.documentElement.style.setProperty('--section4', String(mapped.section4));
    document.documentElement.style.setProperty('--section4-content', String(mapped.section4Content));
    document.documentElement.style.setProperty('--section5', String(mapped.section5));
    document.documentElement.style.setProperty('--section5-content', String(mapped.section5Content));
    document.documentElement.style.setProperty('--tunnel-progress', String(mapped.tunnelProgress));
    document.documentElement.style.setProperty('--forward-progress', String(mapped.forwardProgress));
    document.documentElement.style.setProperty('--s45-dive', String(mapped.s45Dive));

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

    const nextS4 = mapped.section4 > 0.08;
    if (nextS4 !== section4ActiveRef.current) {
      section4ActiveRef.current = nextS4;
      setSection4Active(nextS4);
    }

    const nextS5 = mapped.section5 > 0.08;
    if (nextS5 !== section5ActiveRef.current) {
      section5ActiveRef.current = nextS5;
      setSection5Active(nextS5);
    }
  }, [dive]);

  const scrollHint = section5Active
    ? 'Scroll up to return'
    : section4Active
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
          onFrame={handleScrollFrame}
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
      <Section4 active={section4Active} />
      <Section5 active={section5Active} />

      <div className="dive-vignette" aria-hidden="true" />
    </div>
  );
}

export default App;
