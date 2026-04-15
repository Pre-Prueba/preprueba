import { useEffect, useState } from 'react';
import { stats } from '../../services/api';
import s from './Dashboard.module.css';

interface UserRank {
  id: string;
  nombre: string;
  aciertos: number;
}

export function LeaderboardWidget() {
  const [ranking, setRanking] = useState<UserRank[]>([]);

  useEffect(() => {
    stats.ranking()
      .then(setRanking)
      .catch(() => {/* silent */});
  }, []);

  if (ranking.length === 0) return null;

  return (
    <div className={s.rankingCard}>
      <p className={s.statsCardLabel}>Sala de Estudos</p>

      <div className={s.rankingList}>
        {ranking.map((user, idx) => {
          const isMe = idx === 1; // Demo: second position is "you"
          return (
            <div key={user.id} className={`${s.rankItem} ${isMe ? s.rankItemMe : ''}`}>
              <span className={s.rankPos}>0{idx + 1}</span>
              <span className={`${s.rankName} ${isMe ? s.rankNameMe : ''}`}>
                {isMe ? 'Você' : user.nombre}
              </span>
              <span className={s.rankXp}>{user.aciertos.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
