import type { CSSProperties, ReactNode } from 'react';

type BadgeVariant =
  | 'blue'      // estrutural/geral — azul soft
  | 'orange'    // destaque/energia — laranja soft
  | 'amber'     // recomendação IA — âmbar soft
  | 'neutral'   // metadata/ano — neutro
  | 'success'
  | 'error'
  // Aliases legados
  | 'general'
  | 'especifica'
  | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  size?: 'sm' | 'md';
}

const variantStyles: Record<string, CSSProperties> = {
  /* ── Distribuição cromática 60/25/10/5 ── */
  blue: {
    background: 'var(--blue-soft)',
    color: 'var(--pp-blue-dark)',
    border: '1px solid rgba(53, 92, 245, 0.12)',
  },
  orange: {
    background: 'var(--orange-soft)',
    color: 'var(--pp-amber-dark)',
    border: '1px solid rgba(255, 102, 36, 0.15)',
  },
  amber: {
    background: 'var(--warn-bg)',
    color: 'var(--pp-amber-dark)',
    border: '1px solid rgba(255, 155, 41, 0.18)',
  },
  neutral: {
    background: 'var(--surface-alt)',
    color: 'var(--text-2)',
    border: '1px solid var(--border)',
  },
  success: {
    background: 'var(--success-bg)',
    color: 'var(--success)',
    border: '1px solid rgba(22, 163, 74, 0.18)',
  },
  error: {
    background: 'var(--error-bg)',
    color: 'var(--error)',
    border: '1px solid rgba(220, 38, 38, 0.18)',
  },

  /* ── Aliases legados ── */
  general:   {
    background: 'var(--blue-soft)',
    color: 'var(--pp-blue-dark)',
    border: '1px solid rgba(53, 92, 245, 0.12)',
  },
  especifica: {
    background: 'var(--orange-soft)',
    color: 'var(--pp-amber-dark)',
    border: '1px solid rgba(255, 102, 36, 0.15)',
  },
  default: {
    background: 'var(--surface-alt)',
    color: 'var(--text-2)',
    border: '1px solid var(--border)',
  },
};

export function Badge({ variant = 'neutral', size = 'sm', children }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        borderRadius: 'var(--radius-full)',
        padding: size === 'sm' ? '3px 10px' : '5px 13px',
        fontSize: size === 'sm' ? '11px' : '12px',
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        lineHeight: 1.5,
        letterSpacing: '0.025em',
        whiteSpace: 'nowrap',
        transition: 'background-color 180ms var(--ease), color 180ms var(--ease)',
        ...variantStyles[variant],
      }}
    >
      {children}
    </span>
  );
}
