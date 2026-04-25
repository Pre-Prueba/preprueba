import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layers, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { flashcards as flashcardsApi } from '../../services/api';
import { useMaterias } from '../../hooks/useMaterias';
import { staggerContainer, fadeUp } from '../../lib/animations';
import { FlashcardStudyMode } from './FlashcardStudyMode';
import s from './Flashcards.module.css';

export function FlashcardsPage() {
  const queryClient = useQueryClient();
  const { data: materiasData } = useMaterias();
  const materias = materiasData ?? [];

  const [filtroMateria, setFiltroMateria] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'pendiente' | 'facil' | 'dificil'>('todos');
  const [isStudying, setIsStudying] = useState(false);
  const pendingDeleteRef = useRef<{ timeout: ReturnType<typeof setTimeout> } | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['flashcards', filtroMateria, filtroEstado],
    queryFn: () => flashcardsApi.list({
      ...(filtroMateria ? { materiaId: filtroMateria } : {}),
      ...(filtroEstado !== 'todos' ? { estado: filtroEstado } : {}),
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => flashcardsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    },
  });

  function handleDelete(item: typeof items[0]) {
    if (pendingDeleteRef.current) clearTimeout(pendingDeleteRef.current.timeout);

    // Otimistic delete
    const prevItems = items;
    queryClient.setQueryData(['flashcards', filtroMateria, filtroEstado], prevItems.filter((i: any) => i.id !== item.id));

    toast('Flashcard eliminada', {
      description: item.frente.slice(0, 40) + (item.frente.length > 40 ? '...' : ''),
      action: {
        label: 'Deshacer',
        onClick: () => {
          if (pendingDeleteRef.current) clearTimeout(pendingDeleteRef.current.timeout);
          queryClient.setQueryData(['flashcards', filtroMateria, filtroEstado], prevItems);
          toast.success('Flashcard restaurada');
        },
      },
      duration: 5000,
    });

    pendingDeleteRef.current = {
      timeout: setTimeout(() => {
        deleteMutation.mutate(item.id);
        pendingDeleteRef.current = null;
      }, 5000),
    };
  }

  return (
    <div className={s.page}>
      {/* Header */}
      <div className={s.header}>
        <div>
          <h1 className={s.title}>Flashcards</h1>
          <p className={s.subtitle}>
            Estudia conceptos clave con tarjetas de memoria.
            {items.length > 0 && <span className={s.totalBadge}>{items.length} tarjetas</span>}
          </p>
        </div>
        {items.length > 0 && (
          <button className={s.estudiarBtn} onClick={() => setIsStudying(true)}>
            <Layers size={18} />
            Estudiar Flashcards
          </button>
        )}
      </div>

      {/* Filtros */}
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

        <div className={s.filtroTabs}>
          {(['todos', 'pendiente', 'facil', 'dificil'] as const).map((tab) => (
            <button
              key={tab}
              className={`${s.filtroTab} ${filtroEstado === tab ? s.filtroTabActive : ''}`}
              onClick={() => setFiltroEstado(tab)}
            >
              {tab === 'todos' ? 'Todas' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className={s.skeletonList}>
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className={s.skeletonCard} />)}
        </div>
      )}

      {/* Empty */}
      {!isLoading && items.length === 0 && (
        <div className={s.emptyState}>
          <Layers size={40} color="var(--text-3)" />
          <p className={s.emptyTitle}>Sin flashcards</p>
          <p className={s.emptyDesc}>
            No tienes tarjetas con estos filtros. Puedes crear flashcards desde tus Errores o guardarlas manualmente.
          </p>
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
          {items.map((item) => (
            <motion.div key={item.id} variants={fadeUp} className={s.card}>
              <div className={s.cardMateria}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-2)', fontWeight: 600 }}>
                  {item.materia?.nombre || 'General'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className={`${s.cardEstado} ${s[`estado-${item.estado}`]}`}>
                    {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
                  </span>
                  <button
                    className={s.deleteBtn}
                    onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                    aria-label="Eliminar flashcard"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className={s.cardFrente}>{item.frente}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Study Mode Overlay */}
      {isStudying && items.length > 0 && (
        <FlashcardStudyMode 
          cards={items} 
          onClose={() => setIsStudying(false)} 
        />
      )}
    </div>
  );
}
