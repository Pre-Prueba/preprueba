import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, CheckCircle, XCircle, Lightbulb, TrendingUp, Timer as TimerIcon, Star } from 'lucide-react';
import { sesiones as sesionesApi, favoritos as favoritosApi } from '../../services/api';
import { broadcastUpdate } from '../../lib/queryClient';
import type { Pregunta, RespuestaResult, SesionFinalizada } from '../../types';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { fadeUp, staggerContainer, slideInRight } from '../../lib/animations';
import s from './PracticeSession.module.css';

type PracticeState = 'loading' | 'question' | 'feedback' | 'milestone_feedback' | 'result';

function formatDuration(seconds: number) {
  const totalSeconds = Math.max(seconds, 0);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function Timer({ seconds, countdown }: { seconds: number; countdown: boolean }) {
  const timerLabel = formatDuration(seconds);

  return (
    <div className={s.timer}>
      <TimerIcon size={14} aria-hidden="true" />
      <span>{countdown ? timerLabel : timerLabel}</span>
    </div>
  );
}

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

const feedbackEnter = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
};

const resultEnter = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] } },
};

function getResultMessage(pct: number): string {
  if (pct >= 80) return 'Muy bien. Entendiste lo importante.';
  if (pct >= 40) return 'Vas avanzando. Sigue practicando.';
  return 'Buen intento. Ahora ya sabes dónde enfocar.';
}

function isSubscriptionRequiredError(error: unknown): boolean {
  return error instanceof Error && error.message === 'SUBSCRIPTION_REQUIRED';
}

