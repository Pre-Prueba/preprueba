import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, CheckCircle2, MessageCircle, MoreHorizontal, Trash2, AlertTriangle } from 'lucide-react';
import { forum as forumApi } from '../../services/api';
import { useAuthStore } from '../../store/auth';
import type { ForumPost } from '../../types';
import { Button } from '../../components/ui/Button';
import { ReportModal } from './components/ReportModal';
import { fadeUp } from '../../lib/animations';
import { toast } from 'sonner';
import s from './Forum.module.css';

export function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const handleDelete = async () => {
    if (!post) return;
    if (!window.confirm('Tem certeza que deseja excluir seu post permanentemente?')) return;
    try {
      await forumApi.deletePost(post.id);
      toast.success('Post excluído.');
      navigate('/forum');
    } catch (err) {
      toast.error('Erro ao excluir post.');
    }
  };

  useEffect(() => {
    if (id) {
      forumApi.get(id)
        .then(setPost)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleLikePost = async () => {
    if (!post) return;
    try {
      const { likes } = await forumApi.likePost(post.id);
      setPost({ ...post, likesCount: likes });
    } catch (err) { console.error(err); }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!post || !post.comments) return;
    try {
      const { likes } = await forumApi.likeComment(commentId);
      setPost({
        ...post,
        comments: post.comments.map(c => c.id === commentId ? { ...c, likesCount: likes } : c)
      });
    } catch (err) { console.error(err); }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newComment.trim()) return;
    setSubmitting(true);
    try {
      const comment = await forumApi.comment(id, newComment);
      setPost(prev => prev ? { ...prev, comments: [...(prev.comments || []), comment] } : null);
      setNewComment('');
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleAccept = async (commentId: string) => {
    if (!post || !id) return;
    try {
      await forumApi.accept(id, commentId);
      setPost({
        ...post,
        isSolved: true,
        acceptedCommentId: commentId,
        comments: post.comments?.map(c => ({
          ...c,
          isAccepted: c.id === commentId
        }))
      });
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className={s.forumPage}>Carregando tópico...</div>;
  if (!post) return <div className={s.forumPage}>Tópico não encontrado.</div>;

  const isAuthor = user?.id === post.userId;

  return (
    <div className={s.forumPage}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/forum')} style={{ marginBottom: '24px' }}>
          <ArrowLeft size={16} /> Voltar ao fórum
        </Button>

        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <div className={s.postCard} style={{ cursor: 'default', borderBottom: '2px solid var(--blue-soft)' }}>
          <div className={s.postHeader}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {post.materia && <span className={s.postMateria}>{post.materia.nombre}</span>}
              {post.isSolved && (
                <span className={s.solvedBadge}>
                  <CheckCircle2 size={14} /> Resolvido
                </span>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <button 
                className={s.repostBtn} 
                style={{ padding: '6px' }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <MoreHorizontal size={20} />
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    style={{ position: 'absolute', top: '100%', right: 0, zIndex: 50, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: 'var(--shadow-md)', minWidth: '130px', overflow: 'hidden' }}
                  >
                    {user?.id === post.userId || isAdmin ? (
                      <button 
                        onClick={() => { setIsMenuOpen(false); handleDelete(); }}
                        style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', fontSize: '13px', fontWeight: 600 }}
                      >
                        <Trash2 size={14} /> Excluir Post
                      </button>
                    ) : null}
                    <button 
                      onClick={() => { setIsMenuOpen(false); setIsReporting(true); }}
                      style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: '13px' }}
                    >
                      <AlertTriangle size={14} /> Denunciar Post
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--pp-font-heading)', color: 'var(--text)' }}>
              {post.titulo}
            </h1>
            <p style={{ fontSize: '16px', lineHeight: 1.6, color: 'var(--text-1)' }}>{post.contenido}</p>
            
            <div className={s.postFooter} style={{border: 'none', padding: 0}}>
               <div className={s.authorInfo}>
                  <div className={s.avatar}>{post.user.nombre?.charAt(0).toUpperCase()}</div>
                  <strong>{post.user.nombre}</strong>
                  <span style={{color:'var(--text-3)'}}>{new Date(post.createdAt).toLocaleDateString()}</span>
               </div>
               <Button variant="secondary" size="sm" onClick={handleLikePost}>
                  <Heart size={14} fill={post.likesCount > 0 ? 'currentColor' : 'none'} /> {post.likesCount} curtidas
               </Button>
            </div>
          </div>

          <div style={{ marginTop: '40px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageCircle size={20} /> {(post.comments?.length || 0)} Respostas
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {post.comments?.map((comment) => (
                <div 
                  key={comment.id} 
                  style={{ 
                    padding: '24px', 
                    borderRadius: 'var(--radius-lg)', 
                    background: comment.isAccepted ? '#f0fdf4' : 'var(--white)',
                    border: comment.isAccepted ? '1px solid #bbf7d0' : '1px solid var(--border)',
                    position: 'relative'
                  }}
                >
                  {comment.isAccepted && (
                    <div style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--success)', fontWeight: 700, fontSize: '11px', display:'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={14} /> SOLUÇÃO ACEITA
                    </div>
                  )}
                  
                  <div className={s.authorInfo} style={{ marginBottom: '12px' }}>
                    <div className={s.avatar} style={{width: '20px', height: '20px', fontSize: '8px'}}>{comment.user.nombre?.charAt(0).toUpperCase()}</div>
                    <span style={{fontWeight: 600, fontSize: '13px'}}>{comment.user.nombre}</span>
                  </div>
                  
                  <p style={{ fontSize: '14px', color: 'var(--text-2)', lineHeight: 1.5, marginBottom: '16px' }}>
                    {comment.contenido}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button variant="ghost" size="sm" onClick={() => handleLikeComment(comment.id)} style={{fontSize: '11px', padding: '4px 8px'}}>
                       <Heart size={12} fill={comment.likesCount > 0 ? 'currentColor' : 'none'} /> {comment.likesCount}
                    </Button>

                    {isAuthor && !post.isSolved && (
                      <Button variant="primary" size="sm" style={{fontSize: '11px', background: 'var(--success)', color: 'white'}} onClick={() => handleAccept(comment.id)}>
                        Marcar como Solução
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Post comment box */}
            <form onSubmit={handleComment} style={{ marginTop: '32px', padding: '24px', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
               <textarea 
                 value={newComment}
                 onChange={(e) => setNewComment(e.target.value)}
                 placeholder="Escreva sua resposta ou dúvida sobre o tópico..."
                 style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '16px', resize: 'vertical', fontFamily: 'inherit', fontSize: '14px' }}
               />
               <Button variant="primary" type="submit" disabled={submitting || !newComment.trim()}>
                 {submitting ? 'Enviando...' : 'Postar Resposta'}
               </Button>
            </form>
          </div>
        </motion.div>
      </div>

      {isReporting && post && (
        <ReportModal 
          postId={post.id} 
          isOpen={isReporting} 
          onClose={() => setIsReporting(false)} 
        />
      )}
    </div>
  );
}
