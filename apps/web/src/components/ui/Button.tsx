import { forwardRef, useState } from 'react';
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'orange';
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
  fontFamily: 'var(--font-ui)',
  fontWeight: 500,
  fontSize: '14px',
  lineHeight: 1,
  border: 'none',
  cursor: 'pointer',
  transition: 'background 0.18s, box-shadow 0.18s, transform 0.18s, opacity 0.18s',
  whiteSpace: 'nowrap',
  letterSpacing: '0.01em',
};

const variants: Record<string, CSSProperties> = {
  primary: {
    background: 'var(--blue)',
    color: '#fff',
  },
  orange: {
    background: 'var(--orange)',
    color: '#fff',
  },
  secondary: {
    background: 'var(--blue-soft)',
    color: 'var(--blue)',
    border: '1px solid var(--blue-dim)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-2)',
    border: '1px solid var(--border)',
  },
};

const sizes: Record<string, CSSProperties> = {
  sm: { padding: '8px 16px', fontSize: '13px', borderRadius: 'var(--radius-sm)' },
  md: { padding: '11px 22px', fontSize: '14px' },
  lg: { padding: '14px 28px', fontSize: '15px', borderRadius: 'var(--radius-lg)' },
};

const hoverMap: Record<string, Partial<CSSProperties>> = {
  primary: { background: 'var(--blue-mid)' },
  orange: { background: 'var(--orange-deep)' },
  secondary: { background: 'var(--blue-dim)' },
  ghost: { background: 'var(--surface)' },
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
          boxShadow: hovered && !disabled && (variant === 'primary' || variant === 'orange')
            ? 'var(--shadow-md)'
            : 'none',
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
