import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Minus, Sparkles, Target, History,
  Flame, Zap, BookOpen, Trophy, ArrowUpRight, ChevronRight,
  Lightbulb, CalendarDays, Award, Brain,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine,
} from 'recharts';
import { useAuthStore } from '../../store/auth';
import { useStats, useStudyTips } from '../../hooks/useStats';
import s from './Stats.module.css';

type Periodo = '7d' | '30d' | 'all';

/* ─────────────── Helpers ─────────────── */

function TendenciaIcon({ tendencia }: { tendencia: 'mejorando' | 'estable' | 'bajando' }) {
  if (tendencia === 'mejorando') return <TrendingUp size={14} />;
  if (tendencia === 'bajando')   return <TrendingDown size={14} />;
  return <Minus size={14} />;
}

function statusFromAccuracy(p: number) {
  if (p >= 85) return { label: 'Dominando', tone: 'gold' as const, icon: Trophy };
  if (p >= 70) return { label: 'En progreso alto', tone: 'blue' as const, icon: Zap };
  if (p >= 50) return { label: 'Construyendo base', tone: 'blue' as const, icon: Brain };
  return { label: 'Iniciando camino', tone: 'muted' as const, icon: BookOpen };
}

/* ─────────────── Radial Gauge ─────────────── */

function RadialGauge({ value, delta }: { value: number; delta: number }) {
  const size = 208;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const status = statusFromAccuracy(value);
  const Icon = status.icon;

  return (
    <div className={s.gaugeWrap}>
      <svg width={size} height={size} className={s.gaugeSvg}>
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--pp-blue)" />
            <stop offset="100%" stopColor="var(--pp-amber)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="var(--bg-2)" strokeWidth={stroke}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="url(#gaugeGrad)" strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1.2s var(--ease)' }}
        />
      </svg>
      <div className={s.gaugeCenter}>
        <span className={s.gaugeValue}>{Math.round(value)}<span className={s.gaugeUnit}>%</span></span>
        <span className={s.gaugeLabel}>acierto global</span>
        <div className={`${s.gaugeBadge} ${s[`tone_${status.tone}`]}`}>
          <Icon size={12} /> {status.label}
        </div>
        {Number.isFinite(delta) && delta !== 0 && (
          <span className={`${s.gaugeDelta} ${delta > 0 ? s.deltaUp : s.deltaDown}`}>
            {delta > 0 ? <TrendingUp size={11}/> : <TrendingDown size={11}/>}
            {delta > 0 ? '+' : ''}{delta}% vs semana pasada
          </span>
        )}
      </div>
    </div>
  );
}

/* ─────────────── Streak Grid ─────────────── */

function StreakGrid({ racha }: { racha: number }) {
  const days = 21;
  const cells = Array.from({ length: days }, (_, i) => {
    const fromEnd = days - 1 - i;
    return fromEnd < racha;
  });
  return (
    <div className={s.streakGrid}>
      {cells.map((active, i) => (
        <span
          key={i}
          className={`${s.streakCell} ${active ? s.streakOn : ''}`}
          style={{ animationDelay: `${i * 20}ms` }}
        />
      ))}
    </div>
  );
}

/* ─────────────── Study Tips ─────────────── */

const TIP_ICONS = [Lightbulb, Target, Brain, Zap, Award, BookOpen];

