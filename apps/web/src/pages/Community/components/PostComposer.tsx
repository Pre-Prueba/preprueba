import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Image as ImageIcon, MessageCircleQuestion, Lightbulb, Medal, Send } from 'lucide-react';
import type { RootState, AppDispatch } from '../../../store';
import type { PostType } from '../../../types/community';
import { addPost } from '../../../features/community/communitySlice';
import { Button } from '../../../components/ui/Button';

import s from './PostComposer.module.css';

const TYPE_OPTIONS: { icon: any; label: string; value: PostType }[] = [
  { icon: MessageCircleQuestion, label: 'Duda', value: 'DUDA' },
  { icon: ImageIcon, label: 'Foto', value: 'FOTO' },
  { icon: Lightbulb, label: 'Consejo', value: 'CONSEJO' },
  { icon: Medal, label: 'Logro', value: 'LOGRO' },
];

export function PostComposer() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth || { user: { id: 'u0', nombre: 'Test User' } });
  const { popularMaterias } = useSelector((state: RootState) => state.community);

  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [selectedType, setSelectedType] = useState<PostType>('DUDA');
  const [selectedMateria, setSelectedMateria] = useState('');

  const avatarKey = user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U';

  const handlePublish = () => {
    if (!content.trim()) return;

    // Dispatch adding an optimistic post
    const materiaName = popularMaterias.find(m => m.id === selectedMateria)?.name;

    dispatch(addPost({
      id: `new-${Date.now()}`,
      type: selectedType,
      content,
      author: { id: user?.id || 'u0', name: user?.nombre || 'Student' },
      materiaId: selectedMateria,
      materiaName,
      tags: [],
      metrics: { likes: 0, comments: 0, reposts: 0 },
      hasLiked: false,
      hasSaved: false,
      createdAt: new Date().toISOString()
    }));

    // Reset state
    setContent('');
    setExpanded(false);
  };

  return (
    <div className={s.composerCard}>
      <div className={s.inputGroup}>
        <div className={s.avatar}>{avatarKey}</div>
        <div className={s.inputArea}>
          {!expanded ? (
            <div className={s.pseudoInput} onClick={() => setExpanded(true)}>
              Comparte una duda, una foto estudiando o pide un consejo...
            </div>
          ) : (
            <textarea
              className={s.textArea}
              placeholder="Comparte una duda, una foto estudiando o pide un consejo..."
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
          )}

          {expanded && (
            <div className={s.tagsMateriaSelect}>
              <select 
                className={s.selectMateria} 
                value={selectedMateria} 
                onChange={e => setSelectedMateria(e.target.value)}
              >
                <option value="">Cualquier materia (Opcional)</option>
                {popularMaterias.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className={s.composerActions}>
        <div className={s.typeButtons}>
          {TYPE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`${s.typeBtn} ${selectedType === opt.value ? s.active : ''}`}
              onClick={() => {
                setSelectedType(opt.value);
                if (!expanded) setExpanded(true);
              }}
            >
              <opt.icon size={16} />
              {opt.label}
            </button>
          ))}
        </div>

        {expanded && (
          <div className={s.publishGroup}>
            <Button variant="ghost" onClick={() => setExpanded(false)}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={handlePublish}
              disabled={!content.trim()}
            >
              <Send size={16} /> Publicar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
