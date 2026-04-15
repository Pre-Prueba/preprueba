import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Materia } from '../../types';

export function QuestionSelector({ materias }: { materias: Materia[] }) {
  const [selectedMateria, setSelectedMateria] = useState('');
  const [tema, setTema] = useState('');
  const [cantidad, setCantidad] = useState(10);
  const navigate = useNavigate();

  const handleStart = () => {
    if (!selectedMateria) return;
    const url = `/practice/${selectedMateria}?tema=${encodeURIComponent(tema)}&cantidad=${cantidad}`;
    navigate(url);
  };

  return (
    <div style={{ background: 'white', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
      <div style={{ marginBottom: '16px' }}>
        <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', letterSpacing: '0.1em', textTransform: 'uppercase' }}>CONFIGURAR PRÁCTICA</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>MATERIA</label>
          <select 
            value={selectedMateria} 
            onChange={(e) => setSelectedMateria(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#1e293b', fontFamily: 'inherit', fontWeight: 600 }}
          >
            <option value="">Selecciona materia...</option>
            {materias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
        </div>

        <div>
           <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>TEMA ESPECÍFICO (Opcional)</label>
          <input 
            type="text" 
            placeholder="Ej: Biología Celular..." 
            value={tema} 
            onChange={(e) => setTema(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#1e293b', fontFamily: 'inherit' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>CANTIDAD: {cantidad} PREGUNTAS</label>
          <input 
            type="range" 
            min="5" max="50" step="5"
            value={cantidad} 
            onChange={(e) => setCantidad(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#f97316' }}
          />
        </div>

        <button 
          onClick={handleStart}
          disabled={!selectedMateria}
          style={{
            background: !selectedMateria ? '#cbd5e1' : '#2563eb',
            color: '#fff',
            border: 'none',
            padding: '16px',
            borderRadius: '16px',
            fontWeight: 800,
            letterSpacing: '0.05em',
            cursor: !selectedMateria ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s, transform 0.15s',
            boxShadow: !selectedMateria ? 'none' : '0 10px 20px rgba(37,99,235,0.2)'
          }}
        >
          INICIAR PRÁCTICA →
        </button>
      </div>
    </div>
  );
}
