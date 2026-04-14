import { motion, useReducedMotion } from 'framer-motion';
import styles from '../Landing.module.css';
import { staggerContainer, slideUp, VIEWPORT_ONCE } from '../lib/landingAnimations';
import { DashboardMockup } from './DashboardMockup';

const FEATURES = [
  { icon: '📊', text: 'Estadísticas de progreso por materia en tiempo real' },
  { icon: '🤖', text: 'Feedback de IA en cada respuesta, en el momento' },
  { icon: '🔥', text: 'Racha diaria para mantener el ritmo de estudio' },
  { icon: '📅', text: 'Historial completo de sesiones y evolución' },
  { icon: '🎯', text: 'Preguntas adaptadas a tu nivel y comunidad autónoma' },
];

export function DashboardPreviewSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section className={styles.dashPreviewSection} aria-labelledby="dash-heading">
      <div className={styles.dashPreviewInner}>
        {/* Text column */}
        <motion.div
          className={styles.dashPreviewText}
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        >
          <p className={styles.eyebrow}>EL DASHBOARD</p>
          <h2 id="dash-heading" className={styles.sectionTitle}>
            Toda tu preparación<br /><em className={styles.titleEm}>en una pantalla.</em>
          </h2>

          <motion.ul
            className={styles.dashPreviewFeatures}
            variants={staggerContainer(0.08, 0.3)}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT_ONCE}
          >
            {FEATURES.map((f) => (
              <motion.li
                key={f.text}
                className={styles.dashPreviewFeature}
                variants={slideUp(0)}
                whileHover={prefersReduced ? {} : { x: 6 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                <span className={styles.dashPreviewFeatureIcon} aria-hidden="true">{f.icon}</span>
                <span>{f.text}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Mockup column — hover to straighten + lift */}
        <motion.div
          className={styles.dashPreviewMockupWrap}
          initial={{ opacity: 0, x: 30, rotate: 0 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1], delay: 0.1 }}
          whileHover={prefersReduced ? {} : { rotate: 0, scale: 1.03, y: -10 }}
          style={{ rotate: -2 }}
        >
          <DashboardMockup />
        </motion.div>
      </div>
    </section>
  );
}
