import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import type { PostType } from '../../../types/community';
import { setFilterType } from '../../../features/community/communitySlice';

import s from './FeedFilters.module.css';

const TABS: { label: string; value: PostType | 'TODO' }[] = [
  { label: 'Todo', value: 'TODO' },
  { label: 'Dudas', value: 'DUDA' },
  { label: 'Fotos', value: 'FOTO' },
  { label: 'Consejos', value: 'CONSEJO' },
  { label: 'Logros', value: 'LOGRO' },
];

export function FeedFilters() {
  const dispatch = useDispatch();
  const currentType = useSelector((state: RootState) => state.community.filters.type);

  return (
    <div className={s.filterContainer}>
      {TABS.map(tab => (
        <button
          key={tab.value}
          className={`${s.tabBtn} ${currentType === tab.value ? s.active : ''}`}
          onClick={() => dispatch(setFilterType(tab.value))}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
