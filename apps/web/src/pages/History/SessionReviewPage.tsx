import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Lightbulb, TrendingUp } from 'lucide-react';
import { sesiones as sesionesApi } from '../../services/api';
import { fadeUp, staggerContainer } from '../../lib/animations';
import s from './SessionReview.module.css';

interface SessionDetail {
  id: string;
  materia: { nombre: string };
  aciertos: number;
  totalPreguntas: number;
  createdAt: string;
  respuestas: Array<{
    id: string;
    esCorrecta: boolean;
    respuestaTexto: string | null;
    feedbackIA: string | null;
    pregunta: {
      enunciado: string;
      tipo: string;
      opciones: Array<{ id: string; texto: string; esCorrecta: boolean }>;
    };
  }>;
}

export function SessionReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sesion, setSesion] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadDetail();
  }, [id]);

  const loadDetail = async () => {
    try {
      const data = await sesionesApi.detalles(id!);
      setSesion(data);
    } catch (err) {
      console.error('Error loading session detail:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{padding: '40px'}}>Carregando revisão...</div>;
  if (!sesion) return <div style={{padding: '40px'}}>Sessão não encontrada.</div>;

  return (
    <div className={s.reviewPage}>
      <motion.div variants={staggerContainer} initial="hidden" animate="show">
        
        <button className={s.backBtn} onClick={() => navigate('/history')}>
          <ArrowLeft size={18} /> Voltar ao histórico
        </button>

        <header className={s.header}>
          <h1 className={s.title}>Revisão: {sesion.materia.nombre}</h1>
          <div className={s.metrics}>
            <span>{sesion.aciertos} / {sesion.totalPreguntas} acertos</span>
            <span>{new Date(sesion.createdAt).toLocaleDateString()}</span>
          </div>
        </header>

        <div className={s.questionList}>
          {sesion.respuestas.map((resp, idx) => {
            const feedback = resp.feedbackIA ? JSON.parse(resp.feedbackIA) : null;
            
            return (
              <motion.div key={resp.id} variants={fadeUp} className={s.questionItem}>
                <div className={s.questionHeader}>
                   <div style={{flex: 1}}>
                      <span className={s.label}>Questão {idx + 1}</span>
                      <p className={s.questionText}>{resp.pregunta.enunciado}</p>
                   </div>
                   <span className={`${s.statusIndicator} ${resp.esCorrecta ? s.statusCorrect : s.statusIncorrect}`}>
                      {resp.esCorrecta ? 'Correto' : 'Incorreto'}
                   </span>
                </div>

                <div className={s.userAnswer}>
                  <span className={s.label}>Sua Resposta</span>
                  <p className={s.answerContent}>
                    {resp.respuestaTexto || "Sem texto fornecido."}
                  </p>
                </div>

                {feedback && (
                  <div className={s.feedbackSection}>
                    <div style={{display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px'}}>
                      <Sparkles size={16} color="var(--color-primary)" />
                      <span style={{fontWeight: 700, fontSize: '13px', color: 'var(--color-primary)'}}>Explicação da IA</span>
                    </div>
                    <p style={{fontSize: '14px', lineHeight: 1.5, color: 'var(--text-primary)', marginBottom: '16px'}}>
                      {feedback.explicacion}
                    </p>

                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                       <div style={{background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
                          <span className={s.label} style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                            <Lightbulb size={12} /> Conceitos
                          </span>
                          <p style={{fontSize: '12px', color: 'var(--text-secondary)'}}>{feedback.conceptos}</p>
                       </div>
                       <div style={{background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
                          <span className={s.label} style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                            <TrendingUp size={12} /> Avaliação
                          </span>
                          <p style={{fontSize: '12px', color: 'var(--text-secondary)'}}>{feedback.valoracion}</p>
                       </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

      </motion.div>
    </div>
  );
}
