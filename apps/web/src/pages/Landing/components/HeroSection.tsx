import { useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import styles from '../Landing.module.css';
import { MagneticButton } from '../../../components/ui/MagneticButton';

interface HeroSectionProps {
  onCta: () => void;
}

export function HeroSection({ onCta }: HeroSectionProps) {
  const prefersReduced = useReducedMotion();

  /* ── Mouse tracking ─────────────────────────────────────────── */
  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.5);

  const springCfg = { stiffness: 55, damping: 22, mass: 0.6 };
  const sx = useSpring(rawX, springCfg);
  const sy = useSpring(rawY, springCfg);

  // Background grid drifts gently with cursor
  const gridX = useTransform(sx, [0, 1], [-12, 12]);
  const gridY = useTransform(sy, [0, 1], [-7, 7]);

  // Content counter-parallax (opposite direction — depth)
  const contentX = useTransform(sx, [0, 1], [5, -5]);
  const contentY = useTransform(sy, [0, 1], [3, -3]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (prefersReduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width);
    rawY.set((e.clientY - rect.top)  / rect.height);
  }, [rawX, rawY, prefersReduced]);

  const handleMouseLeave = useCallback(() => {
    rawX.set(0.5);
    rawY.set(0.5);
  }, [rawX, rawY]);

  return (
    <section
      className={styles.heroMinimal}
      aria-labelledby="hero-heading"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.heroMinimalBackground} />

      {/* Grid + noise drift with mouse */}
      <motion.div
        className={styles.heroMinimalGrid}
        aria-hidden="true"
        style={prefersReduced ? {} : { x: gridX, y: gridY }}
      />
      <motion.div
        className={styles.heroMinimalNoise}
        aria-hidden="true"
        style={prefersReduced ? {} : { x: gridX, y: gridY }}
      />

      {/* Content block — counter-parallax */}
      <motion.div
        className={styles.heroMinimalContent}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
        style={prefersReduced ? {} : { x: contentX, y: contentY }}
      >

        <motion.h1
          id="hero-heading"
          className={styles.heroMinimalWordmark}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 1, 0.5, 1] }}
        >
          <span className={styles.heroMinimalPrep}>prep</span>
          <span className={styles.heroMinimalRueba}>rueba</span>
        </motion.h1>

        <motion.p
          className={styles.heroMinimalSubtitle}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 1, 0.5, 1] }}
        >
          PREPARACIÓN UNIVERSITARIA • +25 • +40 • +45
        </motion.p>

        <motion.div
          className={styles.heroMinimalPillGroup}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 1, 0.5, 1] }}
        >
          <div className={styles.heroMinimalPill}>
            <span className={styles.heroMinimalCheck}>✓</span> Practica hoy. Aprueba este año.
          </div>

          <MagneticButton className={styles.heroMinimalCta} onClick={onCta}>
            <span className={styles.btnShimmer} aria-hidden="true" />
            Empezar gratis
          </MagneticButton>
        </motion.div>

      </motion.div>

      {/* Scroll hint */}
      <motion.div
        className={styles.heroScrollHint}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.6 }}
        aria-hidden="true"
      >
        <span className={styles.heroScrollHintArrow}>↓</span>
      </motion.div>
    </section>
  );
}