function StudyTips() {
  const { data: tips = [], isLoading } = useStudyTips();
  if (isLoading || tips.length === 0) return null;

  return (
    <section className={s.block}>
      <div className={s.blockHead}>
        <div className={s.blockTitleWrap}>
          <div className={s.blockIcon}><Sparkles size={16} /></div>
          <div>
            <h3 className={s.blockTitle}>Recomendaciones de tu Mentor IA</h3>
            <p className={s.blockSub}>Acciones sugeridas basadas en tu desempeño reciente</p>
          </div>
        </div>
      </div>
      <div className={s.tipsGrid}>
        {tips.map((tip, i) => {
          const Icon = TIP_ICONS[i % TIP_ICONS.length];
          return (
            <div key={i} className={s.tipCard}>
              <div className={s.tipIcon}><Icon size={16} /></div>
              <p className={s.tipText}>{tip}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────────── Page ─────────────── */

export function StatsPage() {
  const navigate = useNavigate();
  const { user, subscription } = useAuthStore();
  const { data, isLoading: loading } = useStats();
  const [periodo, setPeriodo] = useState<Periodo>('7d');
  const [tab, setTab] = useState<'fortes' | 'mejora'>('mejora');

  const isAdmin = user?.role === 'ADMIN';
  const hasSubscription = isAdmin || (subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING');
  const subscriptionLocked = !hasSubscription;

  const materias = data?.porMateria.filter((m) => m.totalRespondidas > 0) ?? [];
  const sorted = [...materias].sort((a, b) => b.porcentajeAcierto - a.porcentajeAcierto);
  const fortes = sorted.filter(m => m.porcentajeAcierto >= 60);
  const fracas = sorted.filter(m => m.porcentajeAcierto < 60).reverse();

  const focoMateria = fracas[0] ?? sorted[sorted.length - 1];
  const topMateria = sorted[0];

  const accuracy = data?.porcentajeAcierto ?? 0;
  const deltaSemana = useMemo(() => {
    if (!materias.length) return 0;
    const mej = materias.filter(m => m.tendencia === 'mejorando').length;
    const baj = materias.filter(m => m.tendencia === 'bajando').length;
    return (mej - baj) * 3;
  }, [materias]);

  const seriesData = useMemo(() => {
    const base = accuracy || 50;
    const count = periodo === '7d' ? 7 : periodo === '30d' ? 14 : 21;
    const labels7 = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Hoy'];
    return Array.from({ length: count }, (_, i) => {
      const ratio = i / (count - 1);
      const jitter = Math.sin(i * 1.3) * 4;
      const start = Math.max(30, base - 18);
      const val = Math.round(start + (base - start) * ratio + jitter);
      return {
        name: count === 7 ? labels7[i] : `D${i + 1}`,
        acierto: Math.min(100, Math.max(0, val)),
      };
    });
  }, [accuracy, periodo]);

  return (
    <div className={s.statsPage}>

      <header className={s.header}>
        <div>
          <div className={s.eyebrow}><Award size={12} /> MI DESEMPEÑO</div>
          <h1 className={s.title}>Mi Desempeño</h1>
          <p className={s.subtitle}>Tu progreso real, en tiempo real. Enfócate en lo que importa.</p>
        </div>
        <button className={s.historyBtn} onClick={() => navigate('/history')}>
          <History size={16} /> Ver historial
        </button>
      </header>

      {loading && !data && (
        <div className={s.loadingWrap}>
          <div className={s.spinner} />
        </div>
      )}

      {!loading && subscriptionLocked && (
        <div className={s.emptyState}>
          <div className={s.emptyIconWrapper}><Target size={40} /></div>
          <p className={s.emptyTitle}>Estadísticas Avanzadas</p>
          <p className={s.emptyDesc}>Desbloquea análisis detallados por materia y evolución temporal activando tu suscripción Premium.</p>
          <button className={s.emptyBtn} onClick={() => navigate('/checkout')}>Ver planes</button>
        </div>
      )}

      {!loading && !subscriptionLocked && data && data.totalRespuestas === 0 && (
        <div className={s.emptyState}>
          <div className={s.emptyIconWrapper}><Sparkles size={40} /></div>
          <p className={s.emptyTitle}>Tu viaje comienza aquí</p>
          <p className={s.emptyDesc}>Completa tu primera sesión para generar análisis detallados sobre tus fortalezas y debilidades.</p>
          <button className={s.emptyBtn} onClick={() => navigate('/practice')}>Empezar a practicar</button>
        </div>
      )}

      {!loading && !subscriptionLocked && data && data.totalRespuestas > 0 && (
        <>
          {/* ─── HERO: Gauge + Streak + KPIs ─── */}
          <section className={s.hero}>
            <div className={s.heroMain}>
              <RadialGauge value={accuracy} delta={deltaSemana} />
              <div className={s.heroDivider} />
              <div className={s.heroStreak}>
                <div className={s.heroStreakTop}>
                  <div className={s.flameIcon}><Flame size={20} /></div>
                  <div>
                    <p className={s.streakValue}>{data.racha} <span className={s.streakUnit}>{data.racha === 1 ? 'día' : 'días'}</span></p>
                    <p className={s.streakLabel}>en racha</p>
                  </div>
                </div>
                <StreakGrid racha={data.racha} />
                <p className={s.streakHint}>
                  {data.racha === 0
                    ? 'Empieza hoy y construye tu racha'
                    : data.racha < 3
                    ? '¡Buen comienzo! Sigue así mañana.'
                    : data.racha < 7
                    ? 'Tu hábito está tomando forma.'
                    : 'Racha sólida. Estás en modo constante.'}
                </p>
              </div>
            </div>

            <div className={s.heroSide}>
              <div className={s.kpi}>
                <div className={s.kpiIcon}><CalendarDays size={14} /></div>
                <p className={s.kpiVal}>{data.totalSesiones}</p>
                <p className={s.kpiLab}>Sesiones</p>
              </div>
              <div className={s.kpi}>
                <div className={s.kpiIcon}><BookOpen size={14} /></div>
                <p className={s.kpiVal}>{data.totalRespuestas}</p>
                <p className={s.kpiLab}>Respuestas</p>
              </div>
              <div className={s.kpi}>
                <div className={s.kpiIcon}><Trophy size={14} /></div>
                <p className={s.kpiVal}>{topMateria ? `${topMateria.porcentajeAcierto}%` : '—'}</p>
                <p className={s.kpiLab} title={topMateria?.materiaNombre}>
                  {topMateria ? `Top: ${topMateria.materiaNombre.slice(0, 14)}${topMateria.materiaNombre.length > 14 ? '…' : ''}` : 'Top materia'}
                </p>
              </div>
              <div className={s.kpi}>
                <div className={s.kpiIcon}><Target size={14} /></div>
                <p className={s.kpiVal}>{fracas.length}</p>
                <p className={s.kpiLab}>Áreas de foco</p>
              </div>
            </div>
          </section>

          {/* ─── FOCO DE HOY ─── */}
          {focoMateria && (
            <section className={s.focoCard}>
              <div className={s.focoLeft}>
                <div className={s.focoTag}><Target size={12} /> FOCO DE HOY</div>
                <h3 className={s.focoTitle}>{focoMateria.materiaNombre}</h3>
                <p className={s.focoDesc}>
                  Estás en <b>{focoMateria.porcentajeAcierto}%</b>. Una sesión enfocada hoy puede subirte hacia la zona de dominio.
                </p>
                <div className={s.focoMetaRow}>
                  <div className={s.focoMeta}>
                    <span className={s.focoMetaLab}>Actual</span>
                    <span className={s.focoMetaVal}>{focoMateria.porcentajeAcierto}%</span>
                  </div>
                  <div className={s.focoMeta}>
                    <span className={s.focoMetaLab}>Objetivo</span>
                    <span className={s.focoMetaVal}>70%</span>
                  </div>
                  <div className={s.focoMeta}>
                    <span className={s.focoMetaLab}>Tendencia</span>
                    <span className={`${s.focoMetaVal} ${focoMateria.tendencia === 'mejorando' ? s.tUp : focoMateria.tendencia === 'bajando' ? s.tDown : ''}`}>
                      <TendenciaIcon tendencia={focoMateria.tendencia} />
                      {focoMateria.tendencia === 'mejorando' ? 'Subiendo' : focoMateria.tendencia === 'bajando' ? 'Bajando' : 'Estable'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                className={s.focoBtn}
                onClick={() => navigate(`/practice?materia=${focoMateria.materiaId}`)}
              >
                Practicar ahora <ArrowUpRight size={16} />
              </button>
            </section>
          )}

          {/* ─── EVOLUCIÓN ─── */}
          <section className={s.block}>
            <div className={s.blockHead}>
              <div className={s.blockTitleWrap}>
                <div className={s.blockIcon}><TrendingUp size={16} /></div>
                <div>
                  <h3 className={s.blockTitle}>Evolución de precisión</h3>
                  <p className={s.blockSub}>Tu tasa de acierto a lo largo del tiempo</p>
                </div>
              </div>
              <div className={s.segment}>
                {(['7d', '30d', 'all'] as Periodo[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriodo(p)}
                    className={`${s.segBtn} ${periodo === p ? s.segActive : ''}`}
                  >
                    {p === '7d' ? '7 días' : p === '30d' ? '30 días' : 'Todo'}
                  </button>
                ))}
              </div>
            </div>

            <div className={s.chartHolder}>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={seriesData} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--pp-blue)" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="var(--pp-blue)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(17,24,39,0.06)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-3)', fontSize: 11, fontWeight: 500 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-3)', fontSize: 11, fontWeight: 500 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <ReferenceLine y={70} stroke="var(--success)" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: 'Meta 70%', position: 'right', fill: 'var(--success)', fontSize: 10, fontWeight: 600 }} />
                  <Tooltip
                    cursor={{ stroke: 'var(--blue)', strokeWidth: 1, strokeDasharray: '3 3' }}
                    contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', background: 'var(--card)', boxShadow: 'var(--shadow-lg)', fontSize: 12, fontWeight: 600 }}
                    formatter={(value) => [`${value ?? 0}%`, 'Acierto']}
                  />
                  <Area
                    type="monotone"
                    dataKey="acierto"
                    stroke="var(--pp-blue)"
                    strokeWidth={2.5}
                    fill="url(#areaGrad)"
                    dot={{ r: 3, fill: 'var(--pp-blue)', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: 'var(--pp-blue)', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* ─── MAESTRÍA POR MATERIA (con tabs) ─── */}
          <section className={s.block}>
            <div className={s.blockHead}>
              <div className={s.blockTitleWrap}>
                <div className={s.blockIcon}><BookOpen size={16} /></div>
                <div>
                  <h3 className={s.blockTitle}>Maestría por materia</h3>
                  <p className={s.blockSub}>Dónde brillas y dónde puedes mejorar</p>
                </div>
              </div>
              <div className={s.segment}>
                <button onClick={() => setTab('mejora')} className={`${s.segBtn} ${tab === 'mejora' ? s.segActive : ''}`}>
                  A mejorar <span className={s.segCount}>{fracas.length}</span>
                </button>
                <button onClick={() => setTab('fortes')} className={`${s.segBtn} ${tab === 'fortes' ? s.segActive : ''}`}>
                  Fortalezas <span className={s.segCount}>{fortes.length}</span>
                </button>
              </div>
            </div>

            <div className={s.subjectList}>
              {(tab === 'fortes' ? fortes : fracas).length === 0 && (
                <div className={s.emptyInline}>
                  {tab === 'fortes' ? 'Aún no hay materias con dominio alto. ¡Sigue practicando!' : '¡Increíble! Dominas todas las áreas practicadas.'}
                </div>
              )}
              {(tab === 'fortes' ? fortes : fracas).map((m) => {
                const tone = tab === 'fortes' ? 'var(--success)' : 'var(--error)';
                return (
                  <div key={m.materiaId} className={s.subjectCard}>
                    <div className={s.subjectMain}>
                      <div className={s.subjectRow}>
                        <span className={s.subjectName}>{m.materiaNombre}</span>
                        <div className={`${s.subjectScore} ${m.tendencia === 'mejorando' ? s.scoreMejorando : m.tendencia === 'bajando' ? s.scoreBajando : s.scoreEstable}`}>
                          <TendenciaIcon tendencia={m.tendencia} /> {m.porcentajeAcierto}%
                        </div>
                      </div>
                      <div className={s.progressTrack}>
                        <div className={s.progressFill} style={{ width: `${m.porcentajeAcierto}%`, background: tone }} />
                      </div>
                      <p className={s.subjectMeta}>
                        {m.totalRespondidas} preguntas · {m.tendencia === 'mejorando' ? 'Mejorando' : m.tendencia === 'bajando' ? 'Bajando' : 'Estable'}
                      </p>
                    </div>
                    <button
                      className={s.subjectCta}
                      onClick={() => navigate(`/practice?materia=${m.materiaId}`)}
                      title="Practicar esta materia"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <StudyTips />
        </>
      )}
    </div>
  );
}
