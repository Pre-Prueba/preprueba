import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Sparkles,
  RefreshCcw,
  Calendar,
  Target,
  Play,
  Plus,
  Trash2,
  X,
  MoreVertical,
  Flame,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Zap,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { usePlanner, useToggleTask, useSuggestPlan, useSyncPlanner } from '../../hooks/usePlanner';
import { useMaterias } from '../../hooks/useMaterias';
import { staggerContainer, listItem } from '../../lib/animations';
import { useAuthStore } from '../../store/auth';
import s from './Planner.module.css';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DAYS_FULL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const SUBJECT_COLORS: Record<string, string> = {
  'Matemáticas': '#355CF5',
  'Matemáticas Aplicadas a las CCSS': '#355CF5',
  'Física': '#2329A8',
  'Química': '#E55A1A',
  'Biología': '#16A34A',
  'Historia de España': '#FF6624',
  'Historia de la Filosofía': '#FF6624',
  'Historia del Arte': '#FF6624',
  'Lengua Castellana y Literatura': '#FF9B29',
  'Literatura': '#FF9B29',
  'Inglés': '#7C3AED',
  'Geografía': '#2329A8',
};

function getSubjectColor(nombre: string): string {
  return SUBJECT_COLORS[nombre] ?? '#64748B';
}

/* ─────────── Progress Ring ─────────── */
function ProgressRing({
  value,
  size = 72,
  stroke = 7,
  color = 'var(--blue)',
  trackColor = 'rgba(17,24,39,0.06)',
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <div className={s.ringWrap} style={{ width: size, height: size }}>
      <svg width={size} height={size} className={s.ringSvg}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className={s.ringContent}>{children}</div>
    </div>
  );
}

function TrendPill({ delta }: { delta: number }) {
  const rounded = Math.round(delta);
  if (rounded > 1) {
    return (
      <span className={`${s.trendPill} ${s.trendUp}`}>
        <TrendingUp size={12} /> +{rounded}%
      </span>
    );
  }
  if (rounded < -1) {
    return (
      <span className={`${s.trendPill} ${s.trendDown}`}>
        <TrendingDown size={12} /> {rounded}%
      </span>
    );
  }
  return (
    <span className={`${s.trendPill} ${s.trendFlat}`}>
      <Minus size={12} /> estable
    </span>
  );
}

