import { HeroCard } from './HeroCard';
import { WireBundle } from './WireBundle';
import './HeroHang.css';

function HeroHang() {
  return (
    <div className="hero-lift">
      <div className="wire-anchor">
        <div className="wire-source" aria-hidden="true" />
        <WireBundle />
      </div>
      <div className="hero-lift__card">
        <HeroCard />
      </div>
      <div className="hero-lift__balance" aria-hidden="true" />
    </div>
  );
}

export { HeroHang };
