import type { Variants } from 'framer-motion';

/* ── Easings ─────────────────────────────────────────────────── */
export const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;

/* Spring presets — used for all enter animations (more natural than tween) */
export const SPRING_SMOOTH  = { type: 'spring', damping: 28, stiffness: 160, mass: 0.8 } as const;
export const SPRING_SNAPPY  = { type: 'spring', damping: 22, stiffness: 260, mass: 0.6 } as const;
export const SPRING_BOUNCY  = { type: 'spring', damping: 14, stiffness: 300, mass: 0.5 } as const;

/* ── Stagger containers ──────────────────────────────────────── */
export const staggerContainer = (stagger = 0.08, delay = 0): Variants => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

/* ── Slide up — spring-based ─────────────────────────────────── */
export const slideUp = (delay = 0): Variants => ({
  hidden: { y: 32, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { ...SPRING_SMOOTH, delay },
  },
});

/* ── Slide up subtle (for dense sections) ────────────────────── */
export const slideUpSubtle = (delay = 0): Variants => ({
  hidden: { y: 18, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { ...SPRING_SNAPPY, delay },
  },
});

/* ── Scale in ────────────────────────────────────────────────── */
export const scaleIn = (delay = 0): Variants => ({
  hidden: { scale: 0.9, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: { ...SPRING_SNAPPY, delay },
  },
});

/* ── Slide right ─────────────────────────────────────────────── */
export const slideRight = (delay = 0): Variants => ({
  hidden: { x: -28, opacity: 0 },
  show: {
    x: 0,
    opacity: 1,
    transition: { ...SPRING_SMOOTH, delay },
  },
});

/* ── Fade ────────────────────────────────────────────────────── */
export const fadeIn = (delay = 0): Variants => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.5, ease: EASE_OUT_QUART, delay },
  },
});

/* ── Viewport defaults ───────────────────────────────────────── */
export const VIEWPORT_ONCE   = { once: true,  margin: '-72px 0px' } as const;
export const VIEWPORT_REPEAT = { once: false, margin: '-72px 0px' } as const;
