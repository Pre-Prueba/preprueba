import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useInView, useReducedMotion, useMotionValue, animate } from 'framer-motion';
import React from 'react';
import styles from '../Landing.module.css';

const BLUE   = { bg: '#E8F0FF', accent: '#0038BC', text: '#0D1B4B' };
const ORANGE = { bg: '#FFF3E0', accent: '#F08C1A', text: '#7A3A00' };

const MATERIAS = [
  { symbol: 'Lc', num: '01', name: 'Lengua Castellana y Literatura', cat: 'General',    count: 'Común',         ...BLUE },
  { symbol: 'Co', num: '02', name: 'Comentario de Texto',            cat: 'General',    count: 'Común',         ...ORANGE },
  { symbol: 'Le', num: '03', name: 'Lengua Extranjera',              cat: 'General',    count: 'Común',         ...BLUE },
  { symbol: 'DA', num: '04', name: 'Dibujo Artístico',               cat: 'Específica', count: 'Rama A',        ...ORANGE },
  { symbol: 'Ge', num: '05', name: 'Geografía',                      cat: 'Específica', count: 'Rama A / D',    ...BLUE },
  { symbol: 'HA', num: '06', name: 'Historia del Arte',              cat: 'Específica', count: 'Rama A',        ...ORANGE },
  { symbol: 'HE', num: '07', name: 'Historia de España',             cat: 'Específica', count: 'Rama A / D',    ...BLUE },
  { symbol: 'HF', num: '08', name: 'Historia de la Filosofía',       cat: 'Específica', count: 'Rama A / D',    ...ORANGE },
  { symbol: 'LU', num: '09', name: 'Literatura Universal',           cat: 'Específica', count: 'Rama A',        ...BLUE },
  { symbol: 'Bi', num: '10', name: 'Biología',                       cat: 'Específica', count: 'Rama B / C / D',...ORANGE },
  { symbol: 'CT', num: '11', name: 'CC. de la Tierra',               cat: 'Específica', count: 'Rama B / E',    ...BLUE },
  { symbol: 'Fi', num: '12', name: 'Física',                         cat: 'Específica', count: 'Rama B / E',    ...ORANGE },
  { symbol: 'Ma', num: '13', name: 'Matemáticas',                    cat: 'Específica', count: 'Rama B / C',    ...BLUE },
  { symbol: 'Qu', num: '14', name: 'Química',                        cat: 'Específica', count: 'Rama B / C / E',...ORANGE },
  { symbol: 'EE', num: '15', name: 'Economía de la Empresa',         cat: 'Específica', count: 'Rama D',        ...BLUE },
  { symbol: 'MS', num: '16', name: 'Matemáticas CC.SS.',             cat: 'Específica', count: 'Rama D',        ...ORANGE },
  { symbol: 'DT', num: '17', name: 'Dibujo Técnico',                 cat: 'Específica', count: 'Rama E',        ...BLUE },
  { symbol: 'TI', num: '18', name: 'Tecnología Industrial',          cat: 'Específica', count: 'Rama E',        ...ORANGE },
];

const CARD_W  = 200;
const CARD_GAP = 14;
const STEP     = CARD_W + CARD_GAP;

export function MateriasSection() {
  const prefersReduced = useReducedMotion();

  /* ── header entrance ── */
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: false, margin: '-80px 0px' });

  /* ── carousel state ── */
  const viewportRef = useRef<HTMLDivElement>(null);
  const [maxLeft, setMaxLeft] = useState(0);
  const x = useMotionValue(0);

  useEffect(() => {
    const measure = () => {
      if (!viewportRef.current) return;
      const vw = viewportRef.current.offsetWidth;
      const trackW = MATERIAS.length * CARD_W + (MATERIAS.length - 1) * CARD_GAP;
      setMaxLeft(Math.max(0, trackW - vw));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (viewportRef.current) ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, []);

  const slide = useCallback((dir: 'prev' | 'next') => {
    const current = x.get();
    const target = dir === 'next'
      ? Math.max(current - STEP * 3, -maxLeft)
      : Math.min(current + STEP * 3, 0);
    animate(x, target, { type: 'spring', stiffness: 280, damping: 34 });
  }, [x, maxLeft]);

  return (
    <section id="materias" className={styles.materiasSection} aria-labelledby="materias-heading">
      <div className={styles.container}>

        {/* Header + controls row */}
        <div className={styles.materiasHeader}>
          <motion.div
            ref={headerRef}
            className={styles.sectionHeader}
            style={{ marginBottom: 0 }}
            initial={{ opacity: 0, y: 30 }}
            animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          >
            <p className={styles.eyebrow}>MATERIAS</p>
            <h2 id="materias-heading" className={styles.sectionTitle}>
              Todas las asignaturas,<br />
              <em className={styles.titleEm}>en un solo lugar.</em>
            </h2>
          </motion.div>

          {/* Arrow buttons */}
          <div className={styles.carouselControls}>
            <button
              className={styles.carouselBtn}
              onClick={() => slide('prev')}
              aria-label="Anterior"
            >
              ←
            </button>
            <button
              className={styles.carouselBtn}
              onClick={() => slide('next')}
              aria-label="Siguiente"
            >
              →
            </button>
          </div>
        </div>

        {/* Carousel viewport */}
        <div ref={viewportRef} className={styles.carouselViewport}>
          <motion.div
            className={styles.carouselTrack}
            style={{ x }}
            drag={prefersReduced ? false : 'x'}
            dragConstraints={{ left: -maxLeft, right: 0 }}
            dragElastic={0.08}
            dragTransition={{ bounceStiffness: 300, bounceDamping: 40 }}
          >
            {MATERIAS.map((m, i) => (
              <motion.div
                key={m.symbol}
                className={styles.periodicCard}
                style={{
                  '--card-bg':     m.bg,
                  '--card-accent': m.accent,
                  '--card-text':   m.text,
                  width: CARD_W,
                  flexShrink: 0,
                } as React.CSSProperties}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: '-40px' }}
                transition={{ type: 'spring', stiffness: 220, damping: 22, delay: Math.min(i * 0.04, 0.3) }}
                whileHover={prefersReduced ? {} : { y: -8, scale: 1.04 }}
              >
                <div className={styles.periodicTop}>
                  <span className={styles.periodicNum}>{m.num}</span>
                  <span className={styles.periodicCat}>{m.cat}</span>
                </div>

                <motion.div
                  className={styles.periodicSymbol}
                  whileHover={prefersReduced ? {} : { scale: 1.08 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                >
                  {m.symbol}
                </motion.div>

                <div className={styles.periodicBottom}>
                  <span className={styles.periodicName}>{m.name}</span>
                  <span className={styles.periodicCount}>{m.count}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Fade edges */}
          <div className={styles.carouselFadeLeft}  aria-hidden="true" />
          <div className={styles.carouselFadeRight} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
