import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Star, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { favoritos as favoritosApi } from '../../services/api';
import { useMaterias } from '../../hooks/useMaterias';
import { staggerContainer, fadeUp } from '../../lib/animations';
import { Badge } from '../../components/ui/Badge';
import s from './Favoritos.module.css';

export function FavoritosPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: materiasData } = useMaterias();
  const materias = materiasData ?? [];
  const [filtroMateria, setFiltroMateria] = useState('');

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['favoritos', filtroMateria],
    queryFn: () => favoritosApi.list(filtroMateria ? { materiaId: filtroMateria } : undefined),
  });

  const removeMutation = useMutation({
    mutationFn: (preguntaId: string) => favoritosApi.remove(preguntaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoritos'] });
    },
  });

  return (
    <div className={s.page}>
      {/* Header */}
      <div className={s.header}>
        <div>
          <h1 className={s.title}>Favoritos</h1>
          <p className={s.subtitle}>
            Preguntas que guardaste para repasar.
            {items.length > 0 && <span className={s.totalBadge}>{items.length} guardadas</span>}
          </p>
        </div>
        {items.length > 0 && (
          <button
            className={s.practicarBtn}
            onClick={() => navigate('/practice')}
          >
            <BookOpen size={16} />
            Practicar
          </button>
        )}
      </div>

      {/* Filtro */}
      <div className={s.filtros}>
        <select
          className={s.filtroSelect}
          value={filtroMateria}
          onChange={(e) => setFiltroMateria(e.target.value)}
        >
          <option value="">Todas las materias</option>
          {materias.map((m) => (
            <option key={m.id} value={m.id}>{m.nombre}</option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className={s.skeletonList}>
          {[1, 2, 3].map((i) => <div key={i} className={s.skeletonCard} />)}
        </div>
      )}

      {/* Empty */}
      {!isLoading && items.length === 0 && (
        <div className={s.emptyState}>
          <Star size={40} color="var(--text-3)" />
          <p className={s.emptyTitle}>Sin favoritos todavía</p>
          <p className={s.emptyDesc}>
            Durante la práctica, marca una pregunta con ★ para guardarla aquí.
          </p>
          <button className={s.emptyBtn} onClick={() => navigate('/practice')}>
            Ir a practicar
          </button>
        </div>
      )}

      {/* Grid */}
      {!isLoading && items.length > 0 && (
        <motion.div
          className={s.grid}
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {items.map((item) => {
            const opcionCorrecta = item.pregunta.opciones.find((o) => o.esCorrecta);
            return (
              <motion.div key={item.id} variants={fadeUp} className={s.card}>
                <div className={s.cardHeader}>
                  <Badge
                    variant={item.pregunta.materia.fase === 'GENERAL' ? 'general' : 'especifica'}
                    size="sm"
                  >
                    {item.pregunta.materia.nombre}
                  </Badge>
                  <button
                    className={s.desfavoritarBtn}
                    onClick={() => removeMutation.mutate(item.preguntaId)}
                    title="Eliminar de favoritos"
                  >
                    <Star size={16} fill="currentColor" />
                  </button>
                </div>
                <p className={s.enunciado}>{item.pregunta.enunciado}</p>
                {opcionCorrecta && (
                  <div className={s.respuesta}>
                    <span className={s.respuestaLabel}>Respuesta</span>
                    <span className={s.respuestaTexto}>{opcionCorrecta.texto}</span>
                  </div>
                )}
                <button
                  className={s.practicarMateriaBtn}
                  onClick={() => navigate(`/practice/${item.pregunta.materia.id}`)}
                >
                  Practicar esta materia →
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
