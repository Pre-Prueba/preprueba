import { type ReactNode } from 'react';
import { PipoMascot, type PipoMascotMotion, type PipoMascotVariant } from './PipoMascot';
import styles from './PipoEmptyState.module.css';

type PipoEmptyStateProps = {
  variant?: PipoMascotVariant;
  motion?: PipoMascotMotion;
  mascotSize?: number | string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
  className?: string;
  role?: string;
};

export function PipoEmptyState({
  variant = 'book',
  motion,
  mascotSize = 132,
  title,
  description,
  actionLabel,
  onAction,
  children,
  className = '',
  role,
}: PipoEmptyStateProps) {
  const rootClassName = [styles.root, className].filter(Boolean).join(' ');
  const defaultMotion: PipoMascotMotion =
    variant === 'celebrate'
      ? 'celebrate'
      : variant === 'sad'
        ? 'sad'
        : variant === 'sleep'
          ? 'sleep'
          : variant === 'focus'
            ? 'focus'
            : 'idle';

  return (
    <div className={rootClassName} role={role}>
      <div className={styles.mascot}>
        <PipoMascot variant={variant} size={mascotSize} motion={motion ?? defaultMotion} title="PIPO" />
      </div>
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {children && <div className={styles.extra}>{children}</div>}
      {actionLabel && onAction && (
        <button type="button" className={styles.action} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
