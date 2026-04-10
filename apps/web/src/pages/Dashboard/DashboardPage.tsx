import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart2, Settings, ShieldCheck, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { materias as materiasApi, stats as statsApi } from '../../services/api';
import type { Materia, StatsResumen } from '../../types';
import { toast } from 'sonner';
import { staggerContainer, fadeUp, listItem } from '../../lib/animations';
import s from './Dashboard.module.css';

/* ── Icon mapping */
const SUBJECT_ICONS: Record<string, string> = {
  'Lengua Castellana y Literatura': '📖',
  'Historia de España': '🏰',
  'Inglés': '🇬🇧',
  'Biología': '🧬',
  'Química': '⚗️',
  'Matemáticas Aplicadas a las CCSS': '📊',
  'Geografía': '🌍',
  'Historia de la Filosofía': '🏛️',
  'Historia del Arte': '🎨',
  'Matemáticas': '📐',
  'Física': '⚡',
};

function getSubjectIcon(nombre: string): string {
  return SUBJECT_ICONS[nombre] ?? '📚';
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return 'Buenas noches';
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

/* ── Streak week dots (L·M·X·J·V·S·D) */
function StreakWeek({ racha }: { racha: number }) {
  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const todayIdx = (new Date().getDay() + 6) % 7; // 0=Mon

  return (
    <div className={s.streakWeek}>
      {days.map((d, i) => {
        const isDone = i < todayIdx && racha >= (todayIdx - i);
        const isToday = i === todayIdx;
        return (
          <motion.div
            key={d}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.04, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            className={`${s.weekDay} ${isDone ? s.done : ''} ${isToday ? s.today : ''}`}
          >
            {d}
          </motion.div>
        );
      })}
      {racha > 0 && (
        <span className={s.streakMotivation}>
          Hoy ya avanzaste. <strong>Sigue así.</strong>
        </span>
      )}
    </div>
  );
}

function isSubscriptionRequiredError(error: unknown): boolean {
  return error instanceof Error && error.message === 'SUBSCRIPTION_REQUIRED';
}

/* ═══════════════════════════════════════════════════════════════════
   DASHBOARD PAGE
   ═══════════════════════════════════════════════════════════════════ */
export function DashboardPage() {
  const navigate = useNavigate();
  const { user, subscription, logout } = useAuthStore();
  const [materiasList, setMateriasList] = useState<Materia[]>([]);
  const [statsData, setStatsData] = useState<StatsResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shakingCard, setShakingCard] = useState<string | null>(null);
  const [subscriptionLocked, setSubscriptionLocked] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const isAdmin = user?.role === 'ADMIN';
  const hasSubscription = isAdmin || (subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING');

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!hasSubscription) {
        if (!active) return;
        setMateriasList([]); setStatsData(null);
        setSubscriptionLocked(true); setError(''); setLoading(false);
        return;
      }
      setLoading(true); setError(''); setSubscriptionLocked(false);

      const [mr, sr] = await Promise.allSettled([materiasApi.list(), statsApi.resumen()]);
      if (!active) return;

      const failures = [mr, sr].filter((r): r is PromiseRejectedResult => r.status === 'rejected');
      if (failures.some((f) => isSubscriptionRequiredError(f.reason))) {
        setMateriasList([]); setStatsData(null);
        setSubscriptionLocked(true); setError(''); setLoading(false);
        return;
      }

      setSubscriptionLocked(false);
      setMateriasList(mr.status === 'fulfilled' ? mr.value : []);
      setStatsData(sr.status === 'fulfilled' ? sr.value : null);
      if (failures.length > 0) setError('No hemos podido cargar tu panel ahora mismo.');
      setLoading(false);
    };
    void load();
    return () => { active = false; };
  }, [hasSubscription]);

  useEffect(() => {
    const onScroll = () => navRef.current?.classList.toggle(s.scrolled, window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const greeting = useMemo(() => getGreeting(), []);
  const showLockedState = !loading && subscriptionLocked;
  const showFirstPracticeState = !loading && !subscriptionLocked && statsData?.totalSesiones === 0;

  const handlePractice = useCallback((materiaId: string) => {
    if (!hasSubscription || subscriptionLocked) {
      setShakingCard(materiaId);
      setTimeout(() => setShakingCard(null), 500);
      toast('Necesitas una suscripción', {
        icon: '🔒',
        description: 'Activa tu acceso para empezar a practicar.',
        duration: 4000,
        action: { label: 'Activar', onClick: () => navigate('/checkout') },
      });
      return;
    }
    navigate(`/practice/${materiaId}`);
  }, [hasSubscription, navigate, subscriptionLocked]);

  return (
    <div className={s.dashboardPage}>
      {/* ── Navbar */}
      <nav ref={navRef} className={s.navbar}>
        <span className={s.navLogo}>
          prep<span>prueba</span>
        </span>
        <div className={s.navLinks}>
          <Link to="/stats" className={s.navLink} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BarChart2 size={15} /> Estadísticas
          </Link>
          <Link to="/settings" className={s.navLink} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Settings size={15} /> Ajustes
          </Link>
          {isAdmin && (
            <Link to="/admin" className={s.navLink} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={15} /> Admin
            </Link>
          )}
          <button
            className={s.navLink}
            onClick={() => { logout(); navigate('/'); }}
            type="button"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <LogOut size={15} /> Salir
          </button>
        </div>
      </nav>

      <main className={s.main}>
        <motion.div variants={staggerContainer} initial="hidden" animate="show">

          {/* ── Greeting */}
          <motion.div variants={fadeUp} className={s.header}>
            <div className={s.headerText}>
              <h1>
                {greeting}{user?.nombre ? `, ${user.nombre}` : ''}.
              </h1>
              <p>¿Qué practicamos hoy?</p>
            </div>
            {statsData && statsData.racha > 0 && (
              <div className={s.streakWidget}>
                <span className={s.streakFire}>🔥</span>
                <div>
                  <p className={s.streakNumber}>{statsData.racha}</p>
                  <p className={s.streakLabel}>días seguidos</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* ── Streak week */}
          {!loading && statsData && statsData.racha >= 0 && (
            <motion.div variants={fadeUp}>
              <StreakWeek racha={statsData.racha} />
            </motion.div>
          )}

          {/* ── Stats */}
          {!loading && statsData && (
            <motion.div variants={staggerContainer} className={s.statsBar}>
              {[
                { value: statsData.totalSesiones, label: 'Sesiones' },
                { value: statsData.totalRespuestas, label: 'Respuestas' },
                { value: `${statsData.porcentajeAcierto}%`, label: 'Acierto global' },
              ].map((stat) => (
                <motion.div key={stat.label} variants={listItem} className={s.statCard}>
                  <p className={s.statValue}>{stat.value}</p>
                  <p className={s.statLabel}>{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ── Subscription banner */}
          {showLockedState && (
            <motion.div variants={fadeUp} className={s.subscriptionBanner}>
              <span className={s.subscriptionBannerIcon}>📅</span>
              <div className={s.subscriptionBannerText}>
                <p className={s.subscriptionBannerTitle}>7 días gratis. Sin permanencia. Sin excusas para esperar.</p>
                <p className={s.subscriptionBannerDesc}>Activa tu acceso para desbloquear todas las materias y la corrección por IA.</p>
              </div>
              <button className={s.subscriptionBannerBtn} onClick={() => navigate('/checkout')} type="button">
                Activar acceso →
              </button>
            </motion.div>
          )}

          {/* ── Loading */}
          {loading && <LoadingSkeleton />}

          {/* ── Error */}
          {error && (
            <motion.div variants={fadeUp} className={s.errorBanner}>
              <span>⚠️</span> {error}
            </motion.div>
          )}

          {/* ── Empty (locked) */}
          {showLockedState && !error && (
            <motion.div variants={fadeUp} className={s.emptyState}>
              <div className={s.emptyIcon}>📖</div>
              <p className={s.emptyTitle}>Tu progreso empieza aquí.</p>
              <p className={s.emptyText}>La primera pregunta te está esperando. Activa tu acceso y empieza hoy.</p>
              <button className={s.subscriptionBannerBtn} onClick={() => navigate('/checkout')} type="button" style={{ marginTop: '20px' }}>
                Activar acceso →
              </button>
            </motion.div>
          )}

          {/* ── Empty (no sessions) */}
          {showFirstPracticeState && (
            <motion.div variants={fadeUp} className={s.emptyState}>
              <div className={s.emptyIcon}>✨</div>
              <p className={s.emptyTitle}>Tu progreso empieza con la primera pregunta.</p>
              <p className={s.emptyText}>Elige una materia de abajo y empieza. Vamos paso a paso.</p>
            </motion.div>
          )}

          {/* ── Materia grid */}
          {!loading && !subscriptionLocked && materiasList.length > 0 && (
            <>
              <motion.p variants={fadeUp} className={s.sectionTitle}>
                {showFirstPracticeState ? 'Elige una materia' : 'Tus materias'}
              </motion.p>
              <motion.div variants={staggerContainer} className={s.materiaGrid}>
                {materiasList.map((materia) => (
                  <motion.div key={materia.id} variants={listItem}>
                    <MateriaCard
                      materia={materia}
                      isShaking={shakingCard === materia.id}
                      onClick={() => handlePractice(materia.id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}

          {/* ── Empty (no materias) */}
          {!loading && !subscriptionLocked && materiasList.length === 0 && !error && (
            <motion.div variants={fadeUp} className={s.emptyState}>
              <div className={s.emptyIcon}>🎓</div>
              <p className={s.emptyTitle}>Todavía no hay materias</p>
              <p className={s.emptyText}>Si acabas de registrarte, inténtalo de nuevo en unos minutos.</p>
            </motion.div>
          )}

        </motion.div>
      </main>
    </div>
  );
}

/* ── MateriaCard */
function MateriaCard({ materia, isShaking, onClick }: { materia: Materia; isShaking?: boolean; onClick: () => void }) {
  const isGeneral = materia.fase === 'GENERAL';
  const icon = getSubjectIcon(materia.nombre);
  const cardVariantClass = isGeneral ? s.general : s.especifica;

  return (
    <div
      data-testid="materia-card"
      className={`${s.materiaCard} ${cardVariantClass}${isShaking ? ` ${s.cardShake}` : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
    >
      <div className={s.cardHeader}>
        <span className={`${s.cardBadge} ${cardVariantClass}`}>{materia.fase}</span>
        <div className={`${s.cardIcon} ${cardVariantClass}`}>{icon}</div>
      </div>

      <p className={s.materiaName}>{materia.nombre}</p>

      <div className={s.progressSection}>
        <div className={s.progressMeta}>
          <span className={s.count}>{materia.miProgreso.totalRespondidas} respondidas</span>
          <span className={s.percent}>{materia.miProgreso.porcentajeAcierto}%</span>
        </div>
        <div className={s.progressTrack}>
          <div className={s.progressFill} style={{ width: `${materia.miProgreso.porcentajeAcierto}%` }} />
        </div>
      </div>

      <button className={s.cardAction} data-testid="practice-button" type="button">
        Practicar <span className={s.cardActionArrow}>→</span>
      </button>
    </div>
  );
}

/* ── LoadingSkeleton */
function LoadingSkeleton() {
  return (
    <>
      <div className={s.statsBar}>
        {[1, 2, 3].map((i) => <div key={i} className={`${s.skeleton} ${s.skeletonStats}`} />)}
      </div>
      <div className={s.materiaGrid}>
        {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className={`${s.skeleton} ${s.skeletonCard}`} />)}
      </div>
    </>
  );
}
