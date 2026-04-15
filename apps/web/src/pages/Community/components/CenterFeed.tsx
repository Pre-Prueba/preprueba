import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { PostComposer } from './PostComposer';
import { FeedFilters } from './FeedFilters';
import { PostCard } from './PostCard';
import { selectFilteredFeed } from '../../../features/community/communitySlice';

export function CenterFeed() {
  const { status } = useSelector((state: RootState) => state.community);
  const feed = useSelector((state: RootState) => selectFilteredFeed(state as any));

  return (
    <>
      <PostComposer />
      <FeedFilters />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {status === 'loading' && feed.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '40px' }}>
            Cargando publicaciones...
          </div>
        ) : feed.length > 0 ? (
          feed.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '40px', background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            No hay publicaciones en esta categoría.
          </div>
        )}
      </div>
    </>
  );
}
