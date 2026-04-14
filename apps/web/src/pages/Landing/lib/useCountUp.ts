import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number from 0 to `end` over `duration`ms
 * Restarts every time `trigger` goes from false → true
 */
export function useCountUp(end: number, duration = 1200, trigger = true) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!trigger) {
      cancelAnimationFrame(raf.current);
      setValue(0);
      return;
    }
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.round(eased * end));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [end, duration, trigger]);

  return value;
}
