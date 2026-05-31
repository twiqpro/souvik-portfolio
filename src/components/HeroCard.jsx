import { useState } from 'react';
import './HeroCard.css';

/** Placeholder copy — update role, company, experience, edu, resume later. */
function HeroCard() {
  const [imgError, setImgError] = useState(false);

  return (
    <article className="hero-card" aria-label="Introduction">
      <div className="hero-card__glass">
        <div className="hero-card__avatar-block">
          <div className="hero-card__avatar-glow" aria-hidden="true" />
          {!imgError ? (
            <img
              className="hero-card__avatar"
              src="/avatar.jpg"
              alt=""
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="hero-card__avatar hero-card__avatar--fallback" aria-hidden="true">
              SB
            </div>
          )}
        </div>

        <div className="hero-card__intro">
          <span className="hero-card__badge">
            <span aria-hidden="true">👋</span> I&apos;m
          </span>
          <h1 className="hero-card__name">Souvik B.</h1>
        </div>

        <p className="hero-card__title">
          <span>Lead Product Designer</span>
          <span>@wayfair</span>
        </p>

        <footer className="hero-card__meta">
          <span className="hero-card__meta-item">5+ years</span>
          <span className="hero-card__divider" aria-hidden="true" />
          <span className="hero-card__meta-item hero-card__edu">
            <img src="/bits-pilani.svg" alt="" className="hero-card__bits-logo" width={20} height={20} />
            <span className="hero-card__bits-text">BITS PILANI</span>
          </span>
          <span className="hero-card__divider" aria-hidden="true" />
          <a href="#" className="hero-card__meta-item hero-card__resume">
            Resume
            <span className="hero-card__external" aria-hidden="true">
              ↗
            </span>
          </a>
        </footer>
      </div>
    </article>
  );
}

export { HeroCard };
