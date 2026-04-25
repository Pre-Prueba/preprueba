import { GraduationCap } from 'lucide-react';
import s from './CenterFeed.module.css';

export function UniversitiesFeed() {
  return (
    <div className={s.feed}>
      <h2 className={s.feedTitle}>Universidades</h2>
      <div className={s.empty} style={{ textAlign: 'center', padding: '48px 24px' }}>
        <GraduationCap size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
        <p>Próximamente podrás filtrar el feed por universidad.</p>
      </div>
    </div>
  );
}
