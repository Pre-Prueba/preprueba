import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import styles from '../Landing.module.css';
import { VIEWPORT_ONCE } from '../lib/landingAnimations';

interface BarProps {
  label: string;
  value: string;
  pct: number;
  fillClass: string;
  delay?: number;
}

function Bar({ label, value, pct, fillClass, delay = 0 }: BarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: '-60px' } as any);
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={styles.barRow}
      whileHover={{ x: 4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div className={styles.barMeta}>
        <span className={styles.barLabel}>{label}</span>
        <motion.span
          className={styles.barValue}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
          transition={{ duration: 0.4, delay: delay / 1000 + 0.3 }}
        >
          {value}
        </motion.span>
      </div>
      <div className={styles.barTrack}>
        <div
          className={`${styles.barFill} ${fillClass}`}
          style={{
            width: (inView && !prefersReduced) ? `${pct}%` : prefersReduced ? `${pct}%` : '0%',
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
    </motion.div>
  );
}

export function ComparisonSection() {
  return (
    <section className={styles.comparisonSection} aria-labelledby="comparison-heading">
      <div className={styles.comparisonGrid} aria-hidden="true" />
      <div className={styles.container}>
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
        >
          <p className={styles.eyebrow}>RESULTADOS</p>
          <h2 id="comparison-heading" className={styles.sectionTitle}>
            Los números no<br /><em className={styles.titleEm}>mienten.</em>
          </h2>
        </motion.div>

        <motion.div
          className={styles.comparisonLegend}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.legendDotGray}`} />
            <span className={styles.legendLabel}>Sin Preprueba</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.legendDotOrange}`} />
            <span className={styles.legendLabel}>Con Preprueba</span>
          </div>
        </motion.div>

        <motion.div
          className={styles.comparisonCols}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div>
            <p className={`${styles.comparisonColTitle} ${styles.comparisonColTitleGray}`}>
              Sin Preprueba
            </p>
            <Bar label="Tasa de aprobación" value="58%"    pct={58} fillClass={styles.barFillGray}   delay={0} />
            <Bar label="Nota media"          value="5,2"   pct={52} fillClass={styles.barFillGray}   delay={120} />
            <Bar label="Horas hasta aprobar" value="340 h" pct={85} fillClass={styles.barFillGray}   delay={240} />
          </div>

          <div>
            <p className={`${styles.comparisonColTitle} ${styles.comparisonColTitleOrange}`}>
              Con Preprueba
            </p>
            <Bar label="Tasa de aprobación" value="81%"    pct={81} fillClass={styles.barFillOrange} delay={80} />
            <Bar label="Nota media"          value="7,4"   pct={74} fillClass={styles.barFillOrange} delay={200} />
            <Bar label="Horas hasta aprobar" value="180 h" pct={45} fillClass={styles.barFillBlue}   delay={320} />
          </div>
        </motion.div>

        <p className={styles.comparisonFootnote}>
          * Tasa de aprobación media nacional basada en datos públicos del Ministerio de Educación.
          Horas y nota estimadas a partir de estudios sobre aprendizaje activo vs. pasivo.
        </p>
      </div>
    </section>
  );
}
