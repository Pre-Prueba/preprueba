import { motion, useReducedMotion } from 'framer-motion';
import styles from '../Landing.module.css';
import { VIEWPORT_ONCE } from '../lib/landingAnimations';

const LINES: { text: string; accent: boolean }[] = [
  { text: 'No eres demasiado mayor',       accent: false },
  { text: 'para volver a estudiar.',        accent: false },
  { text: 'Eres exactamente',               accent: true  },
  { text: 'la persona correcta,',           accent: true  },
  { text: 'en el momento correcto.',        accent: false },
];

export function ManifestoSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section className={styles.manifestoSection} aria-labelledby="manifesto-heading">
      <div className={styles.manifestoNoise} aria-hidden="true" />

      <div className={styles.container}>
        <motion.p
          className={styles.manifestoEyebrow}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: 0.45 }}
        >
          MANIFIESTO
        </motion.p>

        <h2
          id="manifesto-heading"
          className={styles.manifestoTitle}
          aria-label={LINES.map(l => l.text).join(' ')}
        >
          {LINES.map((line, i) => (
            <motion.span
              key={i}
              className={`${styles.manifestoLine} ${line.accent ? styles.manifestoLineAccent : ''}`}
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-32px' }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                delay: i * 0.09,
              }}
            >
              {line.text}
            </motion.span>
          ))}
        </h2>

        <motion.div
          className={styles.manifestoFooter}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: 0.55, delay: 0.55 }}
        >
          <p className={styles.manifestoSub}>
            Más de 4.200 preguntas reales. Corrección con IA. €9,99 al mes.
          </p>
          <p className={styles.manifestoSubStrong}>
            Tu acceso a la universidad empieza aquí.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
