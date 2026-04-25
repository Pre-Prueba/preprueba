import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  Zap,
  RotateCcw,
  Timer,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Play,
  Clock,
  BookMarked,
  Shuffle,
} from 'lucide-react';
import { useMaterias } from '../../hooks/useMaterias';
import { useStats } from '../../hooks/useStats';
import s from './Practice.module.css';

/* ── Subject emoji map ── */
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
function getSubjectIcon(nombre: string) {
  return SUBJECT_ICONS[nombre] ?? '📚';
}

/* ── Types ── */
type ModeKey = 'rapida' | 'errores' | 'simulacro' | 'examenes';

interface Config {
  materiaId: string;
  tipo: 'MIXTO' | 'TEST' | 'ABIERTA';
  cantidad: number;
  modo: 'study' | 'exam';
  timer: boolean;
  duracionSegundos: number | null;
  soloNoRespondidas: boolean;
}

type PresetItem =
  | { label: string; icon: LucideIcon; config: Omit<Config, 'materiaId'>; navigate?: never }
  | { label: string; icon: LucideIcon; navigate: string; config?: never };

/* ── Constants ── */
const MODES: { key: ModeKey; icon: LucideIcon; label: string; desc: string }[] = [
  { key: 'rapida',    icon: Zap,       label: 'Práctica rápida',    desc: 'Repaso veloz de todas tus materias'   },
  { key: 'errores',   icon: RotateCcw, label: 'Repasar errores',    desc: 'Convierte los fallos en conocimiento' },
  { key: 'simulacro', icon: Timer,     label: 'Simulacro real',     desc: 'Cronómetro y condiciones de examen'  },
  { key: 'examenes',  icon: BookOpen,  label: 'Exámenes oficiales', desc: 'Pruebas reales de años anteriores'   },
];

const CANTIDAD_OPTIONS = [5, 10, 15, 20, 25] as const;

const PRESETS: PresetItem[] = [
  { label: '10 preguntas rápidas', icon: Zap,        config: { tipo: 'MIXTO', cantidad: 10, modo: 'study', timer: false, duracionSegundos: null, soloNoRespondidas: false } },
  { label: 'Sin responder',        icon: BookMarked, config: { tipo: 'TEST',  cantidad: 15, modo: 'study', timer: false, duracionSegundos: null, soloNoRespondidas: true  } },
  { label: 'Práctica mixta',       icon: Shuffle,    config: { tipo: 'MIXTO', cantidad: 20, modo: 'study', timer: false, duracionSegundos: null, soloNoRespondidas: false } },
  { label: 'Sesión de 15 min',     icon: Clock,      config: { tipo: 'TEST',  cantidad: 10, modo: 'exam',  timer: true,  duracionSegundos: 15 * 60, soloNoRespondidas: false } },
  { label: 'Repasar errores',      icon: RotateCcw,  navigate: '/errores'  },
  { label: 'Exámenes',             icon: BookOpen,   navigate: '/examenes' },
];

const DEFAULT_CONFIG: Config = {
  materiaId: '',
  tipo: 'MIXTO',
  cantidad: 10,
  modo: 'study',
  timer: false,
  duracionSegundos: null,
  soloNoRespondidas: false,
};

const ALL_MATERIAS_ID = 'all';

/* ════════════════════════════════════════════
   PracticeHomePage — Session Builder Hub
   ════════════════════════════════════════════ */
