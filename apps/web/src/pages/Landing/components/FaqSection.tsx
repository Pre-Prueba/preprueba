import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import styles from '../Landing.module.css';
import { VIEWPORT_ONCE } from '../lib/landingAnimations';

const FAQS = [
  {
    q: '¿Qué pruebas cubre Preprueba?',
    a: 'Cubre las tres pruebas de acceso a la universidad para mayores en España: Mayores de 25, 40 y 45 años. Incluye todas las materias de la fase general y las más habituales de la específica.',
  },
  {
    q: '¿Las preguntas son reales?',
    a: 'Sí. La mayoría son preguntas extraídas de exámenes oficiales publicados por las distintas comunidades autónomas. Algunas han sido generadas por IA para completar materias con menor volumen de exámenes disponibles.',
  },
  {
    q: '¿Cómo funciona la corrección con IA?',
    a: 'Cuando respondes una pregunta, la IA analiza tu respuesta, confirma si es correcta y te da una explicación clara en máximo 3 frases. Aprende del error en el momento, no al final.',
  },
  {
    q: '¿Puedo cancelar cuando quiera?',
    a: 'Sí. No hay permanencia. Si cancelas antes de que termine el periodo de facturación, sigues teniendo acceso hasta el final del mes que has pagado. Sin letra pequeña.',
  },
  {
    q: '¿Hay periodo de prueba?',
    a: 'Puedes registrarte gratis y explorar la plataforma. Para acceder al banco completo de preguntas necesitas la suscripción.',
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  const prefersReduced = useReducedMotion();

  return (
    <section className={styles.faqSection} aria-labelledby="faq-heading">
      <div className={styles.container}>
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: 0.6 }}
        >
          <p className={styles.eyebrow}>PREGUNTAS FRECUENTES</p>
          <h2 id="faq-heading" className={styles.sectionTitle}>
            Todo lo que<br /><em className={styles.titleEm}>necesitas saber.</em>
          </h2>
        </motion.div>

        <div className={styles.faqList} role="list">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={i}
                role="listitem"
                className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                whileHover={prefersReduced ? {} : { x: 4 }}
              >
                <button
                  className={styles.faqTrigger}
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-${i}`}
                  id={`faq-btn-${i}`}
                >
                  <span className={styles.faqQ}>{faq.q}</span>
                  <motion.span
                    className={styles.faqChevron}
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    aria-hidden="true"
                  >
                    +
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-${i}`}
                      role="region"
                      aria-labelledby={`faq-btn-${i}`}
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <p className={styles.faqA}>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
