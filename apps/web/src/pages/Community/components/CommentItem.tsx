import React, { useState } from 'react';
import { Heart, MessageSquare, Send, X, CornerDownRight, CheckCircle2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../store';
import type { CommunityComment } from '../../../types/community';
import { toggleLikeComment, addReply } from '../../../features/community/communitySlice';
import { Button } from '../../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

import s from './CommentItem.module.css';

interface Props {
  comment: CommunityComment;
  postId: string;
  parentId?: string;
  isPostAuthor?: boolean;
}

export function CommentItem({ comment, postId, parentId, isPostAuthor }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const { user } = useSelector((state: RootState) => state.auth || { user: { id: 'u0', nombre: 'Test User' } });

  const handleLike = () => {
    dispatch(toggleLikeComment({ postId, commentId: comment.id, parentId }));
  };

  const handleReply = () => {
    if (!replyText.trim()) return;

    const newReply: CommunityComment = {
      id: `reply-${Date.now()}`,
      postId,
      author: { id: user?.id || 'u0', name: user?.nombre || 'Student' },
      text: replyText,
      createdAt: new Date().toISOString(),
      likes: 0,
      hasLiked: false,
      replyToId: comment.id,
      isLikedByAuthor: false
    };

    dispatch(addReply({ commentId: comment.id, reply: newReply }));
    setReplyText('');
    setShowReplyInput(false);
  };

  const timeAgo = (dateString: string) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `hace ${diffHours} h`;
    return `hace ${Math.floor(diffHours / 24)} d`;
  };

  return (
    <motion.div 
      className={s.commentContainer}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <div className={s.avatar}>
        {comment.author.name.charAt(0).toUpperCase()}
      </div>

      <div className={s.mainContent}>
        <div className={s.header}>
          <span className={s.authorName}>{comment.author.name}</span>
          {comment.isLikedByAuthor && (
            <span className={s.authorBadge} title="Al autor le gustó este comentario">
              <CheckCircle2 size={10} /> Autor
            </span>
          )}
          <span className={s.time}>{timeAgo(comment.createdAt)}</span>
        </div>

        <p className={s.text}>
          {comment.replyToId && <span style={{ color: 'var(--blue)', fontWeight: 500, marginRight: '4px' }}>@{comment.author.name}</span>}
          {comment.text}
        </p>

        <div className={s.footerActions}>
          <button 
            className={`${s.actionBtn} ${comment.hasLiked ? s.liked : ''}`}
            onClick={handleLike}
          >
            <Heart size={14} fill={comment.hasLiked ? 'currentColor' : 'none'} />
            {comment.likes > 0 && comment.likes}
          </button>

          {!parentId && (
            <button 
              className={s.actionBtn}
              onClick={() => setShowReplyInput(!showReplyInput)}
            >
              <MessageSquare size={14} />
              Responder
            </button>
          )}
        </div>

        {/* Inline Reply Input */}
        <AnimatePresence>
          {showReplyInput && (
            <motion.div 
              className={s.replyInputContainer}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <textarea 
                className={s.replyTextArea}
                placeholder={`Responder a ${comment.author.name}...`}
                autoFocus
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className={s.replyFormActions}>
                <Button variant="ghost" size="sm" onClick={() => setShowReplyInput(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" disabled={!replyText.trim()} onClick={handleReply}>
                  <Send size={14} /> Responder
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className={s.repliesList}>
            {comment.replies.map(reply => (
              <CommentItem 
                key={reply.id} 
                comment={reply} 
                postId={postId} 
                parentId={comment.id}
                isPostAuthor={isPostAuthor}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
