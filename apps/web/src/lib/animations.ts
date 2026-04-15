import type { Variants } from 'framer-motion'

const ease = [0.4, 0, 0.2, 1] as const
const easeOut = [0.16, 1, 0.3, 1] as const

/* ── Fade + slide para cima (bloco genérico) */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease },
  },
}

/* ── Container com stagger para listas de filhos */
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}

/* ── Stagger mais lento para seções grandes */
export const staggerSlow: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

/* ── Slide da direita para o centro (transição entre questões) */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 48 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.42, ease: easeOut },
  },
  exit: {
    opacity: 0,
    x: -32,
    transition: { duration: 0.3, ease },
  },
}

/* ── Slide da esquerda para o centro (retroceder) */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -48 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.42, ease: easeOut },
  },
  exit: {
    opacity: 0,
    x: 32,
    transition: { duration: 0.3, ease },
  },
}

/* ── Fade simples (modals, overlays) */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3, ease } },
  exit: { opacity: 0, transition: { duration: 0.2, ease } },
}

/* ── Scale + fade (cards de resultado, celebrações) */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: [0.34, 1.56, 0.64, 1] },
  },
}

/* ── Bloco de feedback (entra de baixo, mais rápido) */
export const feedbackEnter: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: easeOut },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.22, ease },
  },
}

/* ── Item individual numa lista staggered */
export const listItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.44, ease },
  },
}

/* ── Hero headline (mais lento, mais dramático) */
export const heroHeadline: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: easeOut },
  },
}

/* ── Container do hero com stagger entre headline, sub, CTA */
export const heroContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.1,
    },
  },
}

/* ── Dashboard card item (entrada mais curta para cards secundários) */
export const dashboardItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeOut },
  },
}

/* ── Pulse único de atenção (ex: badge, indicador) */
export const pulseOnce: Variants = {
  hidden: { scale: 1 },
  show: {
    scale: [1, 1.04, 1],
    transition: { duration: 0.5, ease: easeOut, delay: 1.0 },
  },
}
