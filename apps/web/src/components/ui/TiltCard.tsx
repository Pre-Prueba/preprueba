import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
}

/**
 * 3-D tilt card that follows the cursor.
 * Respects prefers-reduced-motion.
 */
export function TiltCard({ children, className, maxTilt = 7, scale = 1.02 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false });
  const prefersReduced = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;   // −0.5 … 0.5
    const ny = (e.clientY - rect.top)  / rect.height - 0.5;
    setTilt({ x: nx * maxTilt * 2, y: -ny * maxTilt * 2, active: true });
  };

  const reset = () => setTilt({ x: 0, y: 0, active: false });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      animate={{
        rotateX: tilt.y,
        rotateY: tilt.x,
        scale: tilt.active ? scale : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.4 }}
      style={{ transformStyle: 'preserve-3d' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
