import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, Circle, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { errores as erroresApi, flashcards as flashcardsApi } from '../../services/api';
import { useMaterias } from '../../hooks/useMaterias';
import { staggerContainer, fadeUp } from '../../lib/animations';
import { Badge } from '../../components/ui/Badge';
import { toast } from 'sonner';
import s from './Errores.module.css';

export function ErroresPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: materiasData } = useMaterias();
  const materias = materiasData ?? [];

  const [filtroMateria, setFiltroMateria] = useState('');
  const [filtroTema, setFiltroTema] = useState('');
  const [filtroRevisado, setFiltroRevisado] = useState<'todos' | 'revisados' | 'pendientes'>('todos');
  const [page, setPage] = useState(1);

  const params = {
    page,
    ...(filtroMateria ? { materiaId: filtroMateria } : {}),
    ...(filtroTema ? { tema: filtroTema } : {}),
    ...(filtroRevisado === 'revisados' ? { revisado: true } : {}),
    ...(filtroRevisado === 'pendientes' ? { revisado: false } : {}),
  };

  const { data, isLoading } = useQuery({
    queryKey: ['errores', params],
    queryFn: () => erroresApi.list(params),
  });

  const marcarRevisadoMutation = useMutation({
    mutationFn: ({ id, revisado }: { id: string; revisado: boolean }) =>
      erroresApi.marcarRevisado(id, revisado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['errores'] });
    },
  });

  const crearFlashcardMutation = useMutation({
    mutationFn: ({ frente, dorso, preguntaId, materiaId }: { frente: string; dorso: string; preguntaId: string; materiaId: string }) =>
      flashcardsApi.create({ frente, dorso, preguntaId, materiaId }),
    onSuccess: () => {
      toast.success('Flashcard creado', { description: 'Puedes verlo en la sección Flashcards' });
    },
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;
  const revisados = items.filter((i) => i.revisado).length;

  function handleRevisado(id: string, revisado: boolean) {
    marcarRevisadoMutation.mutate({ id, revisado: !revisado });
  }

  function handleCrearFlashcard(item: typeof items[0]) {
    const opcionCorrecta = item.pregunta.opciones.find((o) => o.esCorrecta);
    crearFlashcardMutation.mutate({
      frente: item.pregunta.enunciado,
      dorso: opcionCorrecta?.texto ?? 'Respuesta correcta',
      preguntaId: item.pregunta.id,
      materiaId: item.pregunta.materia.id,
    });
  }

  function handleRefazer(item: typeof items[0]) {
    navigate(`/practice/${item.pregunta.materia.id}`);
  }

  return (
    <div className={s.page}>
      {/* Header */}
      <div className={s.header}>
        <div>
          <h1 className={s.title}>Cuaderno de Errores</h1>
          <p className={s.subtitle}>
            Revisa y repasa las preguntas que fallaste.
            {total > 0 && <span className={s.totalBadge}>{total} errores guardados</span>}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className={s.filtros}>
        <select
          className={s.filtroSelect}
          value={filtroMateria}
          onChange={(e) => { setFiltroMateria(e.target.value); setPage(1); }}
        >
          <option value="">Todas las materias</option>
          {materias.map((m) => (
            <option key={m.id} value={m.id}>{m.nombre}</option>
          ))}
        </select>

        <input
          className={s.filtroInput}
          type="text"
          placeholder="Buscar por tema..."
          value={filtroTema}
          onChange={(e) => { setFiltroTema(e.target.value); setPage(1); }}
        />

        <div className={s.filtroTabs}>
          {(['todos', 'pendientes', 'revisados'] as const).map((tab) => (
            <button
              key={tab}
              className={`${s.filtroTab} ${filtroRevisado === tab ? s.filtroTabActive : ''}`}
              onClick={() => { setFiltroRevisado(tab); setPage(1); }}
            >
              {tab === 'todos' ? 'Todos' : tab === 'pendientes' ? 'Sin revisar' : 'Revisados'}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className={s.skeletonList}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={s.skeletonCard} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && items.length === 0 && (
        <div className={s.emptyState}>
          <BookOpen size={40} color="var(--text-3)" />
          <p className={s.emptyTitle}>
            {total === 0 && !filtroMateria && !filtroTema
              ? '¡Sin errores registrados!'
              : 'No se encontraron errores con estos filtros'}
          </p>
          <p className={s.emptyDesc}>
            {total === 0 && !filtroMateria && !filtroTema
              ? 'Cuando falles una pregunta en la práctica, aparecerá aquí para que puedas repasarla.'
              : 'Prueba con otros filtros.'}
          </p>
          {total === 0 && (
            <button className={s.emptyBtn} onClick={() => navigate('/practice')}>
              Ir a practicar
            </button>
          )}
        </div>
      )}

      {/* Lista */}
      {!isLoading && items.length > 0 && (
        <>
          {items.length > 0 && (
            <div className={s.progressBar}>
              <span className={s.progressLabel}>{revisados} de {items.length} revisados en esta página</span>
              <div className={s.progressTrack}>
                <div className={s.progressFill} style={{ width: `${items.length > 0 ? (revisados / items.length) * 100 : 0}%` }} />
              </div>
            </div>
          )}

          <motion.div
            className={s.list}
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {items.map((item) => {
              const opcionCorrecta = item.pregunta.opciones.find((o) => o.esCorrecta);
              const opcionElegida = item.opcion;

              return (
                <motion.div key={item.id} variants={fadeUp} className={`${s.card} ${item.revisado ? s.cardRevisado : ''}`}>
                  {/* Card header */}
                  <div className={s.cardHeader}>
                    <div className={s.cardMeta}>
                      <Badge
                        variant={item.pregunta.materia.fase === 'GENERAL' ? 'general' : 'especifica'}
                        size="sm"
                      >
                        {item.pregunta.materia.nombre}
                      </Badge>
                      {item.pregunta.tema && (
                        <span className={s.tema}>{item.pregunta.tema}</span>
                      )}
                      <span className={s.fecha}>
                        {new Date(item.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    <button
                      className={`${s.revisadoBtn} ${item.revisado ? s.revisadoBtnActive : ''}`}
                      onClick={() => handleRevisado(item.id, item.revisado)}
                      title={item.revisado ? 'Marcar como sin revisar' : 'Marcar como revisado'}
                    >
                      {item.revisado ? <CheckCircle size={18} /> : <Circle size={18} />}
                      <span>{item.revisado ? 'Revisado' : 'Revisar'}</span>
                    </button>
                  </div>

                  {/* Pregunta */}
                  <p className={s.enunciado}>{item.pregunta.enunciado}</p>

                  {/* Respuestas */}
                  {item.pregunta.tipo === 'TEST' && (
                    <div className={s.respuestas}>
                      <div className={s.respuestaElegida}>
                        <span className={s.respuestaLabel}>Tu respuesta</span>
                        <span className={s.respuestaTexto}>{opcionElegida?.texto ?? '—'}</span>
                      </div>
                      <div className={s.respuestaCorrecta}>
                        <span className={s.respuestaLabel}>Respuesta correcta</span>
                        <span className={s.respuestaTexto}>{opcionCorrecta?.texto ?? '—'}</span>
                      </div>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className={s.cardActions}>
                    <button className={s.actionBtn} onClick={() => handleRefazer(item)}>
                      <RotateCcw size={14} />
                      Practicar esta materia
                    </button>
                    <button
                      className={s.actionBtnSecondary}
                      onClick={() => handleCrearFlashcard(item)}
                      disabled={crearFlashcardMutation.isPending}
                    >
                      + Crear flashcard
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Paginación */}
          {pages > 1 && (
            <div className={s.pagination}>
              <button
                className={s.pageBtn}
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              <span className={s.pageInfo}>Página {page} de {pages}</span>
              <button
                className={s.pageBtn}
                disabled={page === pages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
