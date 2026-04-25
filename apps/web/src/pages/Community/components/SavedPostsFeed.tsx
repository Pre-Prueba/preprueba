import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { PostCard } from './PostCard';
import s from './CenterFeed.module.css';

export function SavedPostsFeed() {
  const { posts, savedPostsIds } = useSelector((state: RootState) => state.community);
  const savedPosts = posts.filter((p) => savedPostsIds.includes(p.id));

  return (
    <div className={s.feed}>
      <h2 className={s.feedTitle}>Guardados</h2>
      {savedPosts.length === 0 ? (
        <p className={s.empty}>No tienes publicaciones guardadas.</p>
      ) : (
        savedPosts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}
