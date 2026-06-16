import { useEffect, useRef, useState } from 'react';
import { TESTIMONIAL_COLUMNS, TESTIMONIALS_BY_ID } from '../data/testimonials';
import './Testimonials.css';

function TestimonialAvatar({ src, initials }) {
  return (
    <div className="testimonial-card__avatar">
      {src ? (
        <img src={src} alt="" className="testimonial-card__avatar-img" loading="lazy" />
      ) : null}
      <span className="testimonial-card__avatar-fallback">{initials}</span>
    </div>
  );
}

function TestimonialCard({ item, index }) {
  const paragraphs = item.quote.split('\n\n').filter(Boolean);

  return (
    <article
      className="testimonial-card"
      style={{ '--card-index': index }}
    >
      <header className="testimonial-card__header">
        <TestimonialAvatar src={item.avatar} initials={item.initials} />
        <div className="testimonial-card__meta">
          <h3 className="testimonial-card__name">{item.name}</h3>
          <p className="testimonial-card__role">{item.role}</p>
          {item.badge ? (
            <span className="testimonial-card__badge">{item.badge}</span>
          ) : null}
        </div>
      </header>

      <blockquote className="testimonial-card__quote">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </blockquote>
    </article>
  );
}

function Testimonials() {
  const viewportRef = useRef(null);
  const gridRef = useRef(null);
  const [gridScale, setGridScale] = useState(1);
  const [useColumns, setUseColumns] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches,
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    const grid = gridRef.current;
    if (!viewport || !grid) return undefined;

    const fitGrid = () => {
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
      setUseColumns(isDesktop);

      if (!isDesktop) {
        setGridScale(1);
        grid.style.transform = '';
        grid.style.width = '';
        return;
      }

      grid.style.transform = 'scale(1)';
      grid.style.width = '100%';

      const available = viewport.clientHeight;
      const needed = grid.scrollHeight;
      if (!available || !needed) return;

      const nextScale = Math.min(1, available / needed);
      setGridScale(nextScale);

      if (nextScale < 1) {
        grid.style.transform = `scale(${nextScale})`;
        grid.style.width = `${100 / nextScale}%`;
      } else {
        grid.style.transform = '';
        grid.style.width = '';
      }
    };

    const resizeObserver = new ResizeObserver(fitGrid);
    resizeObserver.observe(viewport);
    resizeObserver.observe(grid);
    window.addEventListener('resize', fitGrid);
    fitGrid();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', fitGrid);
    };
  }, []);

  return (
    <div className="testimonials">
      <h2 className="testimonials__title">Folks I&apos;ve worked with!</h2>

      <div ref={viewportRef} className="testimonials__viewport">
        <div
          ref={gridRef}
          className={`testimonials__grid${useColumns ? ' testimonials__grid--columns' : ''}`}
          style={{ '--grid-scale': gridScale }}
        >
          {useColumns
            ? (() => {
                let cardIndex = 0;
                return TESTIMONIAL_COLUMNS.map((columnIds) => (
                  <div key={columnIds.join('-')} className="testimonials__column">
                    {columnIds.map((id) => {
                      const index = cardIndex;
                      cardIndex += 1;
                      return (
                        <TestimonialCard
                          key={id}
                          item={TESTIMONIALS_BY_ID[id]}
                          index={index}
                        />
                      );
                    })}
                  </div>
                ));
              })()
            : TESTIMONIAL_COLUMNS.flat().map((id, index) => (
                <TestimonialCard
                  key={id}
                  item={TESTIMONIALS_BY_ID[id]}
                  index={index}
                />
              ))}
        </div>
      </div>
    </div>
  );
}

export { Testimonials };
