import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { useCallback, useId, useRef, useState } from 'react';
import { useOutsideClick } from '../hooks/useOutsideClick';
import './ExpandableGallery.css';

const CASE_STUDIES = [
  {
    id: 'case-1',
    src: '/section-2/work-landing.png',
    alt: 'Landing page redesign',
    rotation: -15,
    x: -160,
    y: 12,
    zIndex: 10,
  },
  {
    id: 'case-2',
    src: '/section-2/work-crm.png',
    alt: 'CRM product design',
    rotation: -3,
    x: -18,
    y: -22,
    zIndex: 20,
  },
  {
    id: 'case-3',
    src: '/section-2/work-integrations.png',
    alt: 'Integrations platform',
    rotation: 12,
    x: 130,
    y: 8,
    zIndex: 30,
  },
  {
    id: 'case-4',
    src: 'https://images.unsplash.com/photo-1756993399574-2fa126269ce7?w=900&auto=format&fit=crop&q=60',
    alt: 'Dashboard interface',
  },
  {
    id: 'case-5',
    src: 'https://images.unsplash.com/photo-1756990637536-714b76296a30?w=900&auto=format&fit=crop&q=60',
    alt: 'Product design',
  },
  {
    id: 'case-6',
    src: 'https://images.unsplash.com/photo-1756838197413-07f174def66c?w=900&auto=format&fit=crop&q=60',
    alt: 'Design workspace',
  },
  {
    id: 'case-7',
    src: 'https://images.unsplash.com/photo-1756310406492-3ce3bef447aa?w=900&auto=format&fit=crop&q=60',
    alt: 'Team collaboration',
  },
  {
    id: 'case-8',
    src: 'https://images.unsplash.com/photo-1755311905796-d539c7d24acd?w=900&auto=format&fit=crop&q=60',
    alt: 'UX wireframes',
  },
  {
    id: 'case-9',
    src: 'https://images.unsplash.com/photo-1755542366797-b3f036b11310?w=900&auto=format&fit=crop&q=60',
    alt: 'Developer workspace',
  },
];

const transition = {
  type: 'spring',
  stiffness: 160,
  damping: 18,
  mass: 1,
};

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M15 6l-6 6 6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M9 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const entranceTransition = {
  type: 'spring',
  stiffness: 110,
  damping: 22,
  mass: 0.95,
};

function ExpandableGallery({ active = false }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const layoutGroupId = useId();
  const containerRef = useRef(null);

  const collapse = useCallback(() => setIsExpanded(false), []);
  useOutsideClick(containerRef, () => {
    if (isExpanded) collapse();
  });

  return (
    <section className="expandable-gallery" aria-label="Case study gallery">
      <LayoutGroup id={layoutGroupId}>
        <div className="expandable-gallery__inner">
          <div className="expandable-gallery__toolbar">
            <AnimatePresence>
              {isExpanded && (
                <motion.button
                  key="back-button"
                  type="button"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={collapse}
                  className="expandable-gallery__back"
                >
                  <span className="expandable-gallery__back-icon">
                    <ArrowLeftIcon />
                  </span>
                  <span>Go back</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            ref={containerRef}
            layout
            className={`expandable-gallery__stage${isExpanded ? ' expandable-gallery__stage--expanded' : ''}`}
            transition={transition}
          >
            <motion.div
              className={`expandable-gallery__cards${isExpanded ? ' expandable-gallery__cards--expanded' : ''}`}
              initial={false}
              animate={
                isExpanded
                  ? { y: 0, opacity: 1 }
                  : {
                      y: active ? 0 : 180,
                      opacity: active ? 1 : 0,
                    }
              }
              transition={entranceTransition}
            >
              {CASE_STUDIES.map((photo, index) => {
                const isPrimary = index < 3;
                if (!isPrimary && !isExpanded) return null;

                return (
                  <motion.div
                    key={`card-${photo.id}`}
                    layoutId={`card-container-${photo.id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.88, y: 120 }}
                    animate={{
                      opacity: active ? 1 : 0,
                      scale: active ? 1 : 0.88,
                      rotate: !isExpanded ? photo.rotation || 0 : 0,
                      x: !isExpanded ? photo.x || 0 : 0,
                      y: !isExpanded ? (active ? photo.y || 0 : (photo.y || 0) + 80) : 0,
                      zIndex: !isExpanded ? photo.zIndex || index : 10,
                    }}
                    transition={{
                      ...transition,
                      delay: active && !isExpanded ? 0.12 + index * 0.1 : 0,
                    }}
                    whileHover={
                      !isExpanded
                        ? {
                            scale: 1.05,
                            y: (photo.y || 0) - 15,
                            rotate: (photo.rotation || 0) * 0.8,
                            zIndex: 50,
                            transition: {
                              type: 'spring',
                              stiffness: 400,
                              damping: 25,
                            },
                          }
                        : { scale: 1.02 }
                    }
                    className={`expandable-gallery__card${isExpanded ? ' expandable-gallery__card--expanded' : ''}`}
                    onClick={() => !isExpanded && setIsExpanded(true)}
                    onKeyDown={(e) => {
                      if (!isExpanded && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        setIsExpanded(true);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open case study: ${photo.alt}`}
                  >
                    <motion.div
                      layoutId={`image-inner-${photo.id}`}
                      layout="position"
                      className="expandable-gallery__image-wrap"
                      transition={transition}
                    >
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        className="expandable-gallery__image"
                        draggable={false}
                        loading={isPrimary ? 'eager' : 'lazy'}
                      />
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>

            <AnimatePresence>
              {!isExpanded && (
                <motion.div
                  key="stack-content"
                  initial={{ opacity: 0, y: 48 }}
                  animate={{
                    opacity: active ? 1 : 0,
                    y: active ? 0 : 48,
                  }}
                  exit={{ opacity: 0, y: 24 }}
                  transition={{ ...entranceTransition, delay: active ? 0.45 : 0 }}
                  className="expandable-gallery__copy"
                >
                  <div className="expandable-gallery__cta-wrap">
                    <button
                      type="button"
                      onClick={() => setIsExpanded(true)}
                      className="expandable-gallery__cta"
                    >
                      View all case studies
                      <ArrowRightIcon />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </LayoutGroup>
    </section>
  );
}

export { ExpandableGallery, CASE_STUDIES };
