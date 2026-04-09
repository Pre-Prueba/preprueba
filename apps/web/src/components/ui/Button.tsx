import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: ReactNode;
}

const styles: Record<string, React.CSSProperties> = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    borderRadius: 'var(--radius-md)',
    fontWeight: 600,
    fontSize: 'var(--text-base)',
    border: 'none',
    transition: 'opacity 0.15s, background 0.15s',
    cursor: 'pointer',
    lineHeight: 1,
  },
  primary: {
    background: 'var(--color-carrot)',
    color: 'var(--color-white)',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--color-persian-blue)',
    border: '2px solid var(--color-persian-blue)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text-muted)',
    border: 'none',
  },
  sm: { padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-sm)' },
  md: { padding: 'var(--space-3) var(--space-6)' },
  lg: { padding: 'var(--space-4) var(--space-8)', fontSize: 'var(--text-lg)' },
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      style={{
        ...styles.base,
        ...styles[variant],
        ...styles[size],
        width: fullWidth ? '100%' : undefined,
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.opacity = '0.88';
      }}
      onMouseLeave={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.opacity = '1';
      }}
      {...props}
    >
      {children}
    </button>
  );
}
