import { motion, useReducedMotion } from 'framer-motion';
import styles from '../Landing.module.css';
import { staggerContainer, slideUp, VIEWPORT_ONCE } from '../lib/landingAnimations';
import { TiltCard } from '../../../components/ui/TiltCard';
import { SpotlightCard } from '../../../components/ui/SpotlightCard';

const AVATARS_BG = ['#0D1B4B', '#F08C1A', '#1a2d6e'];

const TESTIMONIALS = [
  {
    quote: 'Llevaba años queriendo estudiar Enfermería. Con Preprueba empecé a practicar 20 minutos al día en el metro. Aprobé al primer intento.',
    name: 'María José R.',
    age: 41,
    city: 'Madrid',
    initials: 'MJ',
    badge: '✓ Aprobó +40 · junio 2025',
  },
  {
    quote: 'No tenía tiempo para una academia. Preprueba me dejó estudiar a mi ritmo, cuando yo quería. Las explicaciones de la IA son mejores que cualquier profesor.',
    name: 'Carlos M.',
    age: 28,
    city: 'Barcelona',
    initials: 'CM',
    badge: '✓ Prueba +25 · nota 7,3',
  },
  {
    quote: 'Pensaba que era demasiado mayor. Preprueba me demostró que no. Preguntas reales, corrección inmediata. Así se aprende de verdad.',
    name: 'Ana L.',
    age: 67,
    city: 'Valencia',
    initials: 'AL',
    badge: '✓ Aprobó +45 · sept. 2025',
  },
];

export function TestimonialsSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section className={styles.testimonialsSection} aria-labelledby="testimonials-heading">
      <div className={styles.container}>
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
        >
          <p className={styles.eyebrow}>HISTORIAS REALES</p>
          <h2 id="testimonials-heading" className={styles.sectionTitle}>
            Personas como tú,<br /><em className={styles.titleEm}>que ya aprobaron.</em>
          </h2>
        </motion.div>

        {/* perspective on parent for 3-D tilt to work correctly */}
        <motion.div
          className={styles.testimonialsGrid}
          variants={staggerContainer(0.12, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          style={{ perspective: '1200px' }}
        >
          {TESTIMONIALS.map((t, i) => (
            /* Entrance wrapper — handles scroll-triggered fade/slide */
            <motion.div key={t.name} variants={slideUp(0)}>
              {/* TiltCard — handles 3-D tilt on hover */}
              <TiltCard maxTilt={prefersReduced ? 0 : 6} scale={1.02}>
                {/* SpotlightCard — handles cursor-follow glow */}
                <SpotlightCard
                  className={styles.testimonialCard}
                  spotlightColor="rgba(240, 140, 26, 0.08)"
                >
                  <p className={styles.testimonialQuote}>{t.quote}</p>

                  <div>
                    <div className={styles.testimonialFooter}>
                      <div
                        className={styles.testimonialAvatar}
                        style={{ background: AVATARS_BG[i] }}
                        aria-hidden="true"
                      >
                        {t.initials}
                      </div>
                      <div className={styles.testimonialMeta}>
                        <span className={styles.testimonialName}>{t.name}</span>
                        <span className={styles.testimonialLocation}>{t.age} años · {t.city}</span>
                      </div>
                    </div>
                    <div className={styles.testimonialBadge}>{t.badge}</div>
                  </div>
                </SpotlightCard>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
