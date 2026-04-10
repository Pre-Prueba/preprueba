import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { sesiones as sesionesApi } from '../../services/api';
import type { Pregunta, RespuestaResult, SesionFinalizada } from '../../types';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { fadeUp, staggerContainer, slideInRight } from '../../lib/animations';
import s from './Practice.module.css';

type PracticeState = 'loading' | 'question' | 'feedback' | 'result';

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

  const [state, setState] = useState<PracticeState>('loading');
  const [sesionId, setSesionId] = useState('');
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOpcion, setSelectedOpcion] = useState<string | null>(null);
  const [respuestaTexto, setRespuestaTexto] = useState('');
  const [feedback, setFeedback] = useState<RespuestaResult | null>(null);
  const [resultado, setResultado] = useState<SesionFinalizada | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    if (!materiaId) return;
    let cancelled = false;

    async function cargar() {
      try {
        const data = await sesionesApi.iniciar(materiaId!);
        if (cancelled) return;
        setSesionId(data.sesionId);
        setPreguntas(data.preguntas);
        setState('question');
      } catch (err) {
        if (cancelled) return;
        if (isSubscriptionRequiredError(err)) {
          navigate('/checkout', { replace: true });
          return;
        }
        setError('No se pudo cargar la práctica. Inténtalo de nuevo.');
      }
    }

    cargar();
    return () => { cancelled = true; };
  }, [materiaId, navigate]);

  const currentPregunta = preguntas[currentIndex];
  const progress = preguntas.length > 0 ? (currentIndex / preguntas.length) * 100 : 0;

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
      setFeedback(result);
      setState('feedback');
    } catch {
      setError('Error al corregir la respuesta. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSiguiente() {
    if (currentIndex + 1 >= preguntas.length) {
      try {
        const result = await sesionesApi.finalizar(sesionId);
        setResultado(result);
        setState('result');
      } catch {
        setError('Error al finalizar la sesión. Inténtalo de nuevo.');
      }
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOpcion(null);
      setRespuestaTexto('');
      setFeedback(null);
      startTime.current = Date.now();
      setState('question');
    }
  }

  /* ── Error global */
  if (error && state === 'loading') {
    return (
      <div className={s.loadingContainer}>
        <p style={{ color: 'var(--error)', marginBottom: '16px' }}>{error}</p>
        <Button onClick={() => navigate('/dashboard')}>Volver al inicio</Button>
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

  return (
    <div className={s.pageContainer}>
      {/* ── Header */}
      <header className={s.header}>
        <div className={s.headerContent}>
          <div className={s.headerInfo}>
            <span className={s.headerTitle}>Práctica</span>
            <span className={s.headerCount}>{currentIndex + 1} / {preguntas.length}</span>
            <button
              className={s.headerExit}
              onClick={() => navigate('/dashboard')}
              title="Salir"
              type="button"
            >
              <X size={18} />
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
                          {feedback.esCorrecta ? '¡Correcto! Te cuento el por qué.' : 'No pasa nada. Te lo explico rápido.'}
                        </p>
                      </div>
                    </div>
                    <p className={s.feedbackText}>{feedback.feedbackIA}</p>
                  </motion.div>

                  <motion.div variants={fadeUp} className={s.actionArea}>
                    <Button variant="primary" size="lg" fullWidth onClick={handleSiguiente}>
                      {currentIndex + 1 >= preguntas.length ? 'Ver resultados' : 'Siguiente pregunta'} →
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
