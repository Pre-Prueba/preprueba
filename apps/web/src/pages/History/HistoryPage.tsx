import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ChevronRight, BookOpen } from 'lucide-react';
import { sesiones as sesionesApi } from '../../services/api';
import { staggerContainer, listItem } from '../../lib/animations';
import s from './History.module.css';

interface SessionListItem {
  id: string;
  materia: { nombre: string };
  totalPreguntas: number;
  aciertos: number;
  duracionSegundos: number;
  createdAt: string;
}

export function HistoryPage() {
  const navigate = useNavigate();
  const [sesiones, setSesiones] = useState<SessionListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await sesionesApi.historial();
      setSesiones(data);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getScoreClass = (pct: number) => {
    if (pct >= 80) return s.scoreHigh;
    if (pct >= 50) return s.scoreMid;
    return s.scoreLow;
  };

  if (loading) {
    return (
      <div className={s.historyPage}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            border: '2.5px solid var(--border)',
            borderTopColor: 'var(--blue)',
            animation: 'spin 0.9s linear infinite',
          }} />
        </div>
      </div>
    );
  }

  return (
    <div className={s.historyPage}>
      <motion.div variants={staggerContainer} initial="hidden" animate="show">
        
        <header className={s.header}>
          <h1 className={s.title}>Historial de Prácticas</h1>
          <p className={s.subtitle}>Revisa tu desempeño y feedback de sesiones pasadas.</p>
        </header>

        <div className={s.list}>
          {sesiones.length > 0 ? (
            sesiones.map((sesion) => {
              const pct = Math.round((sesion.aciertos / sesion.totalPreguntas) * 100);
              return (
                <motion.div
                  key={sesion.id}
                  variants={listItem}
                  className={s.sessionCard}
                  onClick={() => navigate(`/history/${sesion.id}`)}
                >
                  <div className={s.sessionInfo}>
                    <h3>{sesion.materia.nombre}</h3>
                    <div className={s.sessionMeta}>
                      <span>
                        <Clock size={14} /> 
                        {formatDate(sesion.createdAt)}
                      </span>
                      <span>
                        <BookOpen size={14} /> 
                        {sesion.totalPreguntas} preguntas
                      </span>
                    </div>
                  </div>
                  
                  <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                    <div className={`${s.scoreBadge} ${getScoreClass(pct)}`}>
                      {pct}%
                    </div>
                    <ChevronRight size={18} color="var(--text-3)" />
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className={s.empty}>
              <p>Aún no has completado ninguna sesión de práctica.</p>
              <button 
                onClick={() => navigate('/dashboard')} 
                style={{
                  marginTop: '16px', color: 'var(--blue)', fontWeight: 600, 
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Comenzar ahora →
              </button>
            </div>
          )}
        </div>

      </motion.div>
    </div>
  );
}
