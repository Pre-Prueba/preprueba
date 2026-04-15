import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { forum as forumApi, materias as materiasApi } from '../../services/api';
import type { Materia, ForumPost } from '../../types';
import { Button } from '../../components/ui/Button';
import s from './Forum.module.css';

export function CreatePostPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quoteId = searchParams.get('quoteId');

  const [materias, setMaterias] = useState<Materia[]>([]);
  const [quotePost, setQuotePost] = useState<ForumPost | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    materiaId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    materiasApi.list().then(setMaterias).catch(console.error);

    if (quoteId) {
      forumApi.get(quoteId)
        .then(post => {
          setQuotePost(post);
          // Auto-fill materia if quoting
          if (post.materiaId) {
            setFormData(prev => ({ ...prev, materiaId: post.materiaId! }));
          }
        })
        .catch(console.error);
    }
  }, [quoteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.contenido || !formData.materiaId) {
      setError('Por favor, preencha todos os campos e escolha uma matéria.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const post = await forumApi.create({
        ...formData,
        quotePostId: quoteId || undefined
      });
      navigate(`/forum/${post.id}`);
    } catch (err) {
      setError('Erro ao criar o tópico. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.forumPage}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/forum')} style={{ marginBottom: '24px' }}>
          <ArrowLeft size={16} /> Cancelar
        </Button>

        <h1 className={s.title}>Novo Tópico</h1>
        <p className={s.subtitle} style={{ marginBottom: '32px' }}>
          Compartilhe sua dúvida ou conhecimento com a comunidade.
        </p>

        <form onSubmit={handleSubmit} style={{ background: 'var(--white)', padding: '32px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && <div style={{ color: 'var(--error)', fontSize: '14px', background: 'var(--error-bg)', padding: '12px', borderRadius: '8px' }}>{error}</div>}
          
          {quotePost && (
            <div className={s.quoteBox} style={{ marginBottom: '0', pointerEvents: 'auto' }}>
              <div className={s.quoteHeader}>
                 <div className={s.avatar} style={{width: '16px', height: '16px', fontSize: '8px'}}>
                    {quotePost.user.nombre?.charAt(0).toUpperCase()}
                 </div>
                 <span>Repostando tópico de <strong>{quotePost.user.nombre}</strong></span>
              </div>
              <div className={s.quoteTitle}>{quotePost.titulo}</div>
              <div className={s.quoteContent}>{quotePost.contenido}</div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-2)', marginBottom: '8px' }}>
              Em qual matéria você quer postar?
            </label>
            <select 
              value={formData.materiaId}
              onChange={(e) => setFormData({ ...formData, materiaId: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', fontFamily: 'inherit' }}
            >
              <option value="">Selecione uma matéria...</option>
              {materias.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-2)', marginBottom: '8px' }}>
              Título do Tópico
            </label>
            <input 
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Ex: Dúvida sobre respiração celular em Biologia"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', fontFamily: 'inherit' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-2)', marginBottom: '8px' }}>
              Conteúdo
            </label>
            <textarea 
              value={formData.contenido}
              onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
              placeholder="Descreva sua dúvida com detalhes..."
              style={{ width: '100%', minHeight: '200px', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          <Button variant="primary" size="lg" type="submit" disabled={loading} style={{ marginTop: '12px' }}>
            {loading ? 'Publicando...' : <><Send size={18} /> Publicar no Fórum</>}
          </Button>
        </form>
      </div>
    </div>
  );
}
