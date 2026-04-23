import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import styles from '../Landing.module.css';
import { staggerContainer, slideUp, VIEWPORT_ONCE } from '../lib/landingAnimations';
import { MagneticButton } from '../../../components/ui/MagneticButton';
import { SpotlightCard } from '../../../components/ui/SpotlightCard';
import { stripe as stripeApi } from '../../../services/api';
import type { StripePrice } from '../../../services/api';

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
    colors: ['#FF6624', '#0D1B4B', '#FF9B29', '#FEFAF5', '#fff'],
  });
}

interface PricingSectionProps {
  onCta: (priceId?: string) => void;
}

interface LandingPlan {
  id: string;
  priceId?: string;
  period: string;
  currency: string;
  price: string;
  per: string;
  total: string | null;
  badge: string | null;
  popular: boolean;
}

const FALLBACK_PLANS: LandingPlan[] = [
  {
    id: 'mensual',
    period: 'Mensual',
    currency: '€',
    price: '9,99',
    per: '/mes',
    total: null,
    badge: null,
    popular: false,
  },
  {
    id: 'trimestral',
    period: 'Trimestral',
    currency: '€',
    price: '7,49',
    per: '/mes',
    total: '€22,47 total · ahorra 25%',
    badge: 'MÁS POPULAR',
    popular: true,
  },
  {
    id: 'anual',
    period: 'Anual',
    currency: '€',
    price: '4,99',
    per: '/mes',
    total: '€59,88/año · ahorra 50%',
    badge: 'AHORRA 50%',
    popular: false,
  },
];

const CURRENCY_SYMBOLS: Record<string, string> = {
  eur: '€',
  usd: '$',
  gbp: '£',
};

function getIntervalMonths(price: StripePrice): number {
  if (price.interval === 'month') return price.intervalCount;
  if (price.interval === 'year') return price.intervalCount * 12;
  return 1;
}

function getPeriodLabel(price: StripePrice): string {
  const customLabel = price.metadata.display_period || price.productMetadata.display_period;
  if (customLabel) return customLabel;

  if (price.interval === 'month' && price.intervalCount === 1) return 'Mensual';
  if (price.interval === 'month' && price.intervalCount === 3) return 'Trimestral';
  if (price.interval === 'year' && price.intervalCount === 1) return 'Anual';

  const intervalLabels: Record<StripePrice['interval'], string> = {
    day: 'día',
    week: 'semana',
    month: 'mes',
    year: 'año',
  };
  return `${price.intervalCount} ${intervalLabels[price.interval]}`;
}

function getPerLabel(price: StripePrice, months: number): string {
  if (months > 1 || price.interval === 'month') return '/mes';
  if (price.interval === 'year') return '/año';
  if (price.interval === 'week') return '/semana';
  return '/día';
}

function formatAmount(amountInCents: number): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountInCents / 100);
}

function formatCurrency(amountInCents: number, currency: string): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountInCents / 100);
}

function buildPlans(prices: StripePrice[]): LandingPlan[] {
  const sortedPrices = [...prices].sort((a, b) => getIntervalMonths(a) - getIntervalMonths(b));
  const monthlyBase = sortedPrices.find((price) => getIntervalMonths(price) === 1);
  const baseMonthlyAmount = monthlyBase?.unitAmount;
  const popularPriceId =
    sortedPrices.find((price) => price.metadata.popular === 'true' || price.productMetadata.popular === 'true')?.id ??
    sortedPrices.find((price) => getIntervalMonths(price) === 3)?.id ??
    sortedPrices[1]?.id ??
    sortedPrices[0]?.id;

  return sortedPrices.map((price) => {
    const months = getIntervalMonths(price);
    const monthlyAmount = months > 1 ? Math.round(price.unitAmount / months) : price.unitAmount;
    const savings =
      baseMonthlyAmount && months > 1 && monthlyAmount < baseMonthlyAmount
        ? Math.round((1 - monthlyAmount / baseMonthlyAmount) * 100)
        : 0;
    const customBadge = price.metadata.badge || price.productMetadata.badge;
    const customTotal = price.metadata.total_label || price.productMetadata.total_label;
    const popular = price.id === popularPriceId;

    return {
      id: price.id,
      priceId: price.id,
      period: getPeriodLabel(price),
      currency: CURRENCY_SYMBOLS[price.currency] ?? price.currency.toUpperCase(),
      price: formatAmount(monthlyAmount),
      per: getPerLabel(price, months),
      total:
        customTotal ??
        (months > 1
          ? `${formatCurrency(price.unitAmount, price.currency)} total${savings ? ` · ahorra ${savings}%` : ''}`
          : null),
      badge: customBadge ?? (popular ? 'MÁS POPULAR' : savings ? `AHORRA ${savings}%` : null),
      popular,
    };
  });
}

export function PricingSection({ onCta }: PricingSectionProps) {
  const prefersReduced = useReducedMotion();
  const [stripePlans, setStripePlans] = useState<LandingPlan[] | null>(null);

  useEffect(() => {
    let mounted = true;

    stripeApi.prices()
      .then(({ prices }) => {
        if (mounted && prices.length > 0) {
          setStripePlans(buildPlans(prices));
        }
      })
      .catch(() => {
        if (mounted) setStripePlans(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const plans = useMemo(() => stripePlans ?? FALLBACK_PLANS, [stripePlans]);

  const handleCta = (priceId?: string) => {
    if (!prefersReduced) fireConfetti();
    onCta(priceId);
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
          {plans.map((plan) => (
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
                  <span className={styles.pricingCardCurrency}>{plan.currency}</span>
                  <span className={styles.pricingCardAmount}>{plan.price}</span>
                  <span className={styles.pricingCardPer}>{plan.per}</span>
                </div>

                <p className={styles.pricingCardTotal}>{plan.total ?? '\u00A0'}</p>

                <MagneticButton
                  className={`${styles.pricingCardCta} ${plan.popular ? styles.pricingCardCtaPopular : ''}`}
                  onClick={() => handleCta(plan.priceId)}
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
