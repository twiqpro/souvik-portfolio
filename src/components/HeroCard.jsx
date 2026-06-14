import { useState } from 'react';
import { getSection4ScrollTarget } from '../utils/scrollProgress';
import './HeroCard.css';

function StarIcon() {
  return (
    <svg className="hero-card__icon" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 1.2l1.55 3.14 3.47.5-2.51 2.45.59 3.45L8 9.67 4.9 11.74l.59-3.45L3 4.84l3.47-.5L8 1.2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg className="hero-card__icon" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="2.5" y="5.5" width="11" height="7.5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <path d="M5.5 5.5V4.5a2.5 2.5 0 015 0v1" fill="none" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

function HeroCard({ diveRef = null }) {
  const [imgError, setImgError] = useState(false);

  const goToCaseStudies = (event) => {
    event.preventDefault();
    if (!diveRef?.current) return;
    diveRef.current.target = getSection4ScrollTarget();
  };

  return (
    <article className="hero-card" aria-label="Introduction">
      <div className="hero-card__glass">
        <div className="hero-card__content">
          <div className="hero-card__avatar-block">
            {!imgError ? (
              <img
                className="hero-card__avatar"
                src="/avatar.png"
                alt=""
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="hero-card__avatar hero-card__avatar--fallback" aria-hidden="true">
                SB
              </div>
            )}
          </div>

          <h1 className="hero-card__name">Hi, I&apos;m Souvik</h1>

          <p className="hero-card__role">Lead Product Designer</p>
          <p className="hero-card__company">@wayfair</p>

          <div className="hero-card__rule" aria-hidden="true" />

          <footer className="hero-card__meta">
            <div className="hero-card__meta-item">
              <StarIcon />
              <span>6+ Years</span>
            </div>
            <div className="hero-card__meta-item">
              <img src="/bits-pilani.png" alt="" className="hero-card__bits-logo" width={16} height={16} />
              <span>BITS Pilani</span>
            </div>
            <a href="/resume.pdf" className="hero-card__meta-item hero-card__resume">
              <BriefcaseIcon />
              <span>Resume</span>
              <span className="hero-card__external" aria-hidden="true">
                ↗
              </span>
            </a>
          </footer>
        </div>

        <div className="hero-card__spacer">
          <a
            href="#section-4"
            className="hero-card__case-studies-btn"
            onClick={goToCaseStudies}
          >
            Case Studies
          </a>
        </div>
      </div>
    </article>
  );
}

export { HeroCard };
