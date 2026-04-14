import { useEffect } from 'react';

export function useScrollProgress() {
  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop || document.body.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      const progress = total > 0 ? scrolled / total : 0;
      const bar = document.getElementById('scroll-progress');
      if (bar) bar.style.transform = `scaleX(${progress})`;
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);
}
