import type { CSSProperties, ReactNode } from 'react';

interface BadgeProps {
  variant?: 'general' | 'especifica' | 'default' | 'success' | 'error';
  children: ReactNode;
  size?: 'sm' | 'md';
}

const variantStyles: Record<string, CSSProperties> = {
  general: {
    background: 'var(--blue-soft)',
    color: 'var(--blue)',
    border: '1px solid var(--blue-dim)',
  },
  especifica: {
    background: 'var(--orange-soft)',
    color: 'var(--orange-deep)',
    border: '1px solid rgba(239, 143, 0, 0.25)',
  },
  default: {
    background: 'var(--surface)',
    color: 'var(--text-3)',
    border: '1px solid var(--border)',
  },
  success: {
    background: 'var(--success-bg)',
    color: 'var(--success)',
    border: '1px solid rgba(31, 169, 113, 0.25)',
  },
  error: {
    background: 'var(--error-bg)',
    color: 'var(--error)',
    border: '1px solid rgba(214, 69, 69, 0.25)',
  },
};

export function Badge({ variant = 'default', size = 'sm', children }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        borderRadius: 'var(--radius-full)',
        padding: size === 'sm' ? '3px 10px' : '5px 12px',
        fontSize: size === 'sm' ? '11px' : '12px',
        fontWeight: 600,
        lineHeight: 1.5,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
        ...variantStyles[variant],
      }}
    >
      {children}
    </span>
  );
}