export function PracticePage() {
  const { materiaId } = useParams<{ materiaId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const search = searchParams.toString();
  const isExamMode =
    searchParams.get('examMode') === 'true' ||
    searchParams.get('simulado') === 'true' ||
    searchParams.get('simulacro') === 'true';
  const hasTimer =
    searchParams.get('timer') === 'true' ||
    isExamMode ||
    searchParams.has('duracion');
  const durationSecondsParam = Number(searchParams.get('duracion') ?? '');
  const durationSeconds = Number.isFinite(durationSecondsParam) && durationSecondsParam > 0
    ? durationSecondsParam
    : null;
  const soloNoRespondidas = searchParams.get('soloNoRespondidas') === 'true';

  const [state, setState] = useState<PracticeState>('loading');
  const [sesionId, setSesionId] = useState('');
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOpcion, setSelectedOpcion] = useState<string | null>(null);
  const [respuestaTexto, setRespuestaTexto] = useState('');
  const [feedbacks, setFeedbacks] = useState<Record<number, RespuestaResult>>({});
  const [resultado, setResultado] = useState<SesionFinalizada | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showExitModal, setShowExitModal] = useState(false);
  const [favoritados, setFavoritados] = useState<Set<string>>(new Set());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTime = useRef<number>(Date.now());
  const sessionRequestRef = useRef<{ key: string; promise: ReturnType<typeof sesionesApi.iniciar> } | null>(null);
  const finalizingRef = useRef(false);
  const timerExpiredRef = useRef(false);

  async function toggleFavorito(preguntaId: string) {
    if (favoritados.has(preguntaId)) {
      await favoritosApi.remove(preguntaId).catch(() => {});
      setFavoritados((prev) => { const s = new Set(prev); s.delete(preguntaId); return s; });
    } else {
      await favoritosApi.add(preguntaId).catch(() => {});
      setFavoritados((prev) => new Set(prev).add(preguntaId));
    }
  }

  // Derive current feedback
  const feedback = feedbacks[currentIndex] || null;

  useEffect(() => {
    document.title = isExamMode ? 'Sesión de examen | Preprueba' : 'Sesión de práctica | Preprueba';
  }, [isExamMode]);

  useEffect(() => {
    if (!materiaId) return;
    const sessionKey = `${materiaId}|${search}`;
    let ignore = false;

    async function cargar() {
      try {
        const currentParams = new URLSearchParams(search);
        const tipo = currentParams.get('tipo') || undefined;
        const codigo = currentParams.get('codigo') || undefined;
        const paramTotal = currentParams.get('totalPreguntas') ?? currentParams.get('total');
        const totalPreguntas = paramTotal ? parseInt(paramTotal, 10) : (isExamMode ? 25 : 10);

        if (sessionRequestRef.current?.key !== sessionKey) {
          sessionRequestRef.current = {
            key: sessionKey,
            promise: sesionesApi.iniciar(materiaId!, {
              tipo,
              codigo,
              totalPreguntas,
              soloNoRespondidas,
            }),
          };
        }

        const data = await sessionRequestRef.current.promise;
        if (ignore) return;

        if (data.preguntas.length === 0) {
          setError('No hay preguntas disponibles para esta configuración.');
          return;
        }

        setSesionId(data.sesionId);
        setPreguntas(data.preguntas);
        setElapsedSeconds(0);
        timerExpiredRef.current = false;
        startTime.current = Date.now();
        setState('question');
      } catch (err) {
        if (ignore) return;
        if (isSubscriptionRequiredError(err)) {
          navigate('/checkout', { replace: true });
          return;
        }

        setError(err instanceof Error ? err.message : 'No se pudo cargar la práctica. Inténtalo de nuevo.');
      }
    }

    cargar();
    return () => { ignore = true; };
  }, [materiaId, navigate, search, isExamMode, soloNoRespondidas]);

  useEffect(() => {
    if (!hasTimer || state === 'loading' || state === 'result' || !sesionId) return;

    const interval = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [hasTimer, sesionId, state]);

  const timerValue = durationSeconds !== null
    ? Math.max(durationSeconds - elapsedSeconds, 0)
    : elapsedSeconds;
  const isCountdown = durationSeconds !== null;

  const currentPregunta = preguntas[currentIndex];
  const progress = preguntas.length > 0 ? (currentIndex / preguntas.length) * 100 : 0;

  async function finalizarSesion() {
    if (!sesionId || finalizingRef.current) return;

    finalizingRef.current = true;
    try {
      const result = await sesionesApi.finalizar(sesionId);
      setResultado(result);
      setState('result');
      broadcastUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al finalizar la sesión. Inténtalo de nuevo.');
      finalizingRef.current = false;
    }
  }

  useEffect(() => {
    if (!isCountdown || state === 'loading' || state === 'result') return;
    if (timerValue > 0 || timerExpiredRef.current) return;

    timerExpiredRef.current = true;
    void finalizarSesion();
  }, [isCountdown, state, timerValue]);

  async function handleResponder() {
    if (!currentPregunta || submitting) return;
    setSubmitting(true);
    setError('');
    const tiempoRespuesta = Math.round((Date.now() - startTime.current) / 1000);
    try {
      const result = await sesionesApi.responder(sesionId, {
        preguntaId: currentPregunta.id,
        opcionId: currentPregunta.tipo === 'TEST' ? (selectedOpcion ?? undefined) : undefined,
        respuestaTexto: currentPregunta.tipo === 'ABIERTA' ? respuestaTexto : undefined,
        tiempoRespuesta,
      });
      setFeedbacks(prev => ({ ...prev, [currentIndex]: result }));
      setState('feedback');
      
      // 2025 Standard: Broadcast update to other tabs for real-time sync (Option B)
      broadcastUpdate();
    } catch {
      setError('Error al corregir la respuesta. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSiguiente() {
    if (currentIndex + 1 >= preguntas.length) {
      await finalizarSesion();
    } else {
      if ((currentIndex + 1) % 5 === 0) {
        setState('milestone_feedback');
        return;
      }
      avanzarPregunta();
    }
  }

  function avanzarPregunta() {
    setCurrentIndex((i) => i + 1);
    setSelectedOpcion(null);
    setRespuestaTexto('');
    startTime.current = Date.now();
    setState(feedbacks[currentIndex + 1] ? 'feedback' : 'question');
  }

  function handleContinueMilestone() {
    avanzarPregunta();
  }

  async function confirmExit() {
    try {
      if (sesionId && currentIndex > 0) {
         await sesionesApi.pausar(sesionId, currentIndex);
         broadcastUpdate();
      }
    } catch(err) {
      console.error('Failed to pause', err);
    }
    navigate('/dashboard');
  }

  function handleAnterior() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setState('feedback'); // Anterior is always answered in this session
    }
  }

  /* ── Error global */
  if (error && state === 'loading') {
    return (
      <div className={s.loadingContainer}>
        <p style={{ color: 'var(--error)', marginBottom: '16px' }}>{error}</p>
        <Button onClick={() => navigate('/practice')}>Volver a practicar</Button>
      </div>
    );
  }

  /* ── Loading */
  if (state === 'loading') {
    return (
      <div className={s.loadingContainer}>
        <div className={s.loadingSpinner} />
        <p className={s.loadingText}>Preparando tu sesión con IA...</p>
      </div>
    );
  }

  /* ── Result */
  if (state === 'result' && resultado) {
    const pct = resultado.porcentaje;
    const emoji = pct >= 80 ? '🏆' : pct >= 40 ? '👍' : '💪';
    return (
      <div className={s.pageContainer} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <main className={s.main}>
          <AnimatePresence>
            <motion.div
              key="result"
              variants={resultEnter}
              initial="hidden"
              animate="show"
              className={s.resultCard}
              data-testid="resultado-final"
            >
              <div className={s.resultEmojiWrapper}>
                <span className={s.resultEmoji}>{emoji}</span>
              </div>

              <h2 className={s.resultTitle}>Sesión completada</h2>

              <div className={s.scoreCircle}>
                <span className={s.scorePct} data-testid="porcentaje-acierto">{pct}%</span>
                <span className={s.scoreLabel}>Acierto</span>
              </div>

              <p className={s.resultFraction}>
                {resultado.aciertos} / {resultado.totalPreguntas} correctas
              </p>

              <p className={s.resultMessage}>{getResultMessage(pct)}</p>

              <div className={s.resultActions}>
                <Button variant="secondary" fullWidth onClick={() => navigate('/dashboard')}>
                  ← Inicio
                </Button>
                <Button variant="orange" fullWidth onClick={() => window.location.reload()}>
                  Otra sesión →
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    );
  }

  if (!currentPregunta) return null;

  const renderExitModal = () => {
    if (!showExitModal) return null;
    return (
      <div className={s.modalOverlay}>
        <div
          className={s.modalContent}
          role="dialog"
          aria-modal="true"
          aria-labelledby="practice-exit-title"
          aria-describedby="practice-exit-description"
        >
          <h2 className={s.modalTitle} id="practice-exit-title">¿Seguro que quieres salir?</h2>
          <p className={s.modalText} id="practice-exit-description">
             Estás a punto de abandonar la sesión. Llevas {currentIndex} preguntas respondidas.<br />
             Se guardará tu progreso para que puedas continuar luego.
          </p>
          <div className={s.modalActions}>
            <Button variant="secondary" onClick={() => setShowExitModal(false)} fullWidth>Volver a la práctica</Button>
            <Button variant="ghost" onClick={confirmExit} fullWidth>Salir y guardar</Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={s.pageContainer}>
      {renderExitModal()}
      {/* ── Header */}
      <header className={s.header}>
        <div className={s.headerContent}>
          <div className={s.headerInfo}>
            <span className={s.headerTitle}>{isExamMode ? 'Simulado Final' : 'Práctica'}</span>
            <span className={s.headerCount}>{currentIndex + 1} de {preguntas.length}</span>
            {hasTimer && state !== 'result' && <Timer seconds={timerValue} countdown={isCountdown} />}
            <button
              className={s.headerExit}
              onClick={() => setShowExitModal(true)}
              title="Salir"
              type="button"
              aria-label="Salir de la sesión"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <ProgressBar value={progress} />
        </div>
      </header>

      <main className={s.main}>
        <div className={s.contentWrapper}>
          {error && (
            <div style={{ background: 'var(--error-bg)', border: '1px solid rgba(214,69,69,0.2)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '13px', color: 'var(--error)', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">

            {/* ── Estado: pregunta */}
            {state === 'question' && (
              <motion.div
                key={`question-${currentIndex}`}
                variants={slideInRight}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <motion.div variants={staggerContainer} initial="hidden" animate="show">
                  <motion.p variants={fadeUp} className={s.questionLabel}>
                    Pregunta {currentIndex + 1} de {preguntas.length}
                  </motion.p>

                  <motion.div
                    variants={fadeUp}
                    className={s.questionCard}
                    data-testid="pregunta-container"
                    data-tipo={currentPregunta.tipo}
                  >
                    <p className={s.questionText} data-testid="pregunta-enunciado">
                      {currentPregunta.enunciado}
                    </p>
                  </motion.div>

                  {currentPregunta.tipo === 'TEST' ? (
                    <motion.div variants={staggerContainer} initial="hidden" animate="show" className={s.optionsList}>
                      {currentPregunta.opciones.map((opcion, idx) => (
                        <motion.button
                          key={opcion.id}
                          variants={fadeUp}
                          data-testid="opcion"
                          onClick={() => setSelectedOpcion(opcion.id)}
                          className={`${s.optionBtn} ${selectedOpcion === opcion.id ? s.selected : ''}`}
                        >
                          <span className={s.optLetter}>{LETTERS[idx] ?? idx + 1}</span>
                          {opcion.texto}
                        </motion.button>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div variants={fadeUp} className={s.textareaContainer}>
                      <textarea
                        className={s.textarea}
                        value={respuestaTexto}
                        onChange={(e) => setRespuestaTexto(e.target.value)}
                        placeholder="Escribe tu respuesta argumentada aquí..."
                      />
                      <span className={s.textareaCount}>{respuestaTexto.length} caracteres</span>
                    </motion.div>
                  )}

                  <motion.div variants={fadeUp} className={s.actionArea}>
                    <Button
                      variant="orange"
                      size="lg"
                      fullWidth
                      disabled={submitting || (currentPregunta.tipo === 'TEST' ? !selectedOpcion : !respuestaTexto.trim())}
                      onClick={handleResponder}
                    >
                      {submitting ? 'Analizando con IA...' : 'Comprobar respuesta'} →
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* ── Estado: feedback */}
            {state === 'feedback' && feedback && (
              <motion.div
                key={`feedback-${currentIndex}`}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <motion.div variants={staggerContainer} initial="hidden" animate="show">
                  <motion.p variants={fadeUp} className={s.questionLabel}>
                    Pregunta {currentIndex + 1} de {preguntas.length}
                  </motion.p>

                  <motion.div
                    variants={fadeUp}
                    className={s.questionCard}
                    data-testid="pregunta-container"
                    data-tipo={currentPregunta.tipo}
                  >
                    <p className={s.questionText} data-testid="pregunta-enunciado">
                      {currentPregunta.enunciado}
                    </p>
                  </motion.div>

                  {currentPregunta.tipo === 'TEST' && (
                    <div className={s.optionsList}>
                      {currentPregunta.opciones.map((opcion, idx) => {
                        const isSelected = opcion.id === selectedOpcion;
                        const isCorrect = opcion.id === feedback.opcionCorrecta?.id;
                        let cls = s.optionBtn;
                        if (isCorrect) cls += ` ${s.correct}`;
                        else if (isSelected && !feedback.esCorrecta) cls += ` ${s.incorrect}`;

                        return (
                          <div key={opcion.id} className={cls}>
                            <span className={s.optLetter}>{LETTERS[idx] ?? idx + 1}</span>
                            {opcion.texto}
                            {isCorrect && (
                              <CheckCircle size={16} style={{ marginLeft: 'auto', flexShrink: 0 }} />
                            )}
                            {isSelected && !feedback.esCorrecta && !isCorrect && (
                              <XCircle size={16} style={{ marginLeft: 'auto', flexShrink: 0 }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <motion.div variants={feedbackEnter} initial="hidden" animate="show" className={s.feedbackBlock} data-testid="feedback-ia">
                    <div className={s.feedbackBlockHeader}>
                      <div className={s.feedbackBlockIcon}>
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <p className={s.feedbackBlockTitle}>Explicación</p>
                        <p className={s.feedbackBlockSubtitle}>
                          {feedback.esCorrecta ? '¡Correcto! Te cuento el por qué.' : 'Verifica los detalles.'}
                        </p>
                      </div>
                    </div>
                    <p className={s.feedbackText}>{feedback.feedback.explicacion}</p>
                    
                    <div className={s.feedbackGrid}>
                      <div className={s.feedbackCard}>
                        <div className={s.feedbackCardTitle}><Lightbulb size={14}/> Conceptos Clave</div>
                        <p className={s.feedbackText} style={{fontSize: '13px'}}>{feedback.feedback.conceptos}</p>
                      </div>
                      <div className={s.feedbackCard}>
                        <div className={s.feedbackCardTitle}><TrendingUp size={14}/> Valoración</div>
                        <p className={s.feedbackText} style={{fontSize: '13px'}}>{feedback.feedback.valoracion}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Botón favoritar */}
                  {preguntas[currentIndex] && (
                    <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                      <button
                        onClick={() => toggleFavorito(preguntas[currentIndex].id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          background: 'transparent',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          color: favoritados.has(preguntas[currentIndex].id) ? 'var(--orange)' : 'var(--text-2)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 500,
                          cursor: 'pointer',
                          fontFamily: 'var(--font-body)',
                          transition: 'all 0.15s',
                        }}
                      >
                        <Star
                          size={14}
                          fill={favoritados.has(preguntas[currentIndex].id) ? 'currentColor' : 'none'}
                        />
                        {favoritados.has(preguntas[currentIndex].id) ? 'Guardado' : 'Guardar'}
                      </button>
                    </motion.div>
                  )}

                  <motion.div variants={fadeUp} className={s.actionArea} style={{display: 'flex', gap: '12px'}}>
                    {currentIndex > 0 && (
                      <Button variant="secondary" size="lg" onClick={handleAnterior} fullWidth>
                        ← Anterior
                      </Button>
                    )}
                    <Button variant="primary" size="lg" fullWidth onClick={handleSiguiente}>
                      {currentIndex + 1 >= preguntas.length ? 'Ver resultados' : 'Próxima'} →
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* ── Estado: milestone_feedback */}
            {state === 'milestone_feedback' && (
              <motion.div
                key={`milestone-${currentIndex}`}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <div className={s.resultCard} style={{ marginTop: '40px' }}>
                  {(() => {
                    const last5 = Object.values(feedbacks).slice(-5);
                    const correctas = last5.filter(f => f.esCorrecta).length;
                    const isGood = correctas >= 3;
                    return (
                      <>
                        <div className={s.resultEmojiWrapper}>
                          <span className={s.resultEmoji}>{isGood ? '🚀' : '⚠️'}</span>
                        </div>
                        <h2 className={s.resultTitle}>{isGood ? '¡Excelente racha!' : 'Alerta de rendimiento'}</h2>
                        <p className={s.resultFraction}>{correctas} de 5 correctas en esta ronda.</p>
                        <p className={s.resultMessage}>
                          {isGood 
                            ? 'Vas por muy buen camino. Sigue con este ritmo.' 
                            : 'Cuidado, tu porcentaje está cayendo. Concéntrate más en las próximas.'}
                        </p>
                        <Button variant={isGood ? 'primary' : 'orange'} fullWidth onClick={handleContinueMilestone}>
                          Continuar misión →
                        </Button>
                      </>
                    );
                  })()}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
