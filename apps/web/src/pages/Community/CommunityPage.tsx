import { useEffect } from 'react';
import { useLocation, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchCommunityFeed, setFilterType, setFilterMateria, setFilterTag } from '../../features/community/communitySlice';

import s from './Community.module.css';
import { LeftSidebar } from './components/LeftSidebar';
import { CenterFeed } from './components/CenterFeed';
import { RightSidebar } from './components/RightSidebar';
import { PostDetailFeed } from './components/PostDetailFeed';

export function CommunityPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { status, posts } = useSelector((state: RootState) => state.community);
  const location = useLocation();

  useEffect(() => {
    if (status === 'idle' && posts.length === 0) {
      dispatch(fetchCommunityFeed({ type: 'TODO', materiaId: null, universidadId: null, query: '', tag: null }));
    }
  }, [status, posts.length, dispatch]);

  // Sincronizar Rotas do LeftSidebar com os Filtros do Feed
  useEffect(() => {
    const p = location.pathname;
    if (p === '/comunidad/preguntas') {
      dispatch(setFilterType('DUDA'));
      dispatch(setFilterMateria(null));
      dispatch(setFilterTag(null));
    } else if (p.startsWith('/comunidad/materias/')) {
      const matId = p.split('/').pop();
      dispatch(setFilterType('TODO'));
      dispatch(setFilterMateria(matId || null));
      dispatch(setFilterTag(null));
    } else if (p.startsWith('/comunidad/tags/')) {
      const tagQuery = p.split('/').pop();
      dispatch(setFilterType('TODO'));
      dispatch(setFilterMateria(null));
      dispatch(setFilterTag(tagQuery ? `#${tagQuery}` : null));
    } else if (p === '/comunidad' || p === '/comunidad/') {
      dispatch(setFilterType('TODO'));
      dispatch(setFilterMateria(null));
      dispatch(setFilterTag(null));
    }
  }, [location.pathname, dispatch]);

  return (
    <div className={s.communityLayout}>
      <aside className={s.leftSidebar}>
        <LeftSidebar />
      </aside>

      <main className={s.centerFeed}>
        <Routes>
          <Route path="post/:id" element={<PostDetailFeed />} />
          <Route path="*" element={<CenterFeed />} />
        </Routes>
      </main>

      <aside className={s.rightSidebar}>
        <RightSidebar />
      </aside>
    </div>
  );
}
