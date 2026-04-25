import { useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const paddingMap = {
  sm: 'var(--space-4)',
  md: 'var(--space-6)',
  lg: 'var(--space-8)',
};

export function Card({ children, padding = 'md', hover = false, style, ...props }: CardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        padding: paddingMap[padding],
        boxShadow: hovered && hover ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        border: `1px solid ${hovered && hover ? 'var(--blue-dim)' : 'var(--border)'}`,
        transition: 'box-shadow 0.22s var(--ease-out), border-color 0.22s var(--ease-out), transform 0.22s var(--ease-out)',
        transform: hovered && hover ? 'translateY(-2px)' : 'translateY(0)',
        ...style,
      }}
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      {...props}
    >
      {children}
    </div>
  );
}
