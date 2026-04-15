import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '../../../store';
import { Sparkles, Trophy } from 'lucide-react';
import s from './RightSidebar.module.css';

export function RightSidebar() {
  const { trendingTags, topContributors } = useSelector((state: RootState) => state.community);

  return (
    <div className={s.container}>
      {/* Pregunta del día */}
      <div className={`${s.widget} ${s.qotdWidget}`}>
        <div className={s.qotdTitle}>
          <Sparkles size={14} /> Pregunta del día
        </div>
        <p className={s.qotdQuestion}>
          ¿Alguien ha logrado memorizar las fechas clave de la Constitución de 1812?
        </p>
        <Link to="/comunidad/preguntas" className={s.qotdBtn}>Responder y ganar puntos</Link>
      </div>

      {/* Temas en Tendencia */}
      <div className={s.widget}>
        <h3 className={s.title}>Temas en tendencia</h3>
        <div className={s.tagsContainer}>
          {trendingTags.map(tag => (
            <Link key={tag} to={`/comunidad/tags/${tag.replace('#', '')}`} className={s.trendTag}>
              {tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Top Contribuidores */}
      <div className={s.widget}>
        <h3 className={s.title}>Top Contribuidores</h3>
        <div className={s.userList}>
          {topContributors.map((user, index) => (
            <div key={user.id} className={s.userInfo}>
              <div className={s.avatar} style={index === 0 ? { border: '2px solid #EF8F00', color: '#EF8F00' } : {}}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className={s.userName} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {user.name}
                  {index === 0 && <Trophy size={14} color="#EF8F00" />}
                </div>
                <div className={s.userPoints}>{user.points} puntos esta semana</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
