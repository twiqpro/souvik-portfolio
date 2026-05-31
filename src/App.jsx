import { useCallback, useEffect, useRef, useState } from 'react';
import { GLSLHills } from './components/GLSLHills';
import { HeroHang } from './components/HeroHang';
import { Section2 } from './sections/Section2';
import { useDiveScroll } from './hooks/useDiveScroll';
import { mapScrollProgress } from './utils/scrollProgress';
import './App.css';

const SCROLL_SMOOTHING = 0.11;

function App() {
  const dive = useDiveScroll();
  const [section2Active, setSection2Active] = useState(false);
  const section2ActiveRef = useRef(false);

  const handleScrollFrame = useCallback(() => {
    const { target, current } = dive.current;
    dive.current.current += (target - current) * SCROLL_SMOOTHING;

    const { dive: diveAmount, section2, section2Content } = mapScrollProgress(
      dive.current.current,
    );

    document.documentElement.style.setProperty('--dive', String(diveAmount));
    document.documentElement.style.setProperty('--section2', String(section2));
    document.documentElement.style.setProperty('--section2-content', String(section2Content));

    const nextActive = section2 > 0.08;
    if (nextActive !== section2ActiveRef.current) {
      section2ActiveRef.current = nextActive;
      setSection2Active(nextActive);
    }
  }, [dive]);

  return (
    <div className="app">
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
          {section2Active ? 'Scroll up to return' : 'Scroll to enter'}
        </p>
      </div>

      <HeroHang diveRef={dive} />

      <Section2 active={section2Active} />

      <div className="dive-vignette" aria-hidden="true" />
    </div>
  );
}

export default App;
