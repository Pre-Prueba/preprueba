import type { MouseEvent } from 'react';
import { Heart, MessageSquare, Repeat, Bookmark, MoreHorizontal, Star } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../../store';
import type { CommunityPost } from '../../../types/community';
import { toggleLikePost, toggleSavePost, selectTopContributorId } from '../../../features/community/communitySlice';

import s from './PostCard.module.css';

interface Props {
  post: CommunityPost;
}

const TYPE_CONFIG = {
  DUDA: { label: 'Duda', className: s.typeDuda },
  LOGRO: { label: 'Logro', className: s.typeLogro },
  CONSEJO: { label: 'Consejo', className: s.typeConsejo },
  FOTO: { label: 'Foto', className: s.typeFoto },
  DEBATE: { label: 'Debate', className: s.typeDebate },
};

function timeAgo(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `hace ${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `hace ${diffHours} h`;
  return `hace ${Math.floor(diffHours / 24)} d`;
}

export function PostCard({ post }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const isSaved = useSelector((state: RootState) => state.community.savedPostsIds.includes(post.id));
  const topContributorId = useSelector((state: RootState) => selectTopContributorId(state as any));

  const isTopContributor = post.author.id === topContributorId;
  const avatarKey = post.author.name.charAt(0).toUpperCase();
  const config = TYPE_CONFIG[post.type];

  // Prevent parent click when clicking buttons
  const executeAction = (e: MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleCardClick = () => {
    navigate(`/comunidad/post/${post.id}`);
  };

  const navigateToTag = (e: MouseEvent, tag: string) => {
    e.stopPropagation();
    navigate(`/comunidad/tags/${tag.replace('#', '')}`);
  };

  return (
    <div className={s.card} onClick={handleCardClick}>
      {/* Header */}
      <div className={s.header}>
        <div className={s.authorInfo}>
          <div className={s.avatar}>{avatarKey}</div>
          <div>
            <div className={s.authorName} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {post.author.name}
              {isTopContributor && <Star size={14} color="#EF8F00" fill="#EF8F00" />}
            </div>
            <div className={s.metaInfo}>
              <span>{timeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className={`${s.typeBadge} ${config.className}`}>
            {config.label}
          </div>
          <button className={s.actionBtn} onClick={(e) => executeAction(e, () => {})}>
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={s.content}>
        {post.title && <h3 className={s.title}>{post.title}</h3>}
        <p className={s.text}>{post.content}</p>
        
        {post.imageUrl && (
          <img src={post.imageUrl} alt="Contenido del post" className={s.image} />
        )}
      </div>

      {/* Meta tags */}
      <div className={s.tags}>
        {post.materiaName && (
          <span className={s.tag}>{post.materiaName}</span>
        )}
        {post.universidadName && (
          <span className={`${s.tag} ${s.regularTag}`}>{post.universidadName}</span>
        )}
        {post.tags.map(t => (
          <span 
            key={t} 
            className={`${s.tag} ${s.regularTag}`} 
            onClick={(e) => navigateToTag(e, t)}
            style={{ cursor: 'pointer' }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className={s.actions}>
        <button 
          className={`${s.actionBtn} ${post.hasLiked ? s.liked : ''}`}
          onClick={(e) => executeAction(e, () => dispatch(toggleLikePost(post.id)))}
        >
          <Heart size={18} fill={post.hasLiked ? 'currentColor' : 'none'} />
          {post.metrics.likes > 0 && post.metrics.likes}
        </button>
        
        <button className={s.actionBtn}>
          <MessageSquare size={18} />
          {post.metrics.comments > 0 && post.metrics.comments}
        </button>

        <button className={s.actionBtn}>
          <Repeat size={18} />
          {post.metrics.reposts > 0 && post.metrics.reposts}
        </button>

        <span style={{flex: 1}}></span>

        <button 
          className={`${s.actionBtn} ${isSaved ? s.saved : ''}`}
          onClick={(e) => executeAction(e, () => dispatch(toggleSavePost(post.id)))}
        >
          <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
}
