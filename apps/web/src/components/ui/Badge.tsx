import { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'general' | 'especifica' | 'default';
  children: ReactNode;
}

export function Badge({ variant = 'default', children }: BadgeProps) {
  const styles: Record<string, React.CSSProperties> = {
    general: {
      background: 'var(--color-badge-general-bg)',
      color: 'var(--color-badge-general-text)',
    },
    especifica: {
      background: 'var(--color-badge-especifica-bg)',
      color: 'var(--color-badge-especifica-text)',
    },
    default: {
      background: 'var(--color-platinum)',
      color: 'var(--color-text-muted)',
    },
  };

  return (
    <span
      style={{
        display: 'inline-block',
        borderRadius: 'var(--radius-full)',
        padding: '4px 12px',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        lineHeight: 1.5,
        ...styles[variant],
      }}
    >
      {children}
    </span>
  );
}
