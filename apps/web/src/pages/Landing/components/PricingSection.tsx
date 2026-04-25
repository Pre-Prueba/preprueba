import { motion, useReducedMotion } from 'framer-motion';
import styles from '../Landing.module.css';
import { staggerContainer, slideUp, VIEWPORT_ONCE } from '../lib/landingAnimations';
import { MagneticButton } from '../../../components/ui/MagneticButton';
import { SpotlightCard } from '../../../components/ui/SpotlightCard';

const FEATURES = [
  'Acceso a todas las materias y pruebas',
  'Corrección inmediata con IA',
  'Historial y estadísticas de progreso',
  'Preguntas de exámenes oficiales',
  'Sin permanencia — cancela cuando quieras',
];

async function fireConfetti() {
  const mod = await import('canvas-confetti');
  const confetti = mod.default;
  confetti({
    particleCount: 140,
    spread: 90,
    origin: { y: 0.55 },
    colors: ['#F08C1A', '#0D1B4B', '#FFB84D', '#FEFAF5', '#fff'],
  });
}

interface PricingSectionProps {
  onCta: () => void;
}

const PLANS = [
  {
    id: 'mensual',
    period: 'Mensual',
    price: '9,99',
    total: null,
    badge: null,
    popular: false,
  },
  {
    id: 'trimestral',
    period: 'Trimestral',
    price: '7,49',
    total: '€22,47 total · ahorra 25%',
    badge: 'MÁS POPULAR',
    popular: true,
  },
  {
    id: 'anual',
    period: 'Anual',
    price: '4,99',
    total: '€59,88/año · ahorra 50%',
    badge: 'AHORRA 50%',
    popular: false,
  },
];

export function PricingSection({ onCta }: PricingSectionProps) {
  const prefersReduced = useReducedMotion();

  const handleCta = () => {
    if (!prefersReduced) fireConfetti();
    onCta();
  };

  return (
    <section id="precio" className={styles.pricingSection} aria-labelledby="pricing-heading">
      {/* Background decoration */}
      <div className={styles.pricingBgGlow} aria-hidden="true" />
      <div className={styles.pricingBgGrid} aria-hidden="true" />

      <div className={styles.container}>
        <motion.div
          className={styles.sectionHeader}
          style={{ textAlign: 'center' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: 0.6 }}
        >
          <p className={styles.eyebrow} style={{ color: 'var(--brand-gold)' }}>PRECIO</p>
          <h2 id="pricing-heading" className={styles.sectionTitle} style={{ color: '#fff' }}>
            Elige tu ritmo.<br /><em className={styles.titleEm}>Sin sorpresas.</em>
          </h2>
        </motion.div>

        {/* 3 plan cards */}
        <motion.div
          className={styles.pricingGrid}
          variants={staggerContainer(0.1, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
        >
          {PLANS.map((plan) => (
            <motion.div
              key={plan.id}
              variants={slideUp(0)}
              className={plan.popular ? styles.pricingPopularWrapper : undefined}
              whileHover={prefersReduced ? {} : { y: -6 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            >
              <SpotlightCard
                className={`${styles.pricingCardBase} ${plan.popular ? styles.pricingCardPopular : ''}`}
                spotlightColor={plan.popular ? 'rgba(240,140,26,0.22)' : 'rgba(255,255,255,0.05)'}
              >
                {/* Badge */}
                {plan.badge ? (
                  <span
                    className={`${styles.pricingCardBadge} ${
                      plan.popular ? styles.pricingCardBadgePopular : styles.pricingCardBadgeSavings
                    }`}
                  >
                    {plan.badge}
                  </span>
                ) : (
                  <div className={styles.pricingCardBadgeSpacer} />
                )}

                <p className={styles.pricingCardPeriod}>{plan.period}</p>

                {/* Price */}
                <div className={styles.pricingCardPrice}>
                  <span className={styles.pricingCardCurrency}>€</span>
                  <span className={styles.pricingCardAmount}>{plan.price}</span>
                  <span className={styles.pricingCardPer}>/mes</span>
                </div>

                <p className={styles.pricingCardTotal}>{plan.total ?? '\u00A0'}</p>

                <MagneticButton
                  className={`${styles.pricingCardCta} ${plan.popular ? styles.pricingCardCtaPopular : ''}`}
                  onClick={handleCta}
                >
                  <span className={styles.btnShimmer} aria-hidden="true" />
                  {plan.popular ? 'Empezar ahora →' : 'Empezar ahora'}
                </MagneticButton>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Shared feature list */}
        <motion.ul
          className={styles.pricingSharedFeatures}
          variants={staggerContainer(0.06, 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
        >
          {FEATURES.map((f) => (
            <motion.li key={f} className={styles.pricingSharedFeature} variants={slideUp(0)}>
              <span className={styles.pricingSharedCheck} aria-hidden="true">✓</span>
              {f}
            </motion.li>
          ))}
        </motion.ul>

        <motion.p
          className={styles.pricingSharedNote}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Sin permanencia · Cancela cuando quieras · Pago seguro con Stripe
        </motion.p>
      </div>
    </section>
  );
}
