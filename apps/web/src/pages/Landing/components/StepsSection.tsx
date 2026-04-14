import { motion, useReducedMotion } from 'framer-motion';
import styles from '../Landing.module.css';
import { staggerContainer, slideUp, VIEWPORT_ONCE } from '../lib/landingAnimations';
import { SpotlightCard } from '../../../components/ui/SpotlightCard';

/* ── Inline SVG icons (no emoji, no external lib) ──────────── */
function IconStudy() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="15" height="19" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10h9M8 14h9M8 18h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="10" y="3" width="15" height="19" rx="2" fill="var(--brand-surface)" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15 8h5M15 12h5M15 16h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconPencil() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M5 22l3.5-1.5L22 7a2.5 2.5 0 00-3.5-3.5L5 17 5 22z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M18.5 3.5L24.5 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 22l3.5-1.5-2-2L5 22z" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

function IconAI() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="5"  cy="7"  r="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="23" cy="7"  r="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="5"  cy="21" r="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="23" cy="21" r="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 7.8l4.8 4.3M16.3 15.9l4.7 4.3M7 20.3l4.8-4.3M16.3 12.1l4.7-4.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const STEPS = [
  {
    n: '01',
    Icon: IconStudy,
    title: 'Elige tu materia',
    desc: 'Selecciona entre todas las asignaturas de tu prueba — general y específica. Ordenadas por dificultad.',
  },
  {
    n: '02',
    Icon: IconPencil,
    title: 'Responde preguntas reales',
    desc: 'Preguntas de exámenes oficiales anteriores, organizadas por materia, año y comunidad autónoma.',
  },
  {
    n: '03',
    Icon: IconAI,
    title: 'Recibe feedback de IA',
    desc: 'Corrección inmediata con explicación clara. Aprende exactamente por qué fallaste, en el momento.',
  },
];

export function StepsSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section id="como-funciona" className={styles.stepsSection} aria-labelledby="steps-heading">
      <div className={styles.container}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className={styles.sectionHeader}
        >
          <p className={styles.eyebrow}>CÓMO FUNCIONA</p>
          <h2 id="steps-heading" className={styles.sectionTitle}>
            Una metodología<br /><em className={styles.titleEm}>infalible.</em>
          </h2>
        </motion.div>

        {/* Steps grid */}
        <motion.div
          className={styles.stepsGrid}
          variants={staggerContainer(0.12, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
        >
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              variants={slideUp(i * 0.04)}
              whileHover={prefersReduced ? {} : { y: -10, boxShadow: 'var(--shadow-xl)' }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            >
              <SpotlightCard
                className={styles.stepCard}
                spotlightColor="rgba(240,140,26,0.08)"
                style={{ borderTop: '2px solid var(--brand-orange)' }}
              >
                {/* Header row: badge + icon */}
                <div className={styles.stepHeader}>
                  <span className={styles.stepBadge}>{s.n}</span>
                  <motion.span
                    className={styles.stepIconWrap}
                    initial={{ scale: 0.7, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 280, damping: 16, delay: i * 0.1 + 0.3 }}
                  >
                    <s.Icon />
                  </motion.span>
                </div>

                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>

                {/* Step connector arrow (hidden on last card) */}
                {i < 2 && (
                  <span className={styles.stepArrow} aria-hidden="true">→</span>
                )}
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Comunidades marquee strip */}
        <div className={styles.marqueeWrap} aria-label="Comunidades autónomas cubiertas">
          <div className={styles.marqueeTrack}>
            {[...Array(2)].map((_, gi) => (
              <div key={gi} className={styles.marqueeGroup} aria-hidden={gi > 0}>
                {[
                  'Madrid', 'Cataluña', 'Andalucía', 'Com. Valenciana',
                  'País Vasco', 'Galicia', 'Aragón', 'Castilla y León',
                  'Canarias', 'Baleares', 'Extremadura', 'Murcia',
                ].map((c) => (
                  <span key={c} className={styles.marqueeItem}>
                    <span className={styles.marqueeItemDot} aria-hidden="true">·</span>
                    {c}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
