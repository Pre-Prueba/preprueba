import { forwardRef, useState } from 'react';
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'orange' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: ReactNode;
}

const base: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  borderRadius: 'var(--radius-md)',
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '14px',
  lineHeight: 1,
  border: 'none',
  cursor: 'pointer',
  transition:
    'background 180ms var(--ease), box-shadow 220ms var(--ease), transform 180ms var(--ease), opacity 180ms var(--ease), border-color 180ms var(--ease)',
  whiteSpace: 'nowrap',
  letterSpacing: '0.01em',
  minHeight: '44px',
};

const variants: Record<string, CSSProperties> = {
  primary: {
    background: 'var(--pp-blue)',
    color: '#fff',
  },
  /* accent = laranja energético — CTAs de alta conversão */
  accent: {
    background: 'var(--pp-orange)',
    color: '#fff',
  },
  /* orange mantido como alias retrocompat */
  orange: {
    background: 'var(--pp-orange)',
    color: '#fff',
  },
  secondary: {
    background: 'var(--card)',
    color: 'var(--text-1)',
    border: '1px solid var(--border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-2)',
    border: '1px solid transparent',
  },
};

const sizes: Record<string, CSSProperties> = {
  sm: { padding: '8px 16px', fontSize: '13px', borderRadius: 'var(--radius-sm)', minHeight: '38px' },
  md: { padding: '11px 22px', fontSize: '14px' },
  lg: { padding: '14px 28px', fontSize: '15px', borderRadius: 'var(--radius-lg)', minHeight: '48px' },
};

const hoverMap: Record<string, Partial<CSSProperties>> = {
  primary:   { background: 'var(--pp-blue-dark)', boxShadow: 'var(--shadow-blue)' },
  accent:    { background: 'var(--pp-amber-dark)', boxShadow: 'var(--shadow-orange)' },
  orange:    { background: 'var(--pp-amber-dark)', boxShadow: 'var(--shadow-orange)' },
  secondary: { background: 'var(--surface-alt)',   borderColor: 'var(--border-hover)', boxShadow: 'none' },
  ghost:     { background: 'var(--surface-alt)',   boxShadow: 'none' },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, children, disabled, style, ...props }, ref) => {
    const [hovered, setHovered] = useState(false);

    return (
      <button
        ref={ref}
        disabled={disabled}
        style={{
          ...base,
          ...variants[variant],
          ...sizes[size],
          ...(hovered && !disabled ? hoverMap[variant] : {}),
          width: fullWidth ? '100%' : undefined,
          opacity: disabled ? 0.45 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          transform: hovered && !disabled ? 'translateY(-1px)' : 'translateY(0)',
          ...style,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
