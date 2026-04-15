import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Timer, Zap, BookOpen, Play, X, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { sesiones as sesionesApi } from '../../services/api';
import { useMaterias } from '../../hooks/useMaterias';
import s from './Simulacros.module.css';

export function SimulacrosPage() {
  const navigate = useNavigate();
  const { data: materiasData } = useMaterias();
  const materias = materiasData ?? [];
  
  const [showSetup, setShowSetup] = useState<'subject' | 'custom' | null>(null);
  const [selectedMateria, setSelectedMateria] = useState('');
  const [customQuestions, setCustomQuestions] = useState(20);
  const [customTime, setCustomTime] = useState(30); // minutes

  const iniciarMutation = useMutation({
    mutationFn: ({ materiaId, limit, time }: { materiaId?: string, limit: number, time?: number }) => 
      sesionesApi.iniciar(materiaId || (materias[0]?.id as string) || '1', {
        tipo: 'TEST',
        totalPreguntas: limit,
      }),
    onSuccess: (data, variables) => {
      const timeInSec = (variables.time || 45) * 60;
      navigate(`/practice/${variables.materiaId || '1'}/session?simulacro=true&duracion=${timeInSec}`);
    },
  });

  function handleSimulacroRapido() {
    iniciarMutation.mutate({ limit: 25, time: 45 });
  }

  function handleSimulacroMateria() {
    if (!selectedMateria) return;
    iniciarMutation.mutate({ materiaId: selectedMateria, limit: 30, time: 60 });
  }

  function handleSimulacroCustom() {
    iniciarMutation.mutate({ limit: customQuestions, time: customTime });
  }

  return (
    <div className={s.page}>
      <header className={s.header}>
        <h1 className={s.title}>Simulacros Oficiales</h1>
        <p className={s.subtitle}>Evalúa tu nivel real con exámenes cronometrados bajo presión.</p>
      </header>

      <div className={s.grid}>
        
        {/* Simulacro Rápido */}
        <div className={s.card}>
          <div className={s.cardIcon} style={{ background: 'var(--blue-soft)', color: 'var(--blue)' }}>
            <Zap size={24} />
          </div>
          <h2 className={s.cardTitle}>Simulacro Rápido</h2>
          <p className={s.cardDesc}>
            Una prueba equilibrada con preguntas aleatorias de todas tus materias. Ideal para repasar bajo presión.
          </p>
          <div className={s.cardMeta}>
            <span className={s.metaItem}><Timer size={16} /> 45 min</span>
            <span className={s.metaItem}><BookOpen size={16} /> 25 q.</span>
          </div>
          <button 
            className={s.cardAction} 
            onClick={handleSimulacroRapido}
            disabled={iniciarMutation.isPending}
            style={{ background: 'var(--blue)' }}
          >
            <Play size={18} fill="currentColor" /> Comenzar
          </button>
        </div>

        {/* Simulacro por Materia */}
        <div className={s.card}>
          <div className={s.cardIcon}>
            <BookOpen size={24} color="#8B5CF6" />
          </div>
          <h2 className={s.cardTitle}>Por Materia</h2>
          <p className={s.cardDesc}>
            Enfócate en perfeccionar una asignatura específica. Tú eliges la materia, nosotros ponemos el reloj.
          </p>
          <div className={s.cardMeta}>
            <span className={s.metaItem}><Timer size={16} /> 60 min</span>
            <span className={s.metaItem}><BookOpen size={16} /> 30 q.</span>
          </div>
          <button 
            className={s.cardAction}
            onClick={() => setShowSetup('subject')}
          >
            <Settings2 size={18} /> Configurar
          </button>

          <AnimatePresence>
            {showSetup === 'subject' && (
              <motion.div 
                className={s.setupOverlay}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
              >
                <div className={s.setupHeader}>
                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>Elige una materia</h3>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }} onClick={() => setShowSetup(null)}>
                    <X size={20} />
                  </button>
                </div>
                
                <select 
                  className={s.selectMateria}
                  value={selectedMateria}
                  onChange={(e) => setSelectedMateria(e.target.value)}
                >
                  <option value="" disabled>Selecciona materia...</option>
                  {materias.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>

                <button 
                  className={s.cardAction}
                  style={{ background: 'var(--text)', color: 'white', width: '100%', marginTop: 'auto' }}
                  disabled={!selectedMateria || iniciarMutation.isPending}
                  onClick={handleSimulacroMateria}
                >
                  <Play size={18} fill="currentColor" /> Iniciar ahora
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Simulacro Mixto (NEW) */}
        <div className={s.card}>
          <div className={s.cardIcon}>
            <Zap size={24} color="#F59E0B" />
          </div>
          <h2 className={s.cardTitle}>Simulacro Mixto</h2>
          <p className={s.cardDesc}>
            Combina preguntas de todas tus materias activas. La mejor forma de simular el día del examen real.
          </p>
          <div className={s.cardMeta}>
            <span className={s.metaItem}><Timer size={16} /> 90 min</span>
            <span className={s.metaItem}><BookOpen size={16} /> 50 q.</span>
          </div>
          <button 
            className={s.cardAction} 
            onClick={() => iniciarMutation.mutate({ limit: 50, time: 90 })}
            disabled={iniciarMutation.isPending}
          >
            <Play size={18} fill="currentColor" /> Comenzar
          </button>
        </div>

        {/* Simulacro Personalizado */}
        <div className={s.card}>
          <div className={s.cardIcon}>
            <Settings2 size={24} color="#10B981" />
          </div>
          <h2 className={s.cardTitle}>Personalizado</h2>
          <p className={s.cardDesc}>
            Define tus propias reglas. Elige la cantidad de preguntas y el tiempo que creas necesario para tu entreno.
          </p>
          <div className={s.cardMeta}>
            <span className={s.metaItem}><Timer size={16} /> {customTime} min</span>
            <span className={s.metaItem}><BookOpen size={16} /> {customQuestions} q.</span>
          </div>
          <button 
            className={s.cardAction}
            onClick={() => setShowSetup('custom')}
          >
            <Settings2 size={18} /> Personalizar
          </button>

          <AnimatePresence>
            {showSetup === 'custom' && (
              <motion.div 
                className={s.setupOverlay}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              >
                <div className={s.setupHeader}>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>Configuración</h3>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }} onClick={() => setShowSetup(null)}>
                    <X size={20} />
                  </button>
                </div>
                
                <div className={s.customSetupRow}>
                  <label className={s.setupLabel}>
                    Preguntas: <span>{customQuestions}</span>
                  </label>
                  <input 
                    type="range" min="10" max="100" step="5"
                    className={s.rangeInput}
                    value={customQuestions}
                    onChange={e => setCustomQuestions(parseInt(e.target.value))}
                  />
                </div>

                <div className={s.customSetupRow}>
                  <label className={s.setupLabel}>
                    Tiempo: <span>{customTime} min</span>
                  </label>
                  <div className={s.btnGroup}>
                    {[15, 30, 45, 60, 90].map(t => (
                      <button 
                        key={t}
                        className={`${s.btnOption} ${customTime === t ? s.btnOptionActive : ''}`}
                        onClick={() => setCustomTime(t)}
                      >
                        {t}'
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  className={s.cardAction}
                  style={{ background: '#EF4444', width: '100%', marginTop: 'auto' }}
                  disabled={iniciarMutation.isPending}
                  onClick={handleSimulacroCustom}
                >
                  <Play size={18} fill="currentColor" /> Iniciar Prueba
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

