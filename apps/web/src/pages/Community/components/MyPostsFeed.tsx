import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { useAuthStore } from '../../../store/auth';
import { PostCard } from './PostCard';
import s from './CenterFeed.module.css';

export function MyPostsFeed() {
  const { posts } = useSelector((state: RootState) => state.community);
  const { user } = useAuthStore();
  const myPosts = posts.filter((p) => p.author.id === user?.id);

  return (
    <div className={s.feed}>
      <h2 className={s.feedTitle}>Mis publicaciones</h2>
      {myPosts.length === 0 ? (
        <p className={s.empty}>Aún no has publicado nada en la comunidad.</p>
      ) : (
        myPosts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}
