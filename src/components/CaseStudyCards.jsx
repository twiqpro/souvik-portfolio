import { motion, useReducedMotion } from 'motion/react';
import { CASE_STUDY_CARDS } from '../data/caseStudyCards';
import './CaseStudyCards.css';

const hoverTransition = { duration: 0.25, ease: 'easeOut' };

function CaseStudyCards({ active = false }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <div className="case-study-cards" aria-label="Case study list">
      <div className="case-study-cards__row">
        {CASE_STUDY_CARDS.map((study, index) => (
          <motion.a
            key={study.id}
            href={study.href}
            className="case-study-card"
            style={{ '--card-index': index }}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${study.imageAlt}. ${study.ctaLabel}`}
            whileHover={
              active && !shouldReduceMotion
                ? { y: -4, transition: hoverTransition }
                : undefined
            }
          >
            <img
              src={study.image}
              alt={study.imageAlt}
              className="case-study-card__image"
              loading="lazy"
              draggable={false}
            />
          </motion.a>
        ))}
      </div>
    </div>
  );
}

export { CaseStudyCards };
