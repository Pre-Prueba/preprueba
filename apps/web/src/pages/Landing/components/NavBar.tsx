import { useEffect, useState } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import styles from '../Landing.module.css';
import { MagneticButton } from '../../../components/ui/MagneticButton';

interface NavBarProps {
  onCta: () => void;
  activeSection?: string;
}

const NAV_LINKS = [
  { label: 'Cómo funciona', href: '#como-funciona', id: 'como-funciona' },
  { label: 'Materias',      href: '#materias',      id: 'materias'      },
  { label: 'Precio',        href: '#precio',         id: 'precio'        },
];

export function NavBar({ onCta, activeSection = '' }: NavBarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 26, mass: 0.8 }}
    >
      <div className={styles.navInner}>
        {/* Brand */}
        <motion.a
          href="/"
          className={styles.brand}
          aria-label="Preprueba inicio"
          whileHover={{ scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <img src="/1.svg" width={40} height={40} alt="" aria-hidden="true" className={styles.brandLogo} />
          <span className={styles.wordmark}>
            <span className={styles.wordmarkPrep}>prep</span>
            <span className={styles.wordmarkRueba}>rueba</span>
          </span>
        </motion.a>

        {/* Links — layoutId sliding underline */}
        <LayoutGroup>
          <nav className={styles.navLinks} aria-label="Navegación principal">
            {NAV_LINKS.map(({ label, href, id }, i) => {
              const isActive = activeSection === id;
              return (
                <motion.a
                  key={label}
                  href={href}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: 'spring', stiffness: 300, damping: 24,
                    delay: 0.2 + i * 0.07,
                  }}
                  whileHover={{ y: -2 }}
                >
                  {label}
                  {/* Sliding active underline — shared layoutId */}
                  {isActive && (
                    <motion.span
                      className={styles.navActiveBar}
                      layoutId="nav-active-bar"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </motion.a>
              );
            })}
          </nav>
        </LayoutGroup>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.45 }}
        >
          <MagneticButton className={styles.navCta} onClick={onCta} aria-label="Empezar gratis">
            <span className={styles.navCtaShimmer} aria-hidden="true" />
            Empezar gratis
          </MagneticButton>
        </motion.div>
      </div>
    </motion.nav>
  );
}
