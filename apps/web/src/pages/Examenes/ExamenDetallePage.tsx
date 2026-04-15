import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Play, Calendar, Building2, HelpCircle } from 'lucide-react';
import { examenes as examenesApi, sesiones as sesionesApi } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import type { Examen } from '../../types';
import s from './Examenes.module.css';

export function ExamenDetallePage() {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();

  const { data: examen, isLoading: isLoadingExamen } = useQuery({
    queryKey: ['examen', key],
    queryFn: async () => {
      // The backend groups exams by key, so we need to fetch all and find it
      // or we can just fetch the questions for this key directly 
      // but we might need the examen metadata. Let's fetch questions and build meta.
      const preguntas = await examenesApi.preguntas(key!);
      if (!preguntas || preguntas.length === 0) return null;
      
      const p = preguntas[0];
      return {
        key: key!,
        materiaId: p.materiaId,
        materia: p.materia,
        anio: p.anio,
        comunidad: p.comunidad,
        universidad: p.universidad,
        totalPreguntas: preguntas.length,
        preguntas: preguntas
      };
    },
    enabled: !!key,
  });

  const iniciarMutation = useMutation({
    mutationFn: () => sesionesApi.iniciar({
      materiaId: examen!.materiaId,
      tipo: 'TEST',
      totalPreguntas: examen!.totalPreguntas,
    }),
    onSuccess: (data) => {
      navigate(`/practice/${examen!.materiaId}/session?duracion=5400`);
    },
  });

  if (isLoadingExamen) {
    return <div className={s.page}><div className={s.skeletonCard} style={{height: 300}} /></div>;
  }

  if (!examen) {
    return (
      <div className={s.page}>
        <div className={s.emptyState}>
          <p className={s.emptyTitle}>Examen no encontrado</p>
          <button className={s.emptyBtn} onClick={() => navigate('/examenes')}>Volver a la lista</button>
        </div>
      </div>
    );
  }

  return (
    <div className={s.page}>
      <button className={s.backBtn} onClick={() => navigate('/examenes')}>
        <ArrowLeft size={16} /> Volver a exámenes
      </button>

      <div className={s.detalleHeader}>
        <h1 className={s.title}>
          Examen {examen.materia?.nombre || 'General'}
        </h1>
        <div className={s.detalleMetaRow}>
          {examen.comunidad && (
            <div className={s.detalleMeta}><Building2 size={16} /> {examen.comunidad}</div>
          )}
          {examen.anio && (
            <div className={s.detalleMeta}><Calendar size={16} /> {examen.anio}</div>
          )}
          <div className={s.detalleMeta}><HelpCircle size={16} /> {examen.totalPreguntas} preguntas</div>
        </div>
        
        <button 
          className={s.startExamBtn}
          onClick={() => iniciarMutation.mutate()}
          disabled={iniciarMutation.isPending}
        >
          <Play fill="currentColor" size={20} />
          {iniciarMutation.isPending ? 'Iniciando...' : 'Iniciar Examen (90 min)'}
        </button>
      </div>

      <div className={s.previewSection}>
        <h2 className={s.previewTitle}>Vista previa de preguntas</h2>
        <div className={s.preguntaList}>
          {examen.preguntas.map((p, i) => (
            <div key={p.id} className={s.preguntaPreview}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-2)' }}>Pregunta {i + 1}</span>
                {p.tema && <Badge variant="general" size="sm">{p.tema}</Badge>}
              </div>
              <p style={{ color: 'var(--text)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, overflow: 'hidden', WebkitBoxOrient: 'vertical' }}>
                {p.enunciado}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
