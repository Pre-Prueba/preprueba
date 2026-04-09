import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sesiones as sesionesApi } from '../../services/api';
import type { Pregunta, RespuestaResult, SesionFinalizada } from '../../types';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { ProgressBar } from '../../components/ui/ProgressBar';
import s from './Practice.module.css';

type PracticeState = 'loading' | 'question' | 'feedback' | 'result';

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
    
    // MOCK DATA PARA DEMONSTRAÇÃO VISUAL DO DESIGN
    setTimeout(() => {
      setSesionId('mock-session-' + Date.now());
      setPreguntas([
        { id: 'q1', materiaId, enunciado: '¿Cuál es el río más largo de la Península Ibérica?', tipo: 'TEST', opciones: [{ id: 'o1', texto: 'El río Tajo', correcta: true }, { id: 'o2', texto: 'El río Ebro', correcta: false }, { id: 'o3', texto: 'El río Duero', correcta: false }, { id: 'o4', texto: 'El río Guadiana', correcta: false }] },
        { id: 'q2', materiaId, enunciado: 'Explique brevemente las causas principales de la Guerra Civil Española.', tipo: 'OPEN', opciones: [] },
        { id: 'q3', materiaId, enunciado: 'Identifique el autor de la obra "Cien años de soledad".', tipo: 'TEST', opciones: [{ id: 'o1', texto: 'Mario Vargas Llosa', correcta: false }, { id: 'o2', texto: 'Gabriel García Márquez', correcta: true }, { id: 'o3', texto: 'Julio Cortázar', correcta: false }, { id: 'o4', texto: 'Jorge Luis Borges', correcta: false }] },
      ]);
      setState('question');
    }, 1500); // Simulate network delay for loading animation
    
  }, [materiaId]);

  const currentPregunta = preguntas[currentIndex];
  const progress = preguntas.length > 0 ? ((currentIndex) / preguntas.length) * 100 : 0;

  async function handleResponder() {
    if (!currentPregunta || submitting) return;
    setSubmitting(true);
    
    // MOCK DATA PARA FEEDBACK VISUAL
    setTimeout(() => {
      const isCorrect = currentPregunta.tipo === 'TEST' ? currentPregunta.opciones.find(o => o.id === selectedOpcion)?.correcta : true;
      const correctOptionId = currentPregunta.tipo === 'TEST' ? currentPregunta.opciones.find(o => o.correcta)?.id : undefined;
      
      setFeedback({
        esCorrecta: isCorrect ?? false,
        opcionCorrecta: correctOptionId ? { id: correctOptionId, texto: 'Correcta', correcta: true } : undefined,
        feedbackIA: isCorrect 
          ? '¡Excelente! Has identificado correctamente el concepto clave. Sigue así.' 
          : 'Casi. Recuerda que la IA analiza tu respuesta basándose en los principios fundamentales solicitados en este nivel de prueba.',
        tiempoRespuesta: 10
      });
      setState('feedback');
      setSubmitting(false);
    }, 1000); // simulate Claude API delay
  }

  async function handleSiguiente() {
    if (currentIndex + 1 >= preguntas.length) {
      // MOCK DATA END RESULT
      setResultado({
        sesionId,
        materiaId,
        aciertos: 2,
        errores: 1,
        totalPreguntas: 3,
        porcentaje: 66,
        tiempoTotal: 120
      });
      setState('result');
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOpcion(null);
      setRespuestaTexto('');
      setFeedback(null);
      startTime.current = Date.now();
      setState('question');
    }
  }

  if (error) {
    return (
      <div className={s.loadingContainer}>
        <p style={{ color: 'var(--color-error)' }}>{error}</p>
        <Button onClick={() => navigate('/dashboard')}>Volver al inicio</Button>
      </div>
    );
  }

  // Estado 1 — Cargando
  if (state === 'loading') {
    return (
      <div className={s.loadingContainer}>
        <div className={s.loadingSpinner} />
        <p className={s.loadingText}>Preparando tu sesión con IA...</p>
      </div>
    );
  }

  // Estado 4 — Resultado
  if (state === 'result' && resultado) {
    const pct = resultado.porcentaje;
    return (
      <div className={s.pageContainer} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className={s.resultCard}>
          <div className={s.resultEmojiWrapper}>
            <span className={s.resultEmoji}>
              {pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '💪'}
            </span>
            <div className={s.confetti} />
          </div>
          <h2 className={s.resultTitle}>Sesión completada</h2>
          
          <div className={s.scoreCircle}>
            <span className={s.scorePct}>{pct}%</span>
            <span className={s.scoreLabel}>Acierto</span>
          </div>
          
          <p className={s.resultFraction}>
            {resultado.aciertos} / {resultado.totalPreguntas} correctas
          </p>
          
          <p className={s.resultMessage}>
            {pct >= 70 ? '¡Excelente trabajo! Vas por muy buen camino para la prueba.' : '¡Sigue practicando! La constancia es la clave del éxito.'}
          </p>
          
          <div className={s.resultActions}>
            <Button variant="secondary" fullWidth onClick={() => navigate('/dashboard')}>← Inicio</Button>
            <Button fullWidth onClick={() => window.location.reload()}>Nueva sesión →</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPregunta) return null;

  return (
    <div className={s.pageContainer}>
      {/* Header con progreso */}
      <header className={s.header}>
        <div className={s.headerContent}>
          <div className={s.headerInfo}>
            <span className={s.headerTitle}>Materia {materiaId}</span>
            <span className={s.headerCount}>Pregunta {currentIndex + 1} de {preguntas.length}</span>
          </div>
          <ProgressBar value={progress} />
        </div>
      </header>

      {/* Contenido */}
      <main className={s.main}>
        <div className={s.contentWrapper}>
          
          {/* Estado 2 — Pregunta */}
          {state === 'question' && (
            <>
              <div className={s.questionCard}>
                <p className={s.questionText}>{currentPregunta.enunciado}</p>
              </div>

              {currentPregunta.tipo === 'TEST' ? (
                <div className={s.optionsList}>
                  {currentPregunta.opciones.map((opcion) => (
                    <button
                      key={opcion.id}
                      onClick={() => setSelectedOpcion(opcion.id)}
                      className={`${s.optionBtn} ${selectedOpcion === opcion.id ? s.selected : ''}`}
                    >
                      {opcion.texto}
                    </button>
                  ))}
                </div>
              ) : (
                <div className={s.textareaContainer}>
                  <textarea
                    className={s.textarea}
                    value={respuestaTexto}
                    onChange={(e) => setRespuestaTexto(e.target.value)}
                    placeholder="Escribe tu respuesta argumentada aquí..."
                  />
                  <span className={s.textareaCount}>{respuestaTexto.length} caracteres</span>
                </div>
              )}

              <div className={s.actionArea}>
                <Button
                  className={s.actionBtn + (submitting ? ` ${s.loading}` : '')}
                  disabled={currentPregunta.tipo === 'TEST' ? !selectedOpcion : !respuestaTexto.trim()}
                  onClick={handleResponder}
                  size="lg"
                  fullWidth
                >
                  {submitting ? 'Analizando con IA...' : 'Comprobar respuesta'} <span className={s.actionBtnArrow}>→</span>
                </Button>
              </div>
            </>
          )}

          {/* Estado 3 — Feedback */}
          {state === 'feedback' && feedback && (
            <>
              <div className={s.questionCard}>
                 <p className={s.questionText}>{currentPregunta.enunciado}</p>
              </div>

              <div className={s.optionsList}>
                {currentPregunta.tipo === 'TEST' && currentPregunta.opciones.map((opcion) => {
                  const isSelected = opcion.id === selectedOpcion;
                  const isCorrect = opcion.id === feedback.opcionCorrecta?.id;
                  
                  let feedbackClass = '';
                  if (isCorrect) feedbackClass = s.correct;
                  else if (isSelected && !feedback.esCorrecta) feedbackClass = s.incorrect;

                  return (
                    <div key={opcion.id} className={`${s.optionBtn} ${feedbackClass}`}>
                      {isCorrect && <span className={s.feedbackIcon}>✔️</span>}
                      {isSelected && !feedback.esCorrecta && !isCorrect && <span className={s.feedbackIcon}>❌</span>}
                      {opcion.texto}
                    </div>
                  );
                })}
              </div>

              <div className={s.aiExplanation}>
                <div className={s.aiHeader}>
                  <div className={s.aiIcon}>✨</div>
                  <span>Explicación de claude-sonnet</span>
                </div>
                <p className={s.aiText}>{feedback.feedbackIA}</p>
              </div>

              <div className={s.actionArea}>
                <Button className={s.actionBtn} size="lg" fullWidth onClick={handleSiguiente}>
                  {currentIndex + 1 >= preguntas.length ? 'Ver resultados' : 'Siguiente'} <span className={s.actionBtnArrow}>→</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
