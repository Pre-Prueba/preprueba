import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  Sparkles, 
  RefreshCcw, 
  Calendar, 
  Target, 
  Play, 
  Plus, 
  Trash2, 
  X,
  MoreVertical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlanner, useToggleTask, useSuggestPlan, useSyncPlanner } from '../../hooks/usePlanner';
import { useMaterias } from '../../hooks/useMaterias';
import { staggerContainer, listItem, fadeUp } from '../../lib/animations';
import { useAuthStore } from '../../store/auth';
import s from './Planner.module.css';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const SUBJECT_COLORS: Record<string, string> = {
  'Lengua Castellana y Literatura': '#6366F1', // Indigo suave
  'Historia de España': '#F43F5E',             // Rose
  'Inglés': '#10B981',                         // Emerald
  'Biología': '#8B5CF6',                       // Violet
  'Química': '#06B6D4',                       // Cyan
  'Matemáticas Aplicadas a las CCSS': '#F59E0B', // Amber
  'Geografía': '#3B82F6',                     // Blue
  'Historia de la Filosofía': '#14B8A6',      // Teal
  'Historia del Arte': '#EC4899',             // Pink
  'Matemáticas': '#F97316',                   // Orange
  'Física': '#475569',                       // Slate
};

function getSubjectColor(nombre: string): string {
  return SUBJECT_COLORS[nombre] ?? '#64748B';
}

