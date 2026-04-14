import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useCountUp } from '../lib/useCountUp';
import styles from '../Landing.module.css';

interface CountStatProps {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  delay?: number;
}

function CountStat({ value, prefix = '', suffix = '', label, delay = 0 }: CountStatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: '-40px' } as any);
  const count = useCountUp(value, 1000, inView);

  return (
    <motion.div
      ref={ref}
      className={styles.statItem}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false }}
      transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1], delay }}
    >
      <span className={styles.statNum}>{prefix}{count.toLocaleString('es-ES')}{suffix}</span>
      <span className={styles.statLabel}>{label}</span>
    </motion.div>
  );
}

interface StaticStatProps {
  display: string;
  label: string;
  delay?: number;
}

function StaticStat({ display, label, delay = 0 }: StaticStatProps) {
  return (
    <motion.div
      className={styles.statItem}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false }}
      transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1], delay }}
    >
      <span className={styles.statNum}>{display}</span>
      <span className={styles.statLabel}>{label}</span>
    </motion.div>
  );
}

export function StatsBand() {
  return (
    <div className={styles.statsBand} aria-label="Estadísticas de Preprueba">
      <div className={styles.statsBandGrid} aria-hidden="true" />
      <div className={styles.statsBandInner}>
        <CountStat value={4200} prefix="+" label="preguntas reales" delay={0} />
        <div className={styles.statsDivider} aria-hidden="true" />
        <CountStat value={18} label="materias cubiertas" delay={0.1} />
        <div className={styles.statsDivider} aria-hidden="true" />
        <StaticStat display="desde €8,25" label="al mes · sin permanencia" delay={0.2} />
      </div>
    </div>
  );
}
