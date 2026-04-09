import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { materias as materiasApi, stats as statsApi } from '../../services/api';
import type { Materia, StatsResumen } from '../../types';
import s from './Dashboard.module.css';

/* ── Subject icon mapping ──────────────────────────────────────── */
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

/* ── Time-aware greeting ───────────────────────────────────────── */
function getGreeting(): { text: string; emoji: string } {
  const h = new Date().getHours();
  if (h < 6) return { text: 'Buenas noches', emoji: '🌙' };
  if (h < 12) return { text: 'Buenos días', emoji: '☀️' };
  if (h < 18) return { text: 'Buenas tardes', emoji: '🌤️' };
  return { text: 'Buenas noches', emoji: '🌙' };
}

/* ═══════════════════════════════════════════════════════════════════
   DASHBOARD PAGE
   ═══════════════════════════════════════════════════════════════════ */
export function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [materiasList, setMateriasList] = useState<Materia[]>([]);
  const [statsData, setStatsData] = useState<StatsResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navRef = useRef<HTMLElement>(null);

  /* fetch data */
  useEffect(() => {
    Promise.all([materiasApi.list(), statsApi.resumen()])
      .then(([m, s]) => {
        setMateriasList(m);
        setStatsData(s);
      })
      .catch(() => {
        // MOCK DATA para visualização sem API ligada
        setMateriasList([
          { id: '1', nombre: 'Lengua Castellana y Literatura', fase: 'GENERAL', descripcion: '', totalPreguntas: 100, miProgreso: { totalRespondidas: 45, porcentajeAcierto: 72, ultimaSesion: null } },
          { id: '2', nombre: 'Historia de España', fase: 'GENERAL', descripcion: '', totalPreguntas: 100, miProgreso: { totalRespondidas: 12, porcentajeAcierto: 65, ultimaSesion: null } },
          { id: '3', nombre: 'Inglés', fase: 'GENERAL', descripcion: '', totalPreguntas: 100, miProgreso: { totalRespondidas: 88, porcentajeAcierto: 91, ultimaSesion: null } },
          { id: '4', nombre: 'Biología', fase: 'ESPECIFICA', descripcion: '', totalPreguntas: 100, miProgreso: { totalRespondidas: 5, porcentajeAcierto: 40, ultimaSesion: null } },
          { id: '5', nombre: 'Química', fase: 'ESPECIFICA', descripcion: '', totalPreguntas: 100, miProgreso: { totalRespondidas: 20, porcentajeAcierto: 58, ultimaSesion: null } },
        ]);
        setStatsData({
          totalSesiones: 12,
          totalRespuestas: 145,
          porcentajeAcierto: 71,
          racha: 5,
          porMateria: []
        });
      })
      .finally(() => setLoading(false));
  }, []);

  /* sticky navbar shadow on scroll */
  useEffect(() => {
    const onScroll = () => {
      navRef.current?.classList.toggle(s.scrolled, window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const greeting = useMemo(() => getGreeting(), []);

  const handlePractice = useCallback(
    (materiaId: string) => navigate(`/practice/${materiaId}`),
    [navigate]
  );

  return (
    <div className={s.dashboardPage}>
      {/* ── Navbar ───────────────────────────────────────────── */}
      <nav ref={navRef} className={s.navbar}>
        <span className={s.navLogo}>Preprueba</span>
        <div className={s.navLinks}>
          <Link to="/stats" className={s.navLink}>
            Estadísticas
          </Link>
          <Link to="/settings" className={s.navLink}>
            Ajustes
          </Link>
          <button className={s.navLink} onClick={logout} type="button">
            Salir
          </button>
        </div>
      </nav>

      <main className={s.main}>
        {/* ── Header ───────────────────────────────────────── */}
        <div className={s.header}>
          <div className={s.headerText}>
            <h1>
              <span className={s.greetingEmoji}>{greeting.emoji}</span>{' '}
              {greeting.text}
              {user?.nombre ? `, ${user.nombre}` : ''}
            </h1>
            <p>Elige una materia y empieza tu sesión de práctica.</p>
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
        </div>

        {/* ── Stats bar ─────────────────────────────────────── */}
        {!loading && statsData && (
          <div className={s.statsBar}>
            <div className={s.statCard}>
              <p className={s.statValue}>{statsData.totalSesiones}</p>
              <p className={s.statLabel}>Sesiones</p>
            </div>
            <div className={s.statCard}>
              <p className={s.statValue}>{statsData.totalRespuestas}</p>
              <p className={s.statLabel}>Respuestas</p>
            </div>
            <div className={s.statCard}>
              <p className={s.statValue}>{statsData.porcentajeAcierto}%</p>
              <p className={s.statLabel}>Acierto global</p>
            </div>
          </div>
        )}

        {/* ── Loading skeleton ──────────────────────────────── */}
        {loading && <LoadingSkeleton />}

        {/* ── Error ─────────────────────────────────────────── */}
        {error && (
          <div className={s.errorBanner}>
            <span>⚠️</span>
            {error}
          </div>
        )}

        {/* ── Materia grid ──────────────────────────────────── */}
        {!loading && materiasList.length > 0 && (
          <>
            <p className={s.sectionTitle}>Tus materias</p>
            <div className={s.materiaGrid}>
              {materiasList.map((materia) => (
                <MateriaCard
                  key={materia.id}
                  materia={materia}
                  onClick={() => handlePractice(materia.id)}
                />
              ))}
            </div>
          </>
        )}

        {/* ── Empty state ───────────────────────────────────── */}
        {!loading && materiasList.length === 0 && !error && (
          <div className={s.emptyState}>
            <div className={s.emptyIcon}>🎓</div>
            <p className={s.emptyTitle}>Todavía no hay materias</p>
            <p className={s.emptyText}>
              Parece que aún no se han cargado tus materias. Si acabas de
              registrarte, inténtalo de nuevo en unos minutos.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MATERIA CARD — Inline subcomponent
   ═══════════════════════════════════════════════════════════════════ */
function MateriaCard({
  materia,
  onClick,
}: {
  materia: Materia;
  onClick: () => void;
}) {
  const isGeneral = materia.fase === 'GENERAL';
  const icon = getSubjectIcon(materia.nombre);

  // Explicit mapping avoids s[variant] dynamic indexing (TS strict safety)
  const cardVariantClass = isGeneral ? s.general : s.especifica;
  const badgeVariantClass = isGeneral ? s.general : s.especifica;
  const iconVariantClass = isGeneral ? s.general : s.especifica;

  return (
    <div
      className={`${s.materiaCard} ${cardVariantClass}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Card header */}
      <div className={s.cardHeader}>
        <span className={`${s.cardBadge} ${badgeVariantClass}`}>
          {materia.fase}
        </span>
        <div className={`${s.cardIcon} ${iconVariantClass}`}>{icon}</div>
      </div>

      {/* Subject name */}
      <p className={s.materiaName}>{materia.nombre}</p>

      {/* Progress */}
      <div className={s.progressSection}>
        <div className={s.progressMeta}>
          <span className={s.count}>
            {materia.miProgreso.totalRespondidas} respondidas
          </span>
          <span className={s.percent}>
            {materia.miProgreso.porcentajeAcierto}%
          </span>
        </div>
        <div className={s.progressTrack}>
          <div
            className={s.progressFill}
            style={{ width: `${materia.miProgreso.porcentajeAcierto}%` }}
          />
        </div>
      </div>

      {/* CTA */}
      <button className={s.cardAction} type="button">
        Practicar <span className={s.cardActionArrow}>→</span>
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   LOADING SKELETON
   ═══════════════════════════════════════════════════════════════════ */
function LoadingSkeleton() {
  return (
    <>
      {/* Stats skeleton */}
      <div className={s.statsBar}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={`${s.skeleton} ${s.skeletonStats}`} />
        ))}
      </div>
      {/* Cards skeleton */}
      <div className={s.materiaGrid}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={`${s.skeleton} ${s.skeletonCard}`} />
        ))}
      </div>
    </>
  );
}
