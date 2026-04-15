import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { forum as forumApi } from '../../../services/api';
import { Button } from '../../../components/ui/Button';
import { toast } from 'sonner';

interface ReportModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

const REASONS = [
  'Conteúdo inadequado ou ofensivo',
  'Spam ou publicidade não autorizada',
  'Desinformação ou notícias falsas',
  'Fuga total ao tema do fórum',
  'Assédio ou bullying',
  'Outro motivo'
];

export function ReportModal({ postId, isOpen, onClose }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error('Por favor, selecione um motivo.');
      return;
    }

    setLoading(true);
    try {
      await forumApi.reportPost(postId, selectedReason);
      toast.success('Denúncia enviada com sucesso. Nossa equipe irá analisar.');
      onClose();
    } catch (err) {
      toast.error('Erro ao enviar denúncia.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div 
        style={{ position: 'absolute', inset: 0, background: 'rgba(13, 21, 37, 0.4)', backdropFilter: 'blur(4px)' }} 
        onClick={onClose} 
      />
      
      <div style={{ position: 'relative', width: '100%', maxWidth: '440px', background: 'var(--white)', borderRadius: 'var(--radius-xl)', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--pp-blue)' }}>
            <AlertTriangle size={20} />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, fontFamily: 'var(--pp-font-heading)' }}>Denunciar Post</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          <p style={{ margin: '0 0 20px', fontSize: '14px', color: 'var(--text-2)', lineHeight: 1.5 }}>
            Se você acha que este post viola as regras da nossa comunidade, por favor, selecione o motivo abaixo.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
            {REASONS.map((r) => (
              <label 
                key={r} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '12px 16px', 
                  borderRadius: '12px', 
                  border: '1px solid var(--border)', 
                  cursor: 'pointer',
                  background: selectedReason === r ? 'var(--blue-soft)' : 'transparent',
                  borderColor: selectedReason === r ? 'var(--blue)' : 'var(--border)',
                  transition: 'all 0.2s'
                }}
              >
                <input 
                  type="radio" 
                  name="reason" 
                  value={r} 
                  checked={selectedReason === r}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  style={{ accentColor: 'var(--blue)' }}
                />
                <span style={{ fontSize: '14px', color: selectedReason === r ? 'var(--blue)' : 'var(--text-1)', fontWeight: selectedReason === r ? 600 : 400 }}>{r}</span>
              </label>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="secondary" fullWidth onClick={onClose}>Cancelar</Button>
            <Button variant="primary" fullWidth onClick={handleSubmit} disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Denúncia'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