export function PlannerPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { data: tasks = [], isLoading: loading } = usePlanner();
  const { data: materias = [] } = useMaterias();

  const { mutate: toggleTask } = useToggleTask();
  const { mutate: suggestPlan, isPending: suggesting } = useSuggestPlan();
  const { mutate: syncPlanner } = useSyncPlanner();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedMateria, setSelectedMateria] = useState('');
  const [viewDay, setViewDay] = useState<number>(() => (new Date().getDay() + 6) % 7);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['planner'] });
  };

  const openAddTask = (dayIdx: number) => {
    setSelectedDay(dayIdx);
    setEditingTask(null);
    setSelectedMateria(materias[0]?.id || '');
    setIsModalOpen(true);
  };

  const openEditTask = (task: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask(task);
    setSelectedDay(task.diaSemana);
    setSelectedMateria(task.materiaId);
    setIsModalOpen(true);
  };

  const handleSaveTask = () => {
    let newTasks = [...tasks];
    const materia = materias.find((m) => m.id === selectedMateria);

    if (editingTask) {
      newTasks = newTasks.map((t) =>
        t.id === editingTask.id
          ? {
              ...t,
              materiaId: selectedMateria,
              diaSemana: selectedDay,
              materia: { ...t.materia, nombre: materia?.nombre || t.materia.nombre },
            }
          : t,
      );
    } else {
      newTasks.push({
        id: Math.random().toString(36).substr(2, 9),
        materiaId: selectedMateria,
        diaSemana: selectedDay,
        completada: false,
        materia: { id: selectedMateria, nombre: materia?.nombre || 'Materia' },
      });
    }

    syncPlanner(newTasks);
    setIsModalOpen(false);
  };

  const handleDeleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTasks = tasks.filter((t) => t.id !== id);
    syncPlanner(newTasks);
  };

  /* ─────────── Derived data ─────────── */
  const todayIdx = (new Date().getDay() + 6) % 7;

  const perDay = useMemo(() => {
    return DAYS.map((_, i) => {
      const dayTasks = tasks.filter((t) => t.diaSemana === i);
      const done = dayTasks.filter((t) => t.completada).length;
      return {
        day: DAYS[i],
        total: dayTasks.length,
        done,
        pending: dayTasks.length - done,
        rate: dayTasks.length > 0 ? Math.round((done / dayTasks.length) * 100) : 0,
        isToday: i === todayIdx,
      };
    });
  }, [tasks, todayIdx]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completada).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Racha: días consecutivos (desde hoy hacia atrás) con 100% completado
  const streak = useMemo(() => {
    let count = 0;
    for (let i = todayIdx; i >= 0; i--) {
      const d = perDay[i];
      if (d.total > 0 && d.rate === 100) count++;
      else if (d.total === 0) continue;
      else break;
    }
    return count;
  }, [perDay, todayIdx]);

  // Delta vs "média" teórica — proxy para trend (until-today vs rest-of-week)
  const weekDelta = useMemo(() => {
    const past = perDay.slice(0, todayIdx + 1);
    const pastTotal = past.reduce((acc, d) => acc + d.total, 0);
    const pastDone = past.reduce((acc, d) => acc + d.done, 0);
    const pastRate = pastTotal > 0 ? (pastDone / pastTotal) * 100 : 0;
    const expected = ((todayIdx + 1) / 7) * 100;
    return Math.round(pastRate - expected);
  }, [perDay, todayIdx]);

  // Matéria breakdown
  const materiaStats = useMemo(() => {
    const map = new Map<string, { nombre: string; total: number; done: number; color: string }>();
    tasks.forEach((t) => {
      const key = t.materia?.nombre || 'Otros';
      const cur = map.get(key) || {
        nombre: key,
        total: 0,
        done: 0,
        color: getSubjectColor(key),
      };
      cur.total++;
      if (t.completada) cur.done++;
      map.set(key, cur);
    });
    return Array.from(map.values())
      .map((m) => ({ ...m, rate: Math.round((m.done / m.total) * 100) }))
      .sort((a, b) => b.total - a.total);
  }, [tasks]);

  // Smart focus: materia com mais pendentes
  const focusMateria = useMemo(() => {
    const pending = materiaStats
      .map((m) => ({ ...m, pendiente: m.total - m.done }))
      .filter((m) => m.pendiente > 0)
      .sort((a, b) => b.pendiente - a.pendiente);
    return pending[0];
  }, [materiaStats]);

  function getDaysLeft(iso?: string) {
    if (!iso) return 0;
    const diff = new Date(iso).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  function formatDate(iso?: string) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  const daysLeft = getDaysLeft(user?.fechaExamen);
  const todayTasks = perDay[todayIdx];
  const todayPending = todayTasks.pending;

  if (loading && tasks.length === 0) {
    return (
      <div className={s.plannerPage}>
        <div className={s.loadingWrap}>
          <div className={s.spinner} />
        </div>
      </div>
    );
  }

  return (
    <div className={s.plannerPage}>
      <motion.div variants={staggerContainer} initial="hidden" animate="show">
        {/* ── Header */}
        <header className={s.header}>
          <div>
            <div className={s.eyebrow}>
              <span className={s.eyebrowDot} />
              Mi plan de estudio
            </div>
            <h1 className={s.title}>
              {completionRate >= 80
                ? '¡Vas excelente esta semana!'
                : completionRate >= 50
                ? 'Buen ritmo, sigue así'
                : 'Retomemos el ritmo'}
            </h1>
            <p className={s.subtitle}>
              {totalTasks} metas esta semana · {completedTasks} completadas · {totalTasks - completedTasks} por hacer
            </p>
          </div>
          <div className={s.actions}>
            <button className={s.btnSecondary} onClick={handleRefresh} title="Actualizar">
              <RefreshCcw size={16} />
            </button>
            <button
              className={s.btnPrimary}
              onClick={() => suggestPlan()}
              disabled={suggesting}
            >
              <Sparkles size={16} />
              {suggesting ? 'Generando...' : 'IA de Estudios'}
            </button>
          </div>
        </header>

        {/* ── KPI Strip ── */}
        <div className={s.kpiStrip}>
          {/* Días examen */}
          <motion.div variants={listItem} className={s.kpiCard}>
            <div className={s.kpiIconBadge} style={{ background: 'var(--blue-soft)', color: 'var(--pp-blue)' }}>
              <Calendar size={16} />
            </div>
            <div className={s.kpiBody}>
              <span className={s.kpiLabel}>Hasta tu examen</span>
              <div className={s.kpiValueRow}>
                <span className={s.kpiValue}>{user?.fechaExamen ? daysLeft : '—'}</span>
                <span className={s.kpiUnit}>días</span>
              </div>
              <span className={s.kpiFoot}>
                {user?.fechaExamen ? formatDate(user.fechaExamen) : 'Configura tu fecha'}
              </span>
            </div>
          </motion.div>

          {/* Progreso */}
          <motion.div variants={listItem} className={s.kpiCard}>
            <ProgressRing value={completionRate} size={64} stroke={6}>
              <span className={s.ringNum}>{completionRate}%</span>
            </ProgressRing>
            <div className={s.kpiBody}>
              <span className={s.kpiLabel}>Progreso semanal</span>
              <div className={s.kpiValueRow}>
                <span className={s.kpiValue}>
                  {completedTasks}
                  <span className={s.kpiOver}>/{totalTasks}</span>
                </span>
              </div>
              <TrendPill delta={weekDelta} />
            </div>
          </motion.div>

          {/* Racha */}
          <motion.div variants={listItem} className={s.kpiCard}>
            <div
              className={s.kpiIconBadge}
              style={{
                background: streak > 0 ? 'var(--orange-soft)' : 'var(--surface-alt)',
                color: streak > 0 ? 'var(--pp-orange)' : 'var(--text-3)',
              }}
            >
              <Flame size={16} />
            </div>
            <div className={s.kpiBody}>
              <span className={s.kpiLabel}>Racha actual</span>
              <div className={s.kpiValueRow}>
                <span className={s.kpiValue}>{streak}</span>
                <span className={s.kpiUnit}>{streak === 1 ? 'día' : 'días'}</span>
              </div>
              <span className={s.kpiFoot}>
                {streak >= 3 ? 'Racha fuerte' : streak > 0 ? 'Mantén la racha' : 'Empieza hoy'}
              </span>
            </div>
          </motion.div>

          {/* Hoy */}
          <motion.div variants={listItem} className={s.kpiCard}>
            <div
              className={s.kpiIconBadge}
              style={{
                background:
                  todayPending > 0 ? 'var(--warn-bg)' : 'var(--success-bg)',
                color: todayPending > 0 ? 'var(--warn)' : 'var(--success)',
              }}
            >
              {todayPending > 0 ? <Clock size={16} /> : <Check size={16} />}
            </div>
            <div className={s.kpiBody}>
              <span className={s.kpiLabel}>Hoy</span>
              <div className={s.kpiValueRow}>
                <span className={s.kpiValue}>{todayPending}</span>
                <span className={s.kpiUnit}>
                  {todayPending === 1 ? 'pendiente' : 'pendientes'}
                </span>
              </div>
              <span className={s.kpiFoot}>
                {todayTasks.total === 0
                  ? 'Día libre'
                  : `${todayTasks.done} / ${todayTasks.total} hechas`}
              </span>
            </div>
          </motion.div>
        </div>

        {/* ── Main Panel: Chart + Focus ── */}
        <div className={s.mainPanel}>
          {/* Momentum chart */}
          <motion.div variants={listItem} className={s.chartCard}>
            <div className={s.chartHeader}>
              <div>
                <h3 className={s.cardTitle}>Tu momentum esta semana</h3>
                <p className={s.cardSub}>Metas completadas por día vs. planificadas</p>
              </div>
              <div className={s.legend}>
                <span className={s.legendItem}>
                  <span className={s.legendDotBlue} /> Completadas
                </span>
                <span className={s.legendItem}>
                  <span className={s.legendDotMuted} /> Planificadas
                </span>
              </div>
            </div>
            <div className={s.chartBody}>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={perDay} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="planGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#355CF5" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#355CF5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="doneGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#355CF5" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#355CF5" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(17,24,39,0.05)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: '#98A2B3', fontSize: 11, fontWeight: 600 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#98A2B3', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ stroke: 'rgba(6,51,153,0.15)', strokeWidth: 1 }}
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid rgba(17,24,39,0.08)',
                      borderRadius: 12,
                      boxShadow: '0 8px 28px rgba(16,24,40,0.09)',
                      fontSize: 12,
                      padding: '10px 12px',
                    }}
                    labelStyle={{ fontWeight: 700, color: '#111827', marginBottom: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Planificadas"
                    stroke="#98A2B3"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fill="url(#planGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="done"
                    name="Completadas"
                    stroke="#355CF5"
                    strokeWidth={2.5}
                    fill="url(#doneGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Smart Focus */}
          <motion.div variants={listItem} className={s.focusCard}>
            <div className={s.focusHeader}>
              <div className={s.focusBadge}>
                <Zap size={12} fill="currentColor" /> Enfoque ahora
              </div>
              <h3 className={s.focusTitle}>
                {focusMateria
                  ? `Prioriza ${focusMateria.nombre}`
                  : todayPending > 0
                  ? 'Ataca las metas de hoy'
                  : '¡Semana al día!'}
              </h3>
            </div>
            <p className={s.focusDesc}>
              {focusMateria
                ? `Tienes ${focusMateria.total - focusMateria.done} metas pendientes. Es la materia con mayor carga: avanzar aquí mueve tu progreso más rápido.`
                : todayPending > 0
                ? `${todayPending} metas esperando. 15 minutos enfocados superan 1 hora distraída.`
                : 'No tienes pendientes activos. Aprovecha para repasar flashcards o revisar errores.'}
            </p>

            {focusMateria && (
              <div
                className={s.focusProgress}
                style={{ '--focus-color': focusMateria.color } as any}
              >
                <div className={s.focusProgressBar}>
                  <div
                    className={s.focusProgressFill}
                    style={{ width: `${focusMateria.rate}%` }}
                  />
                </div>
                <span className={s.focusProgressLabel}>
                  {focusMateria.done}/{focusMateria.total} completadas
                </span>
              </div>
            )}

            <button
              className={s.focusCta}
              onClick={() => navigate('/practice')}
            >
              <Play size={14} fill="currentColor" />
              {todayPending > 0 ? 'Comenzar repaso' : 'Practicar libre'}
              <ArrowRight size={14} className={s.focusCtaArrow} />
            </button>
          </motion.div>
        </div>

        {/* ── Top Materias ── */}
        {materiaStats.length > 0 && (
          <motion.section variants={listItem} className={s.section}>
            <div className={s.sectionHeader}>
              <div>
                <h3 className={s.cardTitle}>Desempeño por materia</h3>
                <p className={s.cardSub}>Dónde vas fuerte y dónde necesitas empujar</p>
              </div>
              <span className={s.sectionMeta}>{materiaStats.length} materias</span>
            </div>
            <div className={s.materiaGrid}>
              {materiaStats.slice(0, 6).map((m) => {
                const status =
                  m.rate >= 80
                    ? { label: 'Dominando', tone: 'good' }
                    : m.rate >= 50
                    ? { label: 'En progreso', tone: 'mid' }
                    : { label: 'Atención', tone: 'low' };
                return (
                  <div
                    key={m.nombre}
                    className={s.materiaRow}
                    style={{ '--m-color': m.color } as any}
                  >
                    <div className={s.materiaLeft}>
                      <span className={s.materiaDot} />
                      <div className={s.materiaMeta}>
                        <span className={s.materiaName}>{m.nombre}</span>
                        <span className={s.materiaCount}>
                          {m.done} de {m.total} metas
                        </span>
                      </div>
                    </div>
                    <div className={s.materiaRight}>
                      <div className={s.materiaBar}>
                        <div
                          className={s.materiaBarFill}
                          style={{ width: `${m.rate}%` }}
                        />
                      </div>
                      <span className={`${s.materiaBadge} ${s[`tone_${status.tone}`]}`}>
                        {m.rate}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* ── Interactive Week ── */}
        <motion.section variants={listItem} className={s.section}>
          <div className={s.sectionHeader}>
            <div>
              <h3 className={s.cardTitle}>Tu semana</h3>
              <p className={s.cardSub}>
                Toca un día para ver y editar sus metas
              </p>
            </div>
            <div className={s.weekNav}>
              <button
                className={s.weekNavBtn}
                onClick={() => setViewDay((d) => (d - 1 + 7) % 7)}
                aria-label="Día anterior"
              >
                ‹
              </button>
              <button
                className={s.weekNavBtn}
                onClick={() => setViewDay(todayIdx)}
                title="Ir a hoy"
              >
                Hoy
              </button>
              <button
                className={s.weekNavBtn}
                onClick={() => setViewDay((d) => (d + 1) % 7)}
                aria-label="Día siguiente"
              >
                ›
              </button>
            </div>
          </div>

          {/* Week tab bar */}
          <div className={s.weekBar} role="tablist">
            {DAYS.map((short, diaIdx) => {
              const d = perDay[diaIdx];
              const isToday = diaIdx === todayIdx;
              const isActive = diaIdx === viewDay;
              const fullDone = d.total > 0 && d.rate === 100;

              return (
                <button
                  key={short}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setViewDay(diaIdx)}
                  className={`${s.weekTab} ${isActive ? s.weekTabActive : ''} ${
                    isToday ? s.weekTabToday : ''
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="weekTabBg"
                      className={s.weekTabBg}
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className={s.weekTabInner}>
                    <span className={s.weekTabLabel}>{short}</span>
                    <span className={s.weekTabMeta}>
                      {d.total === 0 ? (
                        <span className={s.weekTabEmpty}>—</span>
                      ) : fullDone ? (
                        <span className={s.weekTabBadgeDone}>
                          <Check size={10} strokeWidth={3.5} />
                        </span>
                      ) : (
                        <span className={s.weekTabCount}>
                          {d.done}<span className={s.weekTabSlash}>/</span>{d.total}
                        </span>
                      )}
                    </span>
                    {isToday && <span className={s.weekTabDot} />}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected day panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={viewDay}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className={s.dayPanel}
            >
              <div className={s.dayPanelHeader}>
                <div className={s.dayPanelTitle}>
                  <h4 className={s.dayPanelName}>
                    {DAYS_FULL[viewDay]}
                    {viewDay === todayIdx && (
                      <span className={s.dayPanelTodayPill}>Hoy</span>
                    )}
                  </h4>
                  <span className={s.dayPanelSub}>
                    {perDay[viewDay].total === 0
                      ? 'Sin metas planificadas'
                      : `${perDay[viewDay].done} de ${perDay[viewDay].total} completadas`}
                  </span>
                </div>
                {perDay[viewDay].total > 0 && (
                  <ProgressRing
                    value={perDay[viewDay].rate}
                    size={52}
                    stroke={5}
                    color={
                      perDay[viewDay].rate === 100
                        ? 'var(--success)'
                        : 'var(--blue)'
                    }
                  >
                    <span className={s.ringNumSm}>{perDay[viewDay].rate}%</span>
                  </ProgressRing>
                )}
              </div>

              <div className={s.dayPanelBody}>
                {tasks.filter((t) => t.diaSemana === viewDay).length === 0 ? (
                  <div className={s.dayEmpty}>
                    <div className={s.dayEmptyIcon}>
                      <Calendar size={18} />
                    </div>
                    <p className={s.dayEmptyText}>
                      Día libre. Añade una meta o aprovecha para descansar.
                    </p>
                  </div>
                ) : (
                  <motion.ul
                    className={s.dayTaskList}
                    initial="hidden"
                    animate="show"
                    variants={{
                      hidden: {},
                      show: { transition: { staggerChildren: 0.04 } },
                    }}
                  >
                    {tasks
                      .filter((t) => t.diaSemana === viewDay)
                      .map((task) => (
                        <motion.li
                          key={task.id}
                          layout
                          variants={{
                            hidden: { opacity: 0, y: 6 },
                            show: { opacity: 1, y: 0 },
                          }}
                          className={`${s.dayTask} ${
                            task.completada ? s.done : ''
                          }`}
                          onClick={() =>
                            toggleTask({
                              id: task.id,
                              completada: !task.completada,
                            })
                          }
                          style={
                            {
                              '--materia-color': getSubjectColor(
                                task.materia.nombre,
                              ),
                            } as any
                          }
                        >
                          <div className={s.checkbox}>
                            {task.completada && (
                              <Check size={12} color="white" strokeWidth={3} />
                            )}
                          </div>
                          <div className={s.taskBody}>
                            <div className={s.materiaName}>
                              {task.materia.nombre}
                            </div>
                            <span className={s.faseBadge}>
                              {task.materia.fase || 'Prioridad'}
                            </span>
                          </div>
                          <div className={s.taskActions}>
                            <button
                              className={s.editBtn}
                              onClick={(e) => openEditTask(task, e)}
                              aria-label="Editar"
                            >
                              <MoreVertical size={14} />
                            </button>
                            <button
                              className={s.deleteBtn}
                              onClick={(e) => handleDeleteTask(task.id, e)}
                              aria-label="Eliminar"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </motion.li>
                      ))}
                  </motion.ul>
                )}

                <button
                  className={s.dayAddBtn}
                  onClick={() => openAddTask(viewDay)}
                >
                  <Plus size={14} />
                  Añadir meta a {DAYS_FULL[viewDay]}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.section>

        {/* Empty state */}
        {totalTasks === 0 && (
          <motion.div variants={listItem} className={s.emptyState}>
            <div className={s.emptyIcon}>
              <BookOpen size={24} />
            </div>
            <h3 className={s.emptyTitle}>Aún no tienes un plan</h3>
            <p className={s.emptyDesc}>
              Deja que la IA arme tu semana según tus materias, o añade metas manualmente.
            </p>
            <button
              className={s.btnPrimary}
              onClick={() => suggestPlan()}
              disabled={suggesting}
            >
              <Sparkles size={16} />
              Generar plan con IA
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* ── Modal Add/Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <div className={s.modalOverlay} onClick={() => setIsModalOpen(false)}>
            <motion.div
              className={s.modal}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={s.modalHeader}>
                <h3 className={s.modalTitle}>
                  {editingTask ? 'Editar meta' : 'Nueva meta de estudio'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className={s.modalClose}
                  aria-label="Cerrar"
                >
                  <X size={18} />
                </button>
              </div>

              <div className={s.formGroup}>
                <label className={s.label}>Materia</label>
                <select
                  className={s.select}
                  value={selectedMateria}
                  onChange={(e) => setSelectedMateria(e.target.value)}
                >
                  {materias.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                  <option value="custom">General / Otro</option>
                </select>
              </div>

              <div className={s.formGroup}>
                <label className={s.label}>Día de la semana</label>
                <select
                  className={s.select}
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(Number(e.target.value))}
                >
                  {DAYS_FULL.map((d, i) => (
                    <option key={d} value={i}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className={s.modalActions}>
                <button className={s.btnSecondary} onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button className={s.btnPrimary} onClick={handleSaveTask}>
                  Guardar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
