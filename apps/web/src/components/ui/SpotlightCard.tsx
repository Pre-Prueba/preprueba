import React, { useState } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  style?: React.CSSProperties;
}

/**
 * Card with a radial-gradient glow that follows the cursor.
 * No Tailwind — pure inline styles.
 */
export function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(255, 102, 36, 0.12)',
  style,
}: SpotlightCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const background = useMotionTemplate`radial-gradient(
    400px circle at ${mouseX}px ${mouseY}px,
    ${spotlightColor},
    transparent 80%
  )`;

  return (
    <div
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', ...style }}
    >
      {/* Spotlight layer */}
      <motion.div
        aria-hidden="true"
        style={{
          background,
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          borderRadius: 'inherit',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 300ms',
        }}
      />

      {/* Content sits above spotlight */}
      <div style={{ position: 'relative', zIndex: 2, height: '100%' }}>
        {children}
      </div>
    </div>
  );
}
