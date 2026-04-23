import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { SmoothScroll } from '../../components/layout/SmoothScroll';
import { NavBar } from './components/NavBar';
import { HeroSection } from './components/HeroSection';
import { StatsBand } from './components/StatsBand';
import { StepsSection } from './components/StepsSection';
import { ComparisonSection } from './components/ComparisonSection';
import { MateriasSection } from './components/MateriasSection';
import { DashboardPreviewSection } from './components/DashboardPreviewSection';
import { ManifestoSection } from './components/ManifestoSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { PricingSection } from './components/PricingSection';
import { FaqSection } from './components/FaqSection';
import { useScrollProgress } from './lib/useScrollProgress';
import { useSectionObserver } from './lib/useSectionObserver';
import styles from './Landing.module.css';

/* ── Easter egg: Konami code ─────────────────────────────────── */
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

function useKonami(cb: () => void) {
  useEffect(() => {
    let seq: string[] = [];
    const handler = (e: KeyboardEvent) => {
      seq = [...seq.slice(-(KONAMI.length - 1)), e.key];
      if (seq.join(',') === KONAMI.join(',')) cb();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cb]);
}

/* ── Custom cursor ───────────────────────────────────────────── */
function useCustomCursor() {
  useEffect(() => {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;
    let x = -20, y = -20, cx = -20, cy = -20;
    const move = (e: MouseEvent) => { x = e.clientX; y = e.clientY; };
    window.addEventListener('mousemove', move, { passive: true });
    let raf: number;
    const tick = () => {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      cursor.style.left = `${cx}px`;
      cursor.style.top = `${cy}px`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const addHover = () => cursor.classList.add('cursor-hovering');
    const removeHover = () => cursor.classList.remove('cursor-hovering');
    const targets = document.querySelectorAll('a, button, [role="button"], input, label');
    targets.forEach(el => {
      el.addEventListener('mouseenter', addHover);
      el.addEventListener('mouseleave', removeHover);
    });

    return () => {
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(raf);
      targets.forEach(el => {
        el.removeEventListener('mouseenter', addHover);
        el.removeEventListener('mouseleave', removeHover);
      });
    };
  }, []);
}

/* ── Cursor glow orb ─────────────────────────────────────────── */
function CursorGlow() {
  const rawX = useMotionValue(-400);
  const rawY = useMotionValue(-400);
  const springCfg = { stiffness: 55, damping: 18 };
  const x = useSpring(rawX, springCfg);
  const y = useSpring(rawY, springCfg);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX - 220);
      rawY.set(e.clientY - 220);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [rawX, rawY]);

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: 440, height: 440,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(240,140,26,0.07) 0%, transparent 68%)',
        x, y,
        pointerEvents: 'none',
        zIndex: 9997,
        willChange: 'transform',
      }}
    />
  );
}

/* ── Section IDs observed for nav ────────────────────────────── */
const NAV_SECTION_IDS = ['como-funciona', 'materias', 'precio'];

export function LandingPage() {
  const navigate = useNavigate();
  const goRegister = (priceId?: string) => {
    if (priceId) {
      localStorage.setItem('preprueba_selected_price_id', priceId);
      navigate(`/register?priceId=${encodeURIComponent(priceId)}`);
      return;
    }

    navigate('/register');
  };

  useScrollProgress();
  useCustomCursor();

  const activeSection = useSectionObserver(useMemo(() => NAV_SECTION_IDS, []));

  useKonami(() => {
    document.documentElement.classList.toggle('theme-konami');
  });

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('%c¿Curioso? Estamos contratando — hola@preprueba.es', 'color:#FF6624;font-size:16px;font-weight:bold;');
  }, []);

  return (
    <>
      {/* Scroll progress bar */}
      <div id="scroll-progress" aria-hidden="true" />

      {/* Custom cursor dot */}
      <div id="custom-cursor" aria-hidden="true" />

      {/* Cursor glow orb — follows mouse softly */}
      <CursorGlow />

      <SmoothScroll>
        <div className={styles.page}>
          <NavBar onCta={goRegister} activeSection={activeSection} />
          <HeroSection onCta={goRegister} />
          <StatsBand />
          <StepsSection />
          <ComparisonSection />
          <MateriasSection />
          <DashboardPreviewSection />
          <ManifestoSection />
          <TestimonialsSection />
          <PricingSection onCta={goRegister} />
          <FaqSection />

          {/* Footer */}
          <footer className={styles.footer}>
            <div className={styles.footerInner}>
              <div className={styles.footerBrand}>
                <img src="/1.svg" width={36} height={36} alt="" aria-hidden="true" className={styles.footerLogo} />
                <span className={styles.wordmark}>
                  <span className={styles.wordmarkPrep} style={{ color: '#fff' }}>prep</span>
                  <span className={styles.wordmarkRueba}>rueba</span>
                </span>
              </div>
              <p className={styles.footerSub}>Preparación universitaria · España</p>
              <div className={styles.footerLinks}>
                <a href="/legal/privacidad" className={styles.footerLink}>Privacidad</a>
                <a href="/legal/terminos" className={styles.footerLink}>Términos</a>
              </div>
              <p className={styles.footerCopy}>© 2026 Preprueba. Todos los derechos reservados.</p>
            </div>
          </footer>
        </div>
      </SmoothScroll>
    </>
  );
}

export default LandingPage;