export function PlannerPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { data: tasks = [], isLoading: loading } = usePlanner();
  const { data: materias = [] } = useMaterias();
  
  const { mutate: toggleTask } = useToggleTask();
  const { mutate: suggestPlan, isPending: suggesting } = useSuggestPlan();
  const { mutate: syncPlanner } = useSyncPlanner();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedMateria, setSelectedMateria] = useState('');

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['planner'] });
  };

  const openAddTask = (dayIdx: number) => {
    setSelectedDay(dayIdx);
    setEditingTask(null);
    setSelectedMateria(materias[0]?.id || '');
    setIsModalOpen(true);
  };

  const openEditTask = (task: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask(task);
    setSelectedDay(task.diaSemana);
    setSelectedMateria(task.materiaId);
    setIsModalOpen(true);
  };

  const handleSaveTask = () => {
    let newTasks = [...tasks];
    const materia = materias.find(m => m.id === selectedMateria);

    if (editingTask) {
      newTasks = newTasks.map(t => t.id === editingTask.id ? { 
        ...t, 
        materiaId: selectedMateria, 
        diaSemana: selectedDay,
        materia: { ...t.materia, nombre: materia?.nombre || t.materia.nombre }
      } : t);
    } else {
      newTasks.push({
        id: Math.random().toString(36).substr(2, 9),
        materiaId: selectedMateria,
        diaSemana: selectedDay,
        completada: false,
        materia: { id: selectedMateria, nombre: materia?.nombre || 'Materia' }
      });
    }

    syncPlanner(newTasks);
    setIsModalOpen(false);
  };

  const handleDeleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTasks = tasks.filter(t => t.id !== id);
    syncPlanner(newTasks);
  };

  if (loading && tasks.length === 0) {
    return (
      <div className={s.plannerPage}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2.5px solid var(--border)', borderTopColor: 'var(--blue)', animation: 'spin 0.9s linear infinite' }} />
        </div>
      </div>
    );
  }

  const todayIdx = (new Date().getDay() + 6) % 7;
  const todayTasks = tasks.filter(t => t.diaSemana === todayIdx);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completada).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  function getDaysLeft(iso?: string) {
    if (!iso) return 0;
    const diff = new Date(iso).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
  
  function formatDate(iso?: string) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  const daysLeft = getDaysLeft(user?.fechaExamen);

  return (
    <div className={s.plannerPage}>
      <motion.div variants={staggerContainer} initial="hidden" animate="show">
        
        {/* ── Header */}
        <header className={s.header}>
          <div>
            <h1 className={s.title}>Mi Plan</h1>
            <p className={s.subtitle}>Organiza tus estudios y enfócate en tu objetivo principal.</p>
          </div>
          <div className={s.actions}>
            <button className={s.btnSecondary} onClick={handleRefresh} title="Actualizar">
              <RefreshCcw size={16} />
            </button>
            <button className={s.btnPrimary} onClick={() => suggestPlan()} disabled={suggesting}>
              <Sparkles size={16} />
              {suggesting ? 'Generando...' : 'IA de Estudios'}
            </button>
          </div>
        </header>

        {/* ── Top Section */}
        <div className={s.topSection}>
          <div className={s.objectiveCard}>
            <div className={s.cardHeader}>
              <Target size={18} color="var(--blue)" />
              Mi Objetivo
            </div>
            {user?.fechaExamen ? (
              <div className={s.objectiveContent}>
                <div className={s.objectiveDays}>
                  <span className={s.objectiveDaysNum}>{daysLeft}</span>
                  <span className={s.objectiveDaysLabel}>días restantes</span>
                </div>
                <div className={s.objectiveDetails}>
                  <div className={s.detailItem}>
                    <Calendar size={16} />
                    {formatDate(user?.fechaExamen)}
                  </div>
                  <div className={s.detailItem}>
                    <Target size={16} />
                    {user?.comunidad || 'Universidad de Destino'}
                  </div>
                </div>
              </div>
            ) : (
              <p style={{color: 'var(--text-3)', fontSize: 14}}>Configura la fecha de tu examen en los ajustes para ver tu progreso.</p>
            )}
          </div>

          <div className={s.recommendCard}>
            <div className={s.cardHeader}>
              <Sparkles size={18} color="var(--blue)" />
              Recomendado Hoy
            </div>
            {todayTasks.length > 0 ? (
              <>
                <p className={s.recommendText}>Tienes {todayTasks.length} metas planificadas para hoy. Mantener la racha es clave para el éxito.</p>
                <button className={s.btnPrimary} style={{alignSelf: 'flex-start'}} onClick={() => navigate('/practice')}>
                  <Play size={16} fill="currentColor" /> Comenzar repaso
                </button>
              </>
            ) : (
              <p className={s.recommendText}>No tienes tareas programadas para hoy. Tómate un descanso o adelanta temas pendientes.</p>
            )}
          </div>
        </div>

        {/* ── Weekly Progress */}
        <div className={s.weeklyProgress}>
          <div className={s.weeklyGoal}>
            Progreso semanal: {completedTasks} de {totalTasks} metas
          </div>
          <div className={s.weeklyBar}>
            <div className={s.weeklyBarFill} style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        {/* ── Grid */}
        <div className={s.grid}>
          {DAYS.map((dayName, diaIdx) => {
            const dayTasks = tasks.filter(t => t.diaSemana === diaIdx);
            const isToday = diaIdx === todayIdx;

            return (
              <motion.div 
                key={dayName} 
                variants={listItem}
                className={`${s.dayColumn} ${isToday ? s.today : ''}`}
              >
                <div className={s.dayHeader}>
                  <span className={s.dayName}>{dayName}</span>
                  {isToday && <span className={s.dayDate}>Hoy</span>}
                </div>

                <div className={s.tasksList}>
                  {dayTasks.map(task => (
                    <div 
                      key={task.id} 
                      className={`${s.taskItem} ${task.completada ? s.done : ''}`}
                      onClick={() => toggleTask({ id: task.id, completada: !task.completada })}
                      style={{ '--materia-color': getSubjectColor(task.materia.nombre) } as any}
                    >
                      <div className={s.checkbox}>
                        {task.completada && <Check size={12} color="white" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className={s.taskMain}>
                          <div className={s.materiaName}>{task.materia.nombre}</div>
                          <span className={s.faseBadge}>{task.materia.fase || 'Prioridad'}</span>
                        </div>
                      </div>
                      <div className={s.taskActions}>
                        <button className={s.editBtn} onClick={(e) => openEditTask(task, e)}>
                          <MoreVertical size={14} />
                        </button>
                        <button className={s.deleteBtn} onClick={(e) => handleDeleteTask(task.id, e)}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <button className={s.addTaskBtn} onClick={() => openAddTask(diaIdx)}>
                    <Plus size={14} />
                    Añadir meta
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

      </motion.div>

      {/* ── Modal Add/Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <div className={s.modalOverlay} onClick={() => setIsModalOpen(false)}>
            <motion.div 
              className={s.modal} 
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <div className={s.modalHeader}>
                <h3 className={s.modalTitle}>{editingTask ? 'Editar Meta' : 'Nueva Meta de Estudio'}</h3>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>
                  <X size={20} />
                </button>
              </div>

              <div className={s.formGroup}>
                <label className={s.label}>Materia</label>
                <select 
                  className={s.select} 
                  value={selectedMateria} 
                  onChange={e => setSelectedMateria(e.target.value)}
                >
                  {materias.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                  <option value="custom">General / Otro</option>
                </select>
              </div>

              <div className={s.formGroup}>
                <label className={s.label}>Día de la semana</label>
                <select 
                  className={s.select} 
                  value={selectedDay} 
                  onChange={e => setSelectedDay(Number(e.target.value))}
                >
                  {DAYS.map((d, i) => (
                    <option key={d} value={i}>{d}</option>
                  ))}
                </select>
              </div>

              <div className={s.modalActions}>
                <button className={s.btnSecondary} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button className={s.btnPrimary} onClick={handleSaveTask}>Guardar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

