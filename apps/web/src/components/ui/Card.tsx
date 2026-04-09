import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'sm' | 'md' | 'lg';
}

const paddingMap = {
  sm: 'var(--space-4)',
  md: 'var(--space-6)',
  lg: 'var(--space-8)',
};

export function Card({ children, padding = 'md', style, ...props }: CardProps) {
  return (
    <div
      style={{
        background: 'var(--color-white)',
        borderRadius: 'var(--radius-lg)',
        padding: paddingMap[padding],
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--color-platinum)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