export function PracticeHomePage() {
  const navigate = useNavigate();
  const { data: materiasList = [], isLoading: loadingMaterias } = useMaterias();
  const { data: statsData } = useStats();

  const configRef = useRef<HTMLElement>(null);

  const [activeMode,       setActiveMode]       = useState<ModeKey | null>(null);
  const [config,           setConfig]           = useState<Config>(DEFAULT_CONFIG);
  const [starting,         setStarting]         = useState(false);
  const [showAllMaterias,  setShowAllMaterias]  = useState(false);

  /* Only block on materias — stats query may be disabled (no subscription) */
  const loading = loadingMaterias;

  useEffect(() => {
    document.title = 'Practicar | Preprueba';
  }, []);

  /* helpers */
  const getAcierto = (materiaId: string) => {
    // First try per-materia progress embedded in the materia object itself
    const materia = materiasList.find(m => m.id === materiaId);
    if (materia && materia.miProgreso.totalRespondidas > 0) {
      return materia.miProgreso.porcentajeAcierto;
    }
    // Fallback to stats resumen (subscription-gated)
    return statsData?.porMateria?.find(x => x.materiaId === materiaId)?.porcentajeAcierto ?? null;
  };

  const scrollToConfig = () =>
    setTimeout(() => configRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);

  /* mode card click */
  function handleModeSelect(mode: ModeKey) {
    if (mode === 'errores')  { navigate('/errores');   return; }
    if (mode === 'examenes') { navigate('/examenes'); return; }

    setActiveMode(mode);
    if (mode === 'rapida') {
      setConfig(c => ({
        ...c,
        tipo: 'MIXTO',
        cantidad: 10,
        modo: 'study',
        timer: false,
        duracionSegundos: null,
        soloNoRespondidas: false,
      }));
    } else if (mode === 'simulacro') {
      setConfig(c => ({
        ...c,
        tipo: 'MIXTO',
        cantidad: 25,
        modo: 'exam',
        timer: true,
        duracionSegundos: 45 * 60,
        soloNoRespondidas: false,
      }));
    }
    scrollToConfig();
  }

  /* preset chip click */
  function handlePreset(preset: PresetItem) {
    if (preset.navigate) { navigate(preset.navigate); return; }
    setConfig(c => ({ ...c, ...preset.config }));
    setActiveMode(null);
    scrollToConfig();
  }

  /* subject card click — toggles materia selection in config */
  function handleMateriaSelect(materiaId: string) {
    setConfig(c => ({ ...c, materiaId: c.materiaId === materiaId ? '' : materiaId }));
    scrollToConfig();
  }

  /* start session */
  function handleStartSession() {
    const targetId = config.materiaId || ALL_MATERIAS_ID;
    setStarting(true);
    const params = new URLSearchParams();
    if (config.tipo !== 'MIXTO') params.set('tipo', config.tipo);
    params.set('totalPreguntas', String(config.cantidad));
    if (config.modo === 'exam') params.set('examMode', 'true');
    if (config.timer) params.set('timer', 'true');
    if (config.duracionSegundos) params.set('duracion', String(config.duracionSegundos));
    if (config.soloNoRespondidas) params.set('soloNoRespondidas', 'true');
    navigate(`/practice/${targetId}/session?${params.toString()}`);
  }

  const selectedMateria   = materiasList.find(m => m.id === config.materiaId);
  const displayedMaterias = showAllMaterias ? materiasList : materiasList.slice(0, 6);
  const dominadas         = materiasList.filter(m => m.miProgreso.porcentajeAcierto > 80).length;

  // Estimated time
  const avgTimePerQuestion = config.materiaId
    ? (statsData?.porMateria.find(m => m.materiaId === config.materiaId)?.avgTime ?? statsData?.globalAvgTime ?? 45)
    : (statsData?.globalAvgTime ?? 45);
  const estimatedMinutes = Math.max(1, Math.round((config.cantidad * avgTimePerQuestion) / 60));

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className={s.practiceHome}>
        <div className={s.skeletonHeader} />
        <div className={s.skeletonModes}>
          {[1, 2, 3, 4].map(i => <div key={i} className={s.skeletonItem} />)}
        </div>
        <div className={s.skeletonCard} />
        <div className={s.skeletonModes}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className={`${s.skeletonItem} ${s.skeletonChip}`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={s.practiceHome}>

      {/* ════ 1. HEADER ════ */}
      <header className={s.header}>
        <div className={s.headerLeft}>
          <h1 className={s.title}>Practicar</h1>
          <p className={s.subtitle}>Configura tu sesión y entrena con precisión.</p>
        </div>

        <div className={s.statsChips} role="region" aria-label="Estadísticas rápidas">
          <div className={s.statChip}>
            <span className={s.statVal}>{statsData?.totalRespuestas ?? 0}</span>
            <span className={s.statLab}>Pruebas</span>
          </div>
          <div className={s.statDivider} aria-hidden="true" />
          <div className={s.statChip}>
            <span className={s.statVal}>{statsData?.porcentajeAcierto ?? 0}%</span>
            <span className={s.statLab}>Acierto</span>
          </div>
          <div className={s.statDivider} aria-hidden="true" />
          <div className={s.statChip}>
            <span className={s.statVal}>{dominadas}</span>
            <span className={s.statLab}>Dominadas</span>
          </div>
        </div>
      </header>

      {/* ════ 2. MODE CARDS ════ */}
      <section aria-label="Modo de práctica" className={s.modesSection}>
        <div className={s.modesGrid}>
          {MODES.map(mode => {
            const Icon     = mode.icon;
            const isActive = activeMode === mode.key;
            return (
              <motion.button
                key={mode.key}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`${s.modeCard} ${isActive ? s.modeCardActive : ''}`}
                onClick={() => handleModeSelect(mode.key)}
                aria-pressed={isActive}
              >
                {isActive && <div className={s.modeActiveBar} aria-hidden="true" />}
                <div className={`${s.modeIcon} ${isActive ? s.modeIconActive : ''}`}>
                  <Icon size={18} aria-hidden="true" />
                </div>
                <div className={s.modeText}>
                  <span className={s.modeLabel}>{mode.label}</span>
                  <span className={s.modeDesc}>{mode.desc}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* ════ 3. CONFIG BUILDER ════ */}
      <section ref={configRef} aria-label="Configurar práctica" className={s.configCard}>
        <div className={s.configHeader}>
          <h2 className={s.configTitle}>Configurar práctica</h2>
          <span className={s.configBadge} aria-live="polite">
            {selectedMateria ? selectedMateria.nombre : 'Todas las materias'}
          </span>
        </div>

        {/* Row 1: Materia + Tipo */}
        <div className={s.configRow}>
          <div className={s.configGroup}>
            <label className={s.configLabel} htmlFor="select-materia">Materia</label>
            <select
              id="select-materia"
              className={s.configSelect}
              value={config.materiaId}
              onChange={e => setConfig(c => ({ ...c, materiaId: e.target.value }))}
            >
              <option value="">Todas las materias</option>
              {materiasList.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>

          <div className={s.configGroup}>
            <span className={s.configLabel} id="tipo-label">Tipo de pregunta</span>
            <div className={s.segmentedControl} role="group" aria-labelledby="tipo-label">
              {(['MIXTO', 'TEST', 'ABIERTA'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  className={`${s.segmentBtn} ${config.tipo === t ? s.segmentActive : ''}`}
                  onClick={() => setConfig(c => ({ ...c, tipo: t }))}
                  aria-pressed={config.tipo === t}
                >
                  {t === 'MIXTO' ? 'Mixto' : t === 'TEST' ? 'Test' : 'Abierta'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Cantidad + Modo */}
        <div className={s.configRow}>
          <div className={s.configGroup}>
            <span className={s.configLabel} id="cantidad-label">Cantidad de preguntas</span>
            <div className={s.pillRow} role="group" aria-labelledby="cantidad-label">
              {CANTIDAD_OPTIONS.map(n => (
                <button
                  key={n}
                  type="button"
                  className={`${s.pillBtn} ${config.cantidad === n ? s.pillActive : ''}`}
                  onClick={() => setConfig(c => ({ ...c, cantidad: n }))}
                  aria-pressed={config.cantidad === n}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className={s.configGroup}>
            <span className={s.configLabel} id="modo-label">Modo de sesión</span>
            <div className={s.segmentedControl} role="group" aria-labelledby="modo-label">
              <button
                type="button"
                className={`${s.segmentBtn} ${config.modo === 'study' ? s.segmentActive : ''}`}
                onClick={() => setConfig(c => ({ ...c, modo: 'study' }))}
                aria-pressed={config.modo === 'study'}
              >
                Study
              </button>
              <button
                type="button"
                className={`${s.segmentBtn} ${config.modo === 'exam' ? s.segmentActive : ''}`}
                onClick={() => setConfig(c => ({ ...c, modo: 'exam' }))}
                aria-pressed={config.modo === 'exam'}
              >
                Examen
              </button>
            </div>
          </div>
        </div>

        {/* Row 3: Timer + CTA */}
        <div className={s.configFooter}>
          <div className={s.timerLabel}>
            <button
              type="button"
              role="switch"
              aria-checked={config.timer}
              aria-label="Activar temporizador"
              className={`${s.toggleSwitch} ${config.timer ? s.toggleOn : ''}`}
              onClick={() => setConfig(c => ({ ...c, timer: !c.timer }))}
            >
              <span className={s.toggleThumb} />
            </button>
            <span>Temporizador</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
              ~{estimatedMinutes} min estimados
            </span>
            <motion.button
              whileTap={{ scale: 0.97 }}
              className={s.ctaBtn}
              onClick={handleStartSession}
              disabled={starting || materiasList.length === 0}
              aria-busy={starting}
            >
              {starting ? (
                <span className={s.ctaSpinner} aria-hidden="true" />
              ) : (
                <>
                  <Play size={15} aria-hidden="true" />
                  Comenzar práctica
                </>
              )}
            </motion.button>
          </div>
        </div>
      </section>

      {/* ════ 4. QUICK PRESETS ════ */}
      <section aria-label="Sesiones rápidas" className={s.presetsSection}>
        <h3 className={s.sectionLabel}>Sesiones rápidas</h3>
        <div className={s.presetsRow}>
          {PRESETS.map((preset, i) => {
            const Icon = preset.icon;
            return (
              <motion.button
                key={preset.label}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                className={s.presetChip}
                onClick={() => handlePreset(preset)}
              >
                <Icon size={13} aria-hidden="true" />
                {preset.label}
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* ════ 5. EXPLORAR POR MATERIA ════ */}
      <section aria-label="Explorar por materia" className={s.materiasSection}>
        <div className={s.sectionHeader}>
          <h3 className={s.sectionLabel}>Explorar por materia</h3>
          {!showAllMaterias && materiasList.length > 6 && (
            <button className={s.showMoreBtn} onClick={() => setShowAllMaterias(true)}>
              Ver todas ({materiasList.length}) <ChevronDown size={14} aria-hidden="true" />
            </button>
          )}
        </div>

        <motion.div className={s.materiasGrid} layout>
          <AnimatePresence initial={false}>
            {displayedMaterias.map((materia, i) => {
              const acierto    = getAcierto(materia.id);
              const isSelected = config.materiaId === materia.id;
              const isGeneral  = materia.fase === 'GENERAL';

              return (
                <motion.button
                  key={materia.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: i * 0.035, duration: 0.2 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`${s.materiaCard} ${isSelected ? s.materiaCardSelected : ''}`}
                  onClick={() => handleMateriaSelect(materia.id)}
                  aria-pressed={isSelected}
                  aria-label={`${materia.nombre}, ${acierto !== null ? `${acierto}% de acierto` : 'sin datos'}`}
                >
                  <div className={s.materiaTop}>
                    <span className={s.materiaEmoji} aria-hidden="true">
                      {getSubjectIcon(materia.nombre)}
                    </span>
                    <span className={`${s.materiaBadge} ${isGeneral ? s.badgeGeneral : s.badgeEspecifica}`}>
                      {isGeneral ? 'General' : 'Específica'}
                    </span>
                  </div>

                  <span className={s.materiaName}>{materia.nombre}</span>

                  <div className={s.materiaProgress}>
                    <div className={s.progressTrack} aria-hidden="true">
                      <motion.div
                        className={s.progressFill}
                        initial={{ width: 0 }}
                        animate={{ width: acierto !== null ? `${acierto}%` : '0%' }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.05 }}
                      />
                    </div>
                    <span className={s.progressLabel}>
                      {acierto !== null ? `${acierto}%` : '—'}
                    </span>
                  </div>

                  {isSelected && (
                    <div className={s.selectedMark} aria-hidden="true">
                      <ChevronRight size={12} />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {showAllMaterias && (
          <button
            className={`${s.showMoreBtn} ${s.showLessBtn}`}
            onClick={() => setShowAllMaterias(false)}
          >
            Ver menos{' '}
            <ChevronDown size={14} style={{ transform: 'rotate(180deg)' }} aria-hidden="true" />
          </button>
        )}
      </section>

      {/* ════ 6. EXÁMENES OFICIALES ════ */}
      <section aria-label="Exámenes oficiales" className={s.examenesBlock}>
        <div className={s.examenesInfo}>
          <div className={s.examenesIconWrap} aria-hidden="true">
            <BookOpen size={20} />
          </div>
          <div>
            <h3 className={s.examenesTitle}>Exámenes oficiales</h3>
            <p className={s.examenesDesc}>
              Practica con pruebas reales filtradas por universidad, comunidad y año.
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.97 }}
          className={s.examenesBtn}
          onClick={() => navigate('/examenes')}
        >
          Ver exámenes <ChevronRight size={15} aria-hidden="true" />
        </motion.button>
      </section>

    </div>
  );
}
