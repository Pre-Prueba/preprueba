import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import s from './PracticeSetup.module.css';

export function PracticeSetupPage() {
  const { materiaId } = useParams<{ materiaId: string }>();
  const navigate = useNavigate();

  const [tipo, setTipo] = useState<'MIXTO' | 'TEST' | 'ABIERTA'>('MIXTO');
  const [codigo, setCodigo] = useState('');
  const [secundaria, setSecundaria] = useState('');

  function handleStart() {
    const params = new URLSearchParams();
    if (tipo !== 'MIXTO') params.set('tipo', tipo);
    if (codigo) params.set('codigo', codigo);
    if (secundaria) params.set('secundaria', secundaria);

    navigate(`/practice/${materiaId}/session?${params.toString()}`);
  }

  return (
    <div className={s.pageContainer}>
      <header className={s.header}>
        <div className={s.headerContent}>
          <h1 className={s.title}>Configurar Práctica</h1>
        </div>
      </header>
      <main className={s.main}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={s.card}>
          <h2 className={s.cardTitle}>Opciones de sesión</h2>
          
          <div className={s.formGroup}>
            <label>Tipo de Pregunta</label>
            <div className={s.buttonGroup}>
              <button 
                className={tipo === 'MIXTO' ? s.active : ''} 
                onClick={() => setTipo('MIXTO')}
              >
                Mixto
              </button>
              <button 
                className={tipo === 'TEST' ? s.active : ''} 
                onClick={() => setTipo('TEST')}
              >
                Test
              </button>
              <button 
                className={tipo === 'ABIERTA' ? s.active : ''} 
                onClick={() => setTipo('ABIERTA')}
              >
                Abierta
              </button>
            </div>
          </div>

          <div className={s.formGroup}>
            <label>Materia Secundaria (Opcional)</label>
            <select 
              value={secundaria} 
              onChange={e => setSecundaria(e.target.value)}
              className={s.input}
            >
              <option value="">Ninguna</option>
              <option value="matematicas">Matemáticas</option>
              <option value="literatura">Literatura</option>
              <option value="historia">Historia</option>
            </select>
          </div>

          <div className={s.formGroup}>
            <label>Código Específico (Convocatoria Anterior)</label>
            <input 
              type="text" 
              placeholder="Ej: 2024-C" 
              value={codigo}
              onChange={e => setCodigo(e.target.value)}
              className={s.input}
            />
          </div>

          <div className={s.actionArea}>
            <Button variant="secondary" onClick={() => navigate('/dashboard')} fullWidth>
              Cancelar
            </Button>
            <Button variant="orange" onClick={handleStart} fullWidth>
              Comenzar Práctica →
            </Button>
          </div>
        </motion.div>

        {/* ── Simulado Final Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className={s.simuladoCard}
        >
          <div className={s.simuladoInfo}>
            <h3>Simulado Final</h3>
            <p>25 questões aleatórias. Mix de Teste e Discursivas. Temporizador ativado.</p>
          </div>
          <Button variant="primary" onClick={() => navigate(`/practice/${materiaId}/session?simulado=true`)}>
            Iniciar Simulado ✨
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
