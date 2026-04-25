import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, Send } from 'lucide-react';
import type { RootState, AppDispatch } from '../../../store';
import { useAuthStore } from '../../../store/auth';
import { PostCard } from './PostCard';
import { CommentItem } from './CommentItem';
import { Button } from '../../../components/ui/Button';
import { addComment } from '../../../features/community/communitySlice';
import type { CommunityComment } from '../../../types/community';
import { motion, AnimatePresence } from 'framer-motion';

export function PostDetailFeed() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { posts } = useSelector((state: RootState) => state.community);
  const { user } = useAuthStore();
  
  const post = posts.find((p) => p.id === id);
  const [commentText, setCommentText] = useState('');

  if (!post) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)' }}>
        <p>Publicación no encontrada.</p>
        <Button variant="ghost" onClick={() => navigate('/comunidad')}>Volver a la Comunidad</Button>
      </div>
    );
  }

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    const newComment: CommunityComment = {
      id: `comment-${Date.now()}`,
      postId: post.id,
      author: { id: user?.id || 'u0', name: user?.nombre || 'Student' },
      text: commentText,
      createdAt: new Date().toISOString(),
      likes: 0,
      hasLiked: false,
      replies: [],
      isLikedByAuthor: false
    };

    dispatch(addComment(newComment));
    setCommentText('');
  };

  const isPostAuthor = user?.id === post.author.id;

  return (
    <motion.div 
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Navigator Back */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          marginBottom: '8px', 
          cursor: 'pointer', 
          color: 'var(--text-2)',
          width: 'fit-content',
          transition: 'transform 0.2s ease'
        }} 
        onClick={() => navigate(-1)}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
      >
        <ArrowLeft size={18} />
        <span style={{ fontWeight: 500, fontSize: '14px' }}>Volver</span>
      </div>

      {/* The Post itself */}
      <PostCard post={post} />

      {/* Comments section */}
      <div style={{ 
        background: 'var(--white)', 
        borderRadius: 'var(--radius-xl)', 
        padding: 'var(--space-6)', 
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: 700, 
          color: 'var(--text-1)', 
          marginBottom: 'var(--space-6)',
          letterSpacing: '-0.02em'
        }}>
          Comentarios ({post.metrics.comments})
        </h3>
        
        {/* Composer de Comentario Principal */}
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          marginBottom: 'var(--space-8)',
          paddingBottom: 'var(--space-6)',
          borderBottom: '1px solid var(--gray-1)'
        }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--blue-soft), var(--gray-2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            color: 'var(--blue)',
            flexShrink: 0 
          }}>
            {user?.nombre?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Escribe un comentario..." 
              style={{ 
                width: '100%', 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--radius-lg)', 
                padding: '16px', 
                minHeight: '100px', 
                fontSize: '15px',
                background: 'var(--gray-0)',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--blue)';
                e.currentTarget.style.boxShadow = '0 0 0 4px var(--blue-soft)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <div style={{ alignSelf: 'flex-end' }}>
              <Button 
                variant="primary" 
                disabled={!commentText.trim()} 
                onClick={handleAddComment}
                style={{ height: '44px', padding: '0 24px', borderRadius: 'var(--radius-full)' }}
              >
                <Send size={18} style={{ marginRight: '8px' }} /> Comentar
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de Comentários Real */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence initial={false}>
            {post.comments.length > 0 ? (
              post.comments.map(c => (
                <CommentItem 
                  key={c.id} 
                  comment={c} 
                  postId={post.id} 
                  isPostAuthor={isPostAuthor}
                />
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ textAlign: 'center', padding: '40px', color: 'var(--text-3)' }}
              >
                No hay comentarios aún. ¡Sé o primeiro en comentar!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
