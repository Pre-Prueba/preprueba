import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Heart, CheckCircle2, MoreHorizontal, Trash2, AlertTriangle, Repeat } from 'lucide-react';
import { forum as forumApi, materias as materiasApi } from '../../services/api';
import { useAuthStore } from '../../store/auth';
import type { ForumPost, Materia } from '../../types';
import { Button } from '../../components/ui/Button';
import { ReportModal } from './components/ReportModal';
import { staggerContainer, listItem } from '../../lib/animations';
import { PipoEmptyState } from '../../components/PipoMascot';
import { toast } from 'sonner';
import s from './Forum.module.css';

export function ForumPage() {
  const navigate = useNavigate();
  const { user, subscription } = useAuthStore();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [selectedMateria, setSelectedMateria] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState('');
  const [reportingPost, setReportingPost] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const isAdmin = user?.role === 'ADMIN';
  const isPremium = isAdmin || (subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING');

  const handleDelete = async (postId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este post permanentemente?')) return;
    try {
      await forumApi.deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success('Post eliminado correctamente.');
    } catch (err) {
      toast.error('Error al eliminar el post.');
    }
  };

  useEffect(() => {
    if (!isPremium) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [postsData, materiasData] = await Promise.all([
          forumApi.list({ materiaId: selectedMateria || undefined }),
          materiasApi.list()
        ]);
        setPosts(postsData);
        setMaterias(materiasData);
      } catch (err) {
        setError('Error al cargar la comunidad.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isPremium, selectedMateria]);

  if (!isPremium) {
    return (
      <div className={s.forumPage}>
        <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center' }}>
          <PipoEmptyState
            variant="focus"
            title="Comunidad Exclusiva"
            description="El foro es un espacio premium para resolver dudas, compartir resúmenes y estudiar en grupo con otros opositores."
            actionLabel="Suscribirme ahora"
            onAction={() => navigate('/checkout')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={s.forumPage}>
      <motion.div variants={staggerContainer} initial="hidden" animate="show">
        
        <header className={s.header}>
          <div>
            <h1 className={s.title}>Comunidad</h1>
            <p className={s.subtitle}>Resuelve dudas y comparte conocimientos con otros estudiantes.</p>
          </div>
          <Button variant="primary" onClick={() => navigate('/forum/new')}>
            <Plus size={18} /> Nuevo Tema
          </Button>
        </header>

        {/* Filters */}
        <div className={s.subjectFilters}>
           <button 
             className={`${s.filterBtn} ${!selectedMateria ? s.active : ''}`}
             onClick={() => setSelectedMateria(null)}
           >
             Todo
           </button>
           {materias.map(m => (
             <button 
                key={m.id}
                className={`${s.filterBtn} ${selectedMateria === m.id ? s.active : ''}`}
                onClick={() => setSelectedMateria(m.id)}
             >
               {m.nombre}
             </button>
           ))}
        </div>

        {loading ? (
          <div className={s.empty}>Cargando comunidad...</div>
        ) : (
          <div className={s.feed}>
            {posts.length > 0 ? (
              posts.map((post) => (
                <motion.div 
                  key={post.id} 
                  variants={listItem} 
                  className={s.postCard}
                  onClick={() => navigate(`/forum/${post.id}`)}
                >
                  <div className={s.postHeader}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {post.materia && <span className={s.postMateria}>{post.materia.nombre}</span>}
                      {post.isSolved && (
                        <span className={s.solvedBadge}>
                          <CheckCircle2 size={14} /> Solucionado
                        </span>
                      )}
                    </div>

                    <div style={{ position: 'relative' }}>
                      <button 
                        className={s.repostBtn} 
                        style={{ padding: '4px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === post.id ? null : post.id);
                        }}
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      <AnimatePresence>
                        {openMenuId === post.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            style={{ 
                              position: 'absolute', top: '100%', right: 0, zIndex: 50, 
                              background: 'var(--white)', border: '1px solid var(--border)', 
                              borderRadius: '8px', boxShadow: 'var(--shadow-md)', 
                              minWidth: '140px', overflow: 'hidden' 
                            }}
                          >
                            {user?.id === post.userId || isAdmin ? (
                              <button 
                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); handleDelete(post.id); }}
                                style={{ width: '100%', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', fontSize: '13px', fontWeight: 600 }}
                              >
                                <Trash2 size={14} /> Eliminar
                              </button>
                            ) : null}
                            <button 
                              onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); setReportingPost(post.id); }}
                              style={{ width: '100%', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: '13px' }}
                            >
                              <AlertTriangle size={14} /> Denunciar
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  
                  <h3 className={s.postTitle}>{post.titulo}</h3>
                  <p className={s.postPreview}>{post.contenido}</p>

                  {post.quotePost && (
                    <div className={s.quoteBox}>
                      <div className={s.quoteHeader}>
                         <div className={s.avatar} style={{width: '18px', height: '18px', fontSize: '9px'}}>
                           {post.quotePost.user.nombre?.charAt(0).toUpperCase()}
                         </div>
                         <span>{post.quotePost.user.nombre}</span>
                      </div>
                      <div className={s.quoteTitle}>{post.quotePost.titulo}</div>
                      <div className={s.quoteContent}>{post.quotePost.contenido}</div>
                    </div>
                  )}
                  
                  <div className={s.postFooter}>
                    <div className={s.authorInfo}>
                      <div className={s.avatar}>
                        {post.user.nombre?.charAt(0).toUpperCase() || 'E'}
                      </div>
                      <span>{post.user.nombre}</span>
                      <span style={{color: 'var(--text-3)'}}>•</span>
                      <span style={{color: 'var(--text-3)'}}>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className={s.stats}>
                      <button 
                        className={s.repostBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/forum/new?quoteId=${post.id}`);
                        }}
                      >
                        <Repeat size={14} /> Repostear
                      </button>
                      <div className={s.statItem}>
                        <Heart size={14} /> {post.likesCount}
                      </div>
                      <div className={s.statItem}>
                        <MessageSquare size={14} /> {post._count?.comments || 0}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <PipoEmptyState
                className={s.empty}
                variant="sleep"
                mascotSize={112}
                title="No se encontraron temas en esta categoría"
                description="Cambia de materia o crea el primer tema para abrir la conversación."
              />
            )}
          </div>
        )}

      </motion.div>

      {reportingPost && (
        <ReportModal 
          postId={reportingPost} 
          isOpen={!!reportingPost} 
          onClose={() => setReportingPost(null)} 
        />
      )}
    </div>
  );
}
