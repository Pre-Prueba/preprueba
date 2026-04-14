import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { useCountUp } from '../lib/useCountUp';
import styles from '../Landing.module.css';

interface StatItemProps {
  value: number;
  suffix?: string;
  label: string;
}

function StatItem({ value, suffix = '', label }: StatItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: '-80px' } as any);
  const count = useCountUp(value, 1200, inView);
  return (
    <div ref={ref} className={styles.mockupStat}>
      <span className={styles.mockupStatNum}>{count}{suffix}</span>
      <span className={styles.mockupStatLabel}>{label}</span>
    </div>
  );
}

interface ProgressBarProps {
  label: string;
  emoji: string;
  value: number;
  color: string;
  delay?: number;
}

function ProgressBar({ label, emoji, value, color, delay = 0 }: ProgressBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: '-80px' } as any);
  return (
    <div ref={ref} className={styles.progressRow}>
      <div className={styles.progressLabel}>
        <span className={styles.progressEmoji}>{emoji}</span>
        <span>{label}</span>
      </div>
      <div className={styles.progressTrack}>
        <div
          className={styles.progressFill}
          style={{
            backgroundColor: color,
            width: inView ? `${value}%` : '0%',
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
      <span className={styles.progressPct}>{value}%</span>
    </div>
  );
}

export function DashboardMockup() {
  return (
    <div className={styles.mockup} aria-hidden="true">
      <div className={styles.mockupHeader}>
        <div className={styles.mockupDots}>
          <span /><span /><span />
        </div>
        <span className={styles.mockupTitle}>Mi progreso — Semana 3</span>
      </div>
      <div className={styles.mockupStats}>
        <StatItem value={12} label="sesiones" />
        <StatItem value={84} suffix="%" label="acierto" />
        <StatItem value={120} label="preguntas" />
      </div>
      <div className={styles.progressList}>
        <ProgressBar label="Comprensión" emoji="📖" value={88} color="var(--brand-orange)" delay={0} />
        <ProgressBar label="Historia" emoji="🏛️" value={72} color="var(--brand-navy)" delay={150} />
        <ProgressBar label="Matemáticas" emoji="🧮" value={61} color="#A78BFA" delay={300} />
      </div>
      <div className={styles.streakBadge}>
        <span className={styles.streakFire}>🔥</span>
        <div>
          <div className={styles.streakNum}>4 días</div>
          <div className={styles.streakSub}>racha activa</div>
        </div>
      </div>
    </div>
  );
}
