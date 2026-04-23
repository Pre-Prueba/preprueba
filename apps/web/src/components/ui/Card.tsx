import { useState } from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

type CardVariant =
  | 'default'    // base: branco + shadow-sm
  | 'featured'   // borda superior 3px laranja — destaque/recomendações IA
  | 'premium';   // gradiente sutil warm + borda amber — ações pagas/planos

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  variant?: CardVariant;
}

const paddingMap: Record<string, string> = {
  sm: 'var(--space-4)',
  md: 'var(--space-6)',
  lg: 'var(--space-8)',
};

const variantBase: Record<CardVariant, CSSProperties> = {
  default: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-sm)',
  },
  featured: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderTop: '3px solid var(--pp-orange)',
    boxShadow: 'var(--shadow-sm)',
  },
  premium: {
    background: 'linear-gradient(135deg, var(--card) 60%, var(--orange-soft) 200%)',
    border: '1px solid rgba(255, 155, 41, 0.22)',
    boxShadow: 'var(--shadow-sm)',
  },
};

const variantHover: Record<CardVariant, CSSProperties> = {
  default: {
    boxShadow: 'var(--shadow-md)',
    borderColor: 'var(--border-hover)',
    transform: 'translateY(-2px)',
  },
  featured: {
    boxShadow: 'var(--shadow-md)',
    borderTopColor: 'var(--pp-orange)',
    borderColor: 'rgba(255, 102, 36, 0.2)',
    transform: 'translateY(-2px)',
  },
  premium: {
    boxShadow: 'var(--shadow-orange)',
    borderColor: 'rgba(255, 155, 41, 0.35)',
    transform: 'translateY(-2px)',
  },
};

export function Card({
  children,
  padding = 'md',
  hover = false,
  variant = 'default',
  style,
  ...props
}: CardProps) {
  const [hovered, setHovered] = useState(false);

  const appliedStyle: CSSProperties = {
    borderRadius: 'var(--radius-xl)',
    padding: paddingMap[padding],
    transition: 'box-shadow 220ms var(--ease), border-color 220ms var(--ease), transform 220ms var(--ease)',
    ...variantBase[variant],
    ...(hover && hovered ? variantHover[variant] : {}),
    ...style,
  };

  return (
    <div
      style={appliedStyle}
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      {...props}
    >
      {children}
    </div>
  );
}
